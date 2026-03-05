const SubCategoryModel = require("../models/SubCategory");
const AppError = require("../utils/AppError");

exports.setCategoryIdToBody = (req, res, next) => {
    if (!req.body.category) req.body.category = req.params.categoryId;
    next();
};

exports.createFilterObj = (req, res, next) => {
    let filterObject = {};
    if (req.params.categoryId) filterObject = { category: req.params.categoryId };
    req.filterObj = filterObject;
    next();
};

exports.createSubCategory = async (req, res, next) => {
    try {
        const { nameEn, nameAr, category } = req.body;
        if (!nameEn || !nameAr || !category) {
            return next(
                new AppError("nameEn, nameAr and category are required", 400)
            );
        }
        const newSubCategory = await SubCategoryModel.create({
            nameEn,
            nameAr,
            category,
        });
        res.status(201).json({
            status: "success",
            data: { subcategory: newSubCategory },
        });
    } catch (error) {
        if (error.code === 11000) {
            return next(new AppError("SubCategory name already exists", 400));
        }
        next(error);
    }
};

exports.getAllSubCategories = async (req, res, next) => {
    try {
        const subCategories = await SubCategoryModel.find(req.filterObj).populate({
            path: "category",
            select: "nameEn nameAr -_id",
        });
        res.status(200).json({
            status: "success",
            results: subCategories.length,
            data: { subcategories: subCategories },
        });
    } catch (error) {
        next(error);
    }
};

exports.getSubCategory = async (req, res, next) => {
    try {
        const subCategory = await SubCategoryModel.findById(req.params.id).populate({
            path: "category",
            select: "nameEn nameAr -_id",
        });
        if (!subCategory) {
            return next(new AppError("No subcategory found with that ID", 404));
        }
        res.status(200).json({
            status: "success",
            data: { subcategory: subCategory },
        });
    } catch (error) {
        next(error);
    }
};

exports.updateSubCategory = async (req, res, next) => {
    try {
        const subCategory = await SubCategoryModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        if (!subCategory) {
            return next(new AppError("No subcategory found with that ID", 404));
        }
        res.status(200).json({
            status: "success",
            data: { subcategory: subCategory },
        });
    } catch (error) {
        if (error.code === 11000) {
            return next(new AppError("SubCategory name already exists", 400));
        }
        next(error);
    }
};

exports.deleteSubCategory = async (req, res, next) => {
    try {
        const subCategory = await SubCategoryModel.findByIdAndDelete(req.params.id);
        if (!subCategory) {
            return next(new AppError("No subcategory found with that ID", 404));
        }
        res.status(204).json({
            status: "success",
            data: null,
        });
    } catch (error) {
        next(error);
    }
};
