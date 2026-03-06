const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: [true, "Medicine name is required"],
    trim: true
  },

  description: {
    type: String,
    required: [true, "Description is required"]
  },

  price: {
    type: Number,
    required: [true, "Price is required"],
    min: 0
  },

  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: 0
  },

  brand: {
    type: String,
    required: [true, "Brand is required"]
  },

  category: {
    type: String,
    required: [true, "Category is required"]
  },

  image: {
    type: String
  },

  expiryDate: {
    type: Date,
    required: [true, "Expiry date is required"]
  },

  prescriptionRequired: {
    type: Boolean,
    default: false
  },

  manufacturer: {
    type: String
  },

  lowStockThreshold: {
    type: Number,
    default: 10
  }

},
{ timestamps: true }
);

const MedicineModel = mongoose.model("Medicine", medicineSchema);

module.exports = MedicineModel;