const mongoose = require("mongoose");

const medcineSchema = new mongoose.Schema(
  {
    nameEn: {
      type: String,
      required: [true, "English name is required"],
      trim: true,
      index: true,
    },
    nameAr: {
      type: String,
      required: [true, "Arabic name is required"],
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    image: {
      type: String,
      default: "default-medicine.png",
    },
    category: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Category",
      required: [true, "Category is required"],
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    expiryDate: {
      type: Date,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const MedcineModel = mongoose.model("Medcine", medcineSchema);

module.exports = MedcineModel;
