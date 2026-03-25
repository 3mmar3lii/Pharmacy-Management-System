const Medicine = require("../models/Medicine");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.addStock = catchAsync(async (req, res, next) => {
  const { medicineId, quantityToAdd, supplierId } = req.body;
  
  if (!medicineId || !quantityToAdd) {
    return next(new AppError("Please provide medicineId and quantityToAdd", 400));
  }
  
  if (quantityToAdd <= 0) {
    return next(new AppError("Quantity to add must be greater than zero", 400));
  }

  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    return next(new AppError("No medicine found with this ID", 404));
  }

  medicine.quantity += quantityToAdd;
  if (supplierId) {
    medicine.supplier = supplierId; // Update provider if receiving a new batch from a different supplier
  }

  await medicine.save();

  res.status(200).json({
    status: "success",
    message: "Stock added successfully",
    data: medicine,
  });
});

exports.deductStock = catchAsync(async (req, res, next) => {
  const { medicineId, quantityToDeduct, reason } = req.body;
  
  if (!medicineId || !quantityToDeduct) {
    return next(new AppError("Please provide medicineId and quantityToDeduct", 400));
  }
  
  if (quantityToDeduct <= 0) {
    return next(new AppError("Quantity to deduct must be greater than zero", 400));
  }

  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    return next(new AppError("No medicine found with this ID", 404));
  }

  if (medicine.quantity < quantityToDeduct) {
    return next(new AppError(`Cannot deduct more stock than is available. Current stock: ${medicine.quantity}`, 400));
  }

  medicine.quantity -= quantityToDeduct;
  await medicine.save();

  res.status(200).json({
    status: "success",
    message: "Stock deducted successfully",
    data: medicine,
  });
});

exports.getLowStock = catchAsync(async (req, res, next) => {
  const threshold = req.query.threshold || 10; // Default threshold is 10 items
  
  const lowStockMedicines = await Medicine.find({ quantity: { $lte: threshold } })
    .populate("supplier", "name email phone");

  res.status(200).json({
    status: "success",
    results: lowStockMedicines.length,
    data: lowStockMedicines,
  });
});
