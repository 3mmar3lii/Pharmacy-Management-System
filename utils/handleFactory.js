const catchAsync = require("./catchAsync");
const AppError = require("./AppError");
const populateOptions = require("../helpers/populateOptions");

const getOne = (Model, options) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    query = populateOptions(options, query);
    const doc = await query;

    if (!doc) {
      return next(new AppError("No document found with this ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });
};

const getAll = (Model, options) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.find();
    query = populateOptions(options, query);
    const doc = await query;

    if (!doc || doc.length === 0) {
      return next(new AppError("No documents found", 404));
    }

    res.status(200).json({
      status: "success",
      length: doc.length,
      data: doc,
    });
  });
};
const createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: doc,
    });
  });
};

const updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with this ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });
};

const deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with this ID", 404));
    }

    res.status(204).json(null);
  });
};

module.exports = { getOne, createOne, updateOne, deleteOne, getAll };
