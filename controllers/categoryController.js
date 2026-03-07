const CategoryModel = require("../models/Category");
const AppError = require("../utils/AppError");
const handleFactory = require("../utils/handleFactory");

exports.createCategory = handleFactory.createOne(CategoryModel);

exports.getAllCategories = handleFactory.getAll(CategoryModel);

exports.getCategory = handleFactory.getOne(CategoryModel);

exports.updateCategory = handleFactory.updateOne(CategoryModel);

exports.deleteCategory = handleFactory.deleteOne(CategoryModel);
