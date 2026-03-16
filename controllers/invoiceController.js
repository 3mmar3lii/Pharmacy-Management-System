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


exports.generateInvoice = catchAsync(async (req, res, next) => {

  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (order.status !== "APPROVED") {
    return next(new AppError("Order must be approved first", 400));
  }

  const invoice = await Invoice.create({
    order: order._id,
    invoiceNumber: `INV-${Date.now()}`,
    totalAmount: order.totalPrice,
    paymentMethod: order.paymentMethod,
    issuedBy: req.user.id
  });

  res.status(201).json({
    status: "success",
    data: invoice
  });

});

exports.payInvoice = catchAsync(async (req, res, next) => {

  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(new AppError("Invoice not found", 404));
  }

  if (invoice.paymentStatus === "PAID") {
    return next(new AppError("Invoice already paid", 400));
  }

  invoice.paymentStatus = "PAID";

  await invoice.save();

  res.status(200).json({
    status: "success",
    data: invoice
  });

});