const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Medicine = require("../models/Medicine");
const factory = require("../utils/handleFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.createCashOrder = catchAsync(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new AppError(`There is no such cart with id ${req.params.cartId}`, 404));
  }

  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create order with default paymentMethodType cash
  const order = await Order.create({
    user: req.userId,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });

  // 4) After creating order, decrement product quantity
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity } },
      },
    }));
    await Medicine.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({ status: "success", data: order });
});

exports.filterOrderForLoggedUser = catchAsync(async (req, res, next) => {
  if (req.role === "user") {
    req.filterObj = { user: req.userId };
  }
  next();
});

// For admin and pharmacist to get all orders, and user to get their orders
// To support the filterObj we can temporarily override the query
exports.findAllOrders = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.filterObj) {
    filter = req.filterObj;
  }
  const orders = await Order.find(filter).populate("user", "firstName lastName email phone");
  res.status(200).json({ status: "success", results: orders.length, data: orders });
});

exports.findSpecificOrder = factory.getOne(Order, { path: "user", select: "firstName lastName email phone" });

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new AppError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }

  order.status = req.body.status || order.status;
  
  if (req.body.status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
  }

  const updatedOrder = await order.save();

  res.status(200).json({ status: "success", data: updatedOrder });
});

exports.updateOrderToPaid = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new AppError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: "success", data: updatedOrder });
});
