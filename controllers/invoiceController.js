const Invoice = require("../models/Invoice");
const Order = require("../models/Order");

const factory = require("../utils/handleFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const invoicePopulate = [
  {
    path: "order",
    select: "user totalPrice status",
    populate: {
      path: "user",
      select: "name email"
    }
  },
  {
    path: "issuedBy",
    select: "name role"
  }
];

exports.getInvoice = factory.getOne(Invoice, invoicePopulate);

exports.getAllInvoices = factory.getAll(Invoice, invoicePopulate);

exports.updateInvoice = factory.updateOne(Invoice);

exports.deleteInvoice = factory.deleteOne(Invoice);

exports.payInvoice = catchAsync(async (req, res, next) => {

  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(new AppError("Invoice not found", 404));
  }

  if (invoice.paymentStatus === "paid") {
    return next(new AppError("Invoice already paid", 400));
  }

  invoice.paymentStatus = "paid";

  await invoice.save();

  res.status(200).json({
    status: "success",
    data: invoice
  });

});