const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const UserModel = require("../models/User");
const sendEmail = require("../services/emailService");

const signup = catchAsync(async (req, res, next) => {
  const { 
    email, password, role,
    pharmacyName, ownerName, whatsapp, landline, pharmacyType // frontend new fields
  } = req.body;
  
  // Extract or fallback for existing required fields
  const username = req.body.username || email.split('@')[0] + Math.random().toString(36).substring(2, 6);
  const firstName = req.body.firstName || (ownerName ? ownerName.split(' ')[0] : 'Pharmacy');
  const lastName = req.body.lastName || (ownerName ? ownerName.split(' ').slice(1).join(' ') || 'Owner' : 'Owner');
  const phone = req.body.phone || whatsapp;
  const address = req.body.address;

  const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return next(new AppError("User with this email or username already exists", 400));
  }

  const newUser = await UserModel.create({
    username,
    email,
    password,
    firstName,
    lastName,
    phone,
    address,
    role: role || 'user',
    pharmacyName,
    pharmacyOwnerName: ownerName,
    whatsappNumber: whatsapp,
    pharmacyLandlineNumber: landline,
    pharmacyType
  });

  const token = jwt.sign(
    { id: newUser._id, role: newUser.role },
    process.env.JSON_WEBTOKEN_KEY,
  );
  
  newUser.token = token;
  await newUser.save();

  // Set the token inside a cookie
  res.cookie("token", token, {
    maxAge: 30 * 24 * 60 * 60 * 1000, 
    httpOnly: false, // allowing FE to read if necessary
    sameSite: 'Lax',
  });

  res.status(201).json({ token, user: newUser });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const user = await UserModel.findOne({ email }).lean();
  if (!user) {
    return next(new AppError("Error in user", 404));
  }
  // compare password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return next(new AppError("Not valid password compare", 401));
  }
  // create token and return to user
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JSON_WEBTOKEN_KEY,
  );
  
  await UserModel.findByIdAndUpdate(user._id, { token });
  user.token = token;

  // Set the token inside a cookie
  res.cookie("token", token, {
    maxAge: 30 * 24 * 60 * 60 * 1000, 
    httpOnly: false,
    sameSite: 'Lax',
  });

  res.status(200).json({ token, user });
});

const updatePassword = catchAsync(async (req, res, next) => {
  console.log("inside the updatePassword ");
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword) {
    return next(new AppError("error in current password", 400));
  }
  // get user from the database
  const user = await UserModel.findById(req.userId);
  // check if user exist
  if (!user) {
    return next(new AppError("user not found", 400));
  }
  // check if old password == new password
  let valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return next(new AppError("mismatch password", 400));
  }
  // update the password
  user.password = newPassword;
  await user.save();
  // create new token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JSON_WEBTOKEN_KEY,
  );
  
  user.token = token;
  await user.save();

  res.status(200).json({ token, user });
});


const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with that email address.", 404));
  }

  // 2) Generate the random reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `http://localhost:4200/reset-password?token=${resetToken}`;

  const message = `
    <h1>Forgot your password?</h1>
    <p>Submit a PATCH request with your new password to: <a href="${resetURL}">${resetURL}</a>.</p>
    <p>If you didn't forget your password, please ignore this email!</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      html: message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    console.error('Email sending error:', err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!", 500)
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // 3) Log the user in, send JWT
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JSON_WEBTOKEN_KEY,
  );
  
  user.token = token;
  await user.save({ validateBeforeSave: false });

  res.cookie("token", token, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: false,
    sameSite: 'Lax',
  });

  res.status(200).json({
    status: "success",
    token,
    user
  });
});

module.exports = { login, updatePassword, signup, forgotPassword, resetPassword };
