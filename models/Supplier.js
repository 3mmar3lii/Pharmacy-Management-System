const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Supplier name is required"],
            trim: true,
            unique: true,
        },
        contact: {
            type: String,
            required: [true, "Contact person name is required"],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        address: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const SupplierModel = mongoose.model("Supplier", supplierSchema);

module.exports = SupplierModel;