const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const UserModel = require("../models/User");

const signup = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone, address, role } = req.body;
    
    const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ msg: "User with this email or username already exists" });
    }

    const newUser = await UserModel.create({
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      role: role 
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JSON_WEBTOKEN_KEY,
    );
    
    newUser.token = token;
    await newUser.save();

    res.status(201).json({ token, user: newUser });

  } catch (err) {
    console.log("Signup error:", err);
    return res.status(500).json({ msg: "Server error during signup" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({});
    }
    const user = await UserModel.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({ msg: "Error in user" });
    }
    // compare password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ msg: "Not valid password compare" });
    }
    // create token and return to user
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JSON_WEBTOKEN_KEY,
    );
    
    await UserModel.findByIdAndUpdate(user._id, { token });
    user.token = token;

    res.status(200).json({ token });
  } catch (err) {
    console.log(err);
    return res.status(500).json({});
  }
};

const updatePassword = async (req, res) => {
  try {
    console.log("inside the updatePassword ");
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword) {
      return res.status(400).json({ msg: "error in current password" });
    }
    // get user from the database
    const user = await UserModel.findById(req.userId);
    // check if user exist
    if (!user) {
      return res.status(400).json({ msg: "user not found" });
    }
    // check if old password == new password
    let valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ msg: "mismatch password" });
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
  } catch (err) {
    console.log("Error while update the password", err);
    res.status(500).json({ msg: `Server error ${err}` });
  }
};



module.exports = { login, updatePassword, signup };
