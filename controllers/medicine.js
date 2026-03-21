const imagekit = require("../utils/imgKit");
const Medicine = require("../models/Medicine");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const factory = require("../utils/handleFactory")


let addMedicine = catchAsync(async (req, res, next) => {

  const {
    nameEn,
    nameAr,
    price,
    quantity,
    description,
    category,
    brand,
    expiryDate,
    supplier,
    requiresPrescription,
    discount
  } = req.body;

  // validation
  if (!nameEn || !nameAr || !price || !quantity || !description || !category || !brand) {
    return next(new AppError("Missing required medicine fields", 400));
  }

  let imageUrl = "default-medicine.png";

  // upload image to imagekit
  if (req.file) {
    const response = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: "medicines"
    });

    imageUrl = response.url;
  }

  const medicine = await Medicine.create({
    nameEn,
    nameAr,
    price,
    quantity,
    description,
    category,
    brand,
    expiryDate,
    supplier,
    requiresPrescription,
    discount,
    image: imageUrl
  });

  res.status(201).json({
    status: "success",
    data: medicine
  });

});

const getAllMedicines = factory.getAll(Medicine);

const getMedicine = factory.getOne(Medicine);

const updateMedicine = factory.updateOne(Medicine);

const deleteMedicine = catchAsync(async (req, res, next) => {
  const doc = await Medicine.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!doc) {
    return next(new AppError("No document found with this ID", 404));
  }
  res.status(204).json(null);
});

const getLowStockAlerts = catchAsync(async (req, res, next) => {
  const medicines = await Medicine.find({ $expr: { $lte: ["$quantity", "$reorderLevel"] } });
  res.status(200).json({ status: "success", results: medicines.length, data: medicines });
});

const getExpiringMedicines = catchAsync(async (req, res, next) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);

  const medicines = await Medicine.find({
    expiryDate: { $lte: futureDate, $gte: new Date() }
  });

  res.status(200).json({ status: "success", results: medicines.length, data: medicines });
});

const adjustStock = catchAsync(async (req, res, next) => {
  const { adjustment } = req.body;
  if (adjustment === undefined) return next(new AppError("Adjustment value is required", 400));

  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) return next(new AppError("Medicine not found", 404));

  medicine.quantity += Number(adjustment);
  if (medicine.quantity < 0) medicine.quantity = 0;

  await medicine.save();
  res.status(200).json({ status: "success", data: medicine });
});

module.exports = {
  addMedicine,
  getAllMedicines,
  getMedicine,
  updateMedicine,
  deleteMedicine,
  getLowStockAlerts,
  getExpiringMedicines,
  adjustStock
};