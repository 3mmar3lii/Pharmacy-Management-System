const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      minlength: [8, "Username must be at least 8 characters"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      validate: {
        validator: function (e) {
          //return /^[a-zA-Z]{3,5}[0-9]{3}(@)(gmail|yahoo|linkedin)(.com)/.test(e);
        }
      }
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      minlength: [3, "First name must be at least 3 characters"],
      maxlength: [15, "First name must be at most 15 characters"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minlength: [3, "Last name must be at least 3 characters"],
      maxlength: [15, "Last name must be at most 15 characters"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "user","Pharmacist"],
      required: true,
      default:"user"
    },
  },
  { timestamps: true },
);


// hash password 
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
})
const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
