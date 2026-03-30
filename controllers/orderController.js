const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Medicine = require("../models/Medicine");
const Prescription = require("../models/Prescriptions");
const factory = require("../utils/handleFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { createInvoiceForOrder } = require("../services/invoiceService");

// ─────────────────────────────────────────────────────────────────────────────
// Helper: extract unique prescription ObjectIds from cartItems
// ─────────────────────────────────────────────────────────────────────────────
const extractPrescriptionIds = (cartItems) =>
  cartItems
    .filter((item) => item.prescription)
    .map((item) => item.prescription);

const getInvalidPrescriptionMessage = (medicineName) =>
  medicineName
    ? `${medicineName} requires a valid prescription before checkout`
    : "This medicine requires a valid prescription";

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a cash order
// @route   POST /api/v1/orders/:cartId
// @access  Private (user)
// ─────────────────────────────────────────────────────────────────────────────
exports.createCashOrder = catchAsync(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new AppError(`There is no cart with id ${req.params.cartId}`, 404));
  }

  if (cart.user.toString() !== req.userId.toString()) {
    return next(new AppError("You are not authorized to create an order from this cart", 403));
  }

  if (!cart.cartItems || cart.cartItems.length === 0) {
    return next(new AppError("Your cart is empty", 400));
  }

  // 2) Validate prescriptions for medicines that require one
  const medicineIds = cart.cartItems.map((item) => item.product);
  const medicines = await Medicine.find({ _id: { $in: medicineIds } }).lean();
  const medicineMap = Object.fromEntries(medicines.map((m) => [m._id.toString(), m]));

  const prescriptionIds = cart.cartItems
    .filter((item) => item.prescription)
    .map((item) => item.prescription);

  const existingPrescriptions = await Prescription.find({
    _id: { $in: prescriptionIds },
    user: req.userId,
    status: { $ne: "rejected" },
  })
    .select("_id status")
    .lean();

  const existingPrescriptionSet = new Set(
    existingPrescriptions.map((p) => p._id.toString())
  );

  for (const item of cart.cartItems) {
    const medicine = medicineMap[item.product.toString()];
    if (!medicine) {
      return next(new AppError("One or more medicines in the cart no longer exist", 404));
    }

    if (medicine.quantity < item.quantity) {
      return next(
        new AppError(
          `Not enough stock for ${medicine.nameEn}. Only ${medicine.quantity} items available.`,
          400
        )
      );
    }

    if (medicine.requiresPrescription) {
      if (
        !item.prescription ||
        !existingPrescriptionSet.has(item.prescription.toString())
      ) {
        return next(new AppError(getInvalidPrescriptionMessage(medicine.nameEn), 400));
      }
    }
  }

  // 3) Calculate total
  const cartPrice = cart.totalPriceAfterDiscount ?? cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 4) Create order
  const order = await Order.create({
    user: req.userId,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalAmount: totalOrderPrice,
  });

  // 5) Decrement stock using bulkWrite (no per-item await)
  const stockDecrements = cart.cartItems.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: { $inc: { quantity: -item.quantity } },
    },
  }));
  await Medicine.bulkWrite(stockDecrements);

  // 6) Clear cart
  await Cart.findByIdAndDelete(req.params.cartId);

  res.status(201).json({ status: "success", data: order });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Filter orders for logged-in user (non-admins see only their orders)
// ─────────────────────────────────────────────────────────────────────────────
exports.filterOrderForLoggedUser = catchAsync(async (req, res, next) => {
  if (req.role === "user") {
    req.filterObj = { user: req.userId };
  }
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all orders (admin/pharmacist: all | user: own)
// @route   GET /api/v1/orders
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.findAllOrders = catchAsync(async (req, res, next) => {
  const filter = req.filterObj || {};

  const orders = await Order.find(filter)
    .populate("user", "firstName lastName email phone")
    .populate("cartItems.product", "nameEn price")
    .populate("cartItems.prescription", "image status notes");

  res.status(200).json({ status: "success", results: orders.length, data: orders });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a specific order with full prescription & product details
// @route   GET /api/v1/orders/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.findSpecificOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "firstName lastName email phone")
    .populate("cartItems.product", "nameEn price")
    .populate("cartItems.prescription", "image status notes");

  if (!order) {
    return next(new AppError(`No order found with id: ${req.params.id}`, 404));
  }

  res.status(200).json({ status: "success", data: order });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update order status (admin/pharmacist)
//          APPROVED → creates invoice + marks prescriptions as "reviewed"
//          REJECTED → restores stock + marks prescriptions as "rejected"
//          Cancelled → restores stock (existing behaviour kept)
// @route   PUT /api/v1/orders/:id/status
// @access  Private (admin, pharmacist)
// ─────────────────────────────────────────────────────────────────────────────
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError(`No order found with id: ${req.params.id}`, 404));
  }

  const oldStatus = order.status;
  const newStatus = req.body.status;

  let generatedInvoice = null;

  // ── APPROVED ──────────────────────────────────────────────────────────────
  if (newStatus === "APPROVED" && oldStatus !== "APPROVED") {
    // Create invoice
    generatedInvoice = await createInvoiceForOrder(order, req.userId);

    // Mark all linked prescriptions as reviewed
    const prescriptionIds = extractPrescriptionIds(order.cartItems);
    if (prescriptionIds.length > 0) {
      await Prescription.updateMany(
        { _id: { $in: prescriptionIds } },
        {
          status: "reviewed",
          reviewedBy: req.userId,
          notes: req.body.notes || "Approved via order",
        }
      );
    }
  }

  // ── REJECTED ──────────────────────────────────────────────────────────────
  if (newStatus === "REJECTED" && oldStatus !== "REJECTED") {
    // 1. Restore stock in one bulkWrite
    if (order.cartItems && order.cartItems.length > 0) {
      const stockRestores = order.cartItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: item.quantity } },
        },
      }));
      await Medicine.bulkWrite(stockRestores);
    }

    // 2. Mark linked prescriptions as rejected
    const prescriptionIds = extractPrescriptionIds(order.cartItems);
    if (prescriptionIds.length > 0) {
      await Prescription.updateMany(
        { _id: { $in: prescriptionIds } },
        {
          status: "rejected",
          reviewedBy: req.userId,
          notes: req.body.notes || "Rejected via order",
        }
      );
    }
  }

  // ── CANCELLED (existing behaviour) ────────────────────────────────────────
  if (newStatus === "Cancelled" && oldStatus !== "Cancelled") {
    if (order.cartItems && order.cartItems.length > 0) {
      const stockRestores = order.cartItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: item.quantity } },
        },
      }));
      await Medicine.bulkWrite(stockRestores);
    }
  }

  // ── Delivered (existing behaviour) ────────────────────────────────────────
  if (newStatus === "Delivered") {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  order.status = newStatus || oldStatus;
  const updatedOrder = await order.save();

  if (generatedInvoice) {
    return res.status(200).json({
      status: "success",
      data: updatedOrder,
      invoice: generatedInvoice,
    });
  }

  res.status(200).json({ status: "success", data: updatedOrder });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Mark order as paid
// @route   PUT /api/v1/orders/:id/pay
// @access  Private (admin, pharmacist)
// ─────────────────────────────────────────────────────────────────────────────
exports.updateOrderToPaid = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError(`No order found with id: ${req.params.id}`, 404));
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: "success", data: updatedOrder });
});
