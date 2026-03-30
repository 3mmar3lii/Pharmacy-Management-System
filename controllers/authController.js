const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const UserModel = require("../models/User");

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



module.exports = { login, updatePassword, signup };
