const CategoryModel = require("../models/Category");
const AppError = require("../utils/AppError");

exports.createCategory = async (req, res, next) => {
  try {
    const { nameEn, nameAr } = req.body;
    if (!nameEn || !nameAr) {
      return next(new AppError("nameEn and nameAr are required", 400));
    }
    const newCategory = await CategoryModel.create({ nameEn, nameAr });
    res.status(201).json({
      status: "success",
      data: { category: newCategory },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError("Category name already exists", 400));
    }
    next(error);
  }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await CategoryModel.find();
    res.status(200).json({
      status: "success",
      results: categories.length,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const category = await CategoryModel.findById(req.params.id);
    if (!category) {
      return next(new AppError("No category found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await CategoryModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!category) {
      return next(new AppError("No category found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: { category },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError("Category name already exists", 400));
    }
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await CategoryModel.findByIdAndDelete(req.params.id);
    if (!category) {
      return next(new AppError("No category found with that ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
