const imagekit = require("../utils/imgKit");
const Medicine = require("../models/Medicine");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// let addMedicine = catchAsync(async (req, res, next) => {

// //   if (!req.body.name || !req.body.price) {
// //     return next(new AppError("Medicine name and price are required", 400));
// //   }

//   let imageUrl = "";

//   if (req.file) {
//     const response = await imagekit.upload({
//       file: req.file.buffer,
//       fileName: req.file.originalname,
//       folder: "medicines"
//     });

//     imageUrl = response.url;
//   }

//   const medicine = await Medicine.create({
//     ...req.body,
//     image: imageUrl
//   });

//   res.status(201).json({
//     status: "success",
//     data: medicine
//   });

// });

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

module.exports = addMedicine;