const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Supplier email is required"],
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Supplier phone number is required"],
    },
    address: {
      type: String,
      required: [true, "Supplier address is required"],
    },
    contactPerson: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
