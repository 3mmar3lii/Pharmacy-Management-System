const mongoose = require("mongoose");

const medcineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
    },
    image: {
        type: String,
        required: [true, "Image is required"],
    },
    category: {
        type: Object,
        required: [true, "Category is required"],
    },
    brand: {
        type: String,
        required: [true, "Brand is required"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const MedcineModel = mongoose.model("Medcine", medcineSchema);

module.exports = MedcineModel;