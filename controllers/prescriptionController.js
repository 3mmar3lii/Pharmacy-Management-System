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

  // Upload the file buffer to ImageKit under the "prescriptions" folder
  const uploadResponse = await imagekit.upload({
    file: req.file.buffer,
    fileName: `prescription_${req.userId}_${Date.now()}`,
    folder: "/prescriptions",
  });

  // Create the prescription document
  const prescription = await Prescription.create({
    user: req.userId,
    image: uploadResponse.url,
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
