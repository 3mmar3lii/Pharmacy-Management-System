const Prescription = require("../models/Prescriptions");
const imagekit = require("../utils/imgKit");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

/**
 * @desc    Upload a prescription image and create a Prescription record
 * @access  Private (user)
 */
exports.uploadPrescription = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please upload a prescription image", 400));
  }

  const protocol = req.protocol;
  const host = req.get("host");
  const localImageUrl = `${protocol}://${host}/uploads/prescriptions/${req.file.filename}`;

  const prescription = await Prescription.create({
    user: req.userId,
    image: localImageUrl,
    status: "pending",
  });

  res.status(201).json({ status: "success", data: prescription });
});

/**
 * @desc    Get all prescriptions for the logged-in user
 * @route   GET /api/v1/prescriptions
 * @access  Private (user)
 */
exports.getMyPrescriptions = catchAsync(async (req, res, next) => {
  const prescriptions = await Prescription.find({ user: req.userId }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    status: "success",
    results: prescriptions.length,
    data: prescriptions,
  });
});

/**
 * @desc    Get all prescriptions
 * @route   GET /api/v1/prescriptions/all
 * @access  Private (admin, pharmacist)
 */
exports.getAllPrescriptions = catchAsync(async (req, res, next) => {
  const prescriptions = await Prescription.find()
    .populate("user", "firstName lastName email phone")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: prescriptions.length,
    data: prescriptions,
  });
});
