const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
    {
        nameEn: {
            type: String,
            required: [true, "English name is required"],
            unique: true,
            trim: true,
        },
        nameAr: {
            type: String,
            required: [true, "Arabic name is required"],
            unique: true,
            trim: true,
        },
        category: {
            type: mongoose.Schema.ObjectId,
            ref: "Category",
            required: [true, "SubCategory must belong to a parent category"],
        },
    },
    { timestamps: true }
);

const SubCategoryModel = mongoose.model("SubCategory", subCategorySchema);

module.exports = SubCategoryModel;
