const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
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
  },
  { timestamps: true },
);

const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
