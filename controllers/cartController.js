const Cart = require("../models/Cart");
const Medicine = require("../models/Medicine");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const Prescription = require("../models/Prescriptions");

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

const getNormalizedQuantity = (quantity) => {
  if (quantity === undefined) return 1;
  const parsedQuantity = Number(quantity);
  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
    return null;
  }
  return parsedQuantity;
};

const resolvePrescriptionId = (body = {}) =>
  body.prescriptionId || body.prescription || undefined;

const validatePrescriptionForUser = async (prescriptionId, userId) => {
  if (!prescriptionId) {
    return null;
  }

  const prescription = await Prescription.findById(prescriptionId).lean();
  if (!prescription) {
    throw new AppError(`No prescription found with this id`, 404);
  }

  if (prescription.user.toString() !== userId.toString()) {
    throw new AppError(`You are not authorized to use this prescription`, 403);
  }

  if (prescription.status === "rejected") {
    throw new AppError(`This prescription has been rejected and cannot be used`, 400);
  }

  return prescription;
};

exports.addProductToCart = catchAsync(async (req, res, next) => {
  const { productId } = req.body;
  const requestedQuantity = getNormalizedQuantity(req.body.quantity);
  const prescriptionId = resolvePrescriptionId(req.body);

  if (!productId) {
    return next(new AppError("productId is required", 400));
  }

  if (!requestedQuantity) {
    return next(new AppError("Quantity must be a positive integer", 400));
  }

  const product = await Medicine.findById(productId);
  if (!product) {
    return next(new AppError(`No product for this id ${productId}`, 404));
  }

  if (product.quantity < requestedQuantity) {
    return next(
      new AppError(`Not enough stock. Only ${product.quantity} items available.`, 400)
    );
  }

  const validatedPrescription = await validatePrescriptionForUser(
    prescriptionId,
    req.userId
  );

  if (validatedPrescription && !product.requiresPrescription) {
    return next(new AppError(`This product does not require a prescription`, 400));
  }
  
  // 1) Get Cart for logged user
  let cart = await Cart.findOne({ user: req.userId });

  if (!cart) {
    // create cart for logged user with product
    cart = await Cart.create({
      user: req.userId,
      cartItems: [
        {
          product: productId,
          price: product.price,
          quantity: requestedQuantity,
          prescription: validatedPrescription?._id,
        },
      ],
    });
  } else {
    // product exists in cart, update quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      const newTotalQuantity = cartItem.quantity + requestedQuantity;
      if (product.quantity < newTotalQuantity) {
        return next(new AppError(`Not enough stock. Cannot add total of ${newTotalQuantity}. Only ${product.quantity} items available.`, 400));
      }
      cartItem.quantity += requestedQuantity;
      if (validatedPrescription) {
        cartItem.prescription = validatedPrescription._id;
      }
      cart.cartItems[productIndex] = cartItem;
    } else {
      // product not exists in cart, push product to cartItems array
      cart.cartItems.push({
        product: productId,
        price: product.price,
        quantity: requestedQuantity,
        prescription: validatedPrescription?._id,
      });
    }
  }

  // Calculate total cart price
  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Product added to cart successfully",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

exports.getLoggedUserCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.userId }).populate({
    path: "cartItems.product",
    select: "nameEn nameAr image price requiresPrescription",
  });

  if (!cart) {
    return next(new AppError(`There is no cart for this user id : ${req.userId}`, 404));
  }

  const cartObj = cart.toObject();
  cartObj.cartItems = cartObj.cartItems.map((item) => ({
    ...item,
    requiresPrescription: item.product ? item.product.requiresPrescription : false,
    hasPrescription: !!item.prescription,
  }));

  res.status(200).json({
    status: "success",
    numOfCartItems: cartObj.cartItems.length,
    data: cartObj,
  });
});

exports.removeSpecificCartItem = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.userId },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );

  if (!cart) {
    return next(new AppError(`There is no cart for this user id : ${req.userId}`, 404));
  }

  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

exports.clearCart = catchAsync(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.userId });
  res.status(204).send();
});

exports.updateCartItemQuantity = catchAsync(async (req, res, next) => {
  const quantity = getNormalizedQuantity(req.body.quantity);

  if (!quantity) {
    return next(new AppError("Quantity must be a positive integer", 400));
  }

  const cart = await Cart.findOne({ user: req.userId });
  if (!cart) {
    return next(new AppError(`There is no cart for user ${req.userId}`, 404));
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    // check adequate stock before update
    const product = await Medicine.findById(cartItem.product);
    if (product && product.quantity < quantity) {
      return next(new AppError(`Not enough stock. Only ${product.quantity} items available.`, 400));
    }
    
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(new AppError(`There is no item for this id :${req.params.itemId}`, 404));
  }

  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

exports.attachPrescriptionToCartItem = catchAsync(async (req, res, next) => {
  const prescriptionId = resolvePrescriptionId(req.body);
  const { itemId } = req.params;

  if (!prescriptionId) {
    return next(new AppError("prescriptionId is required", 400));
  }

  const cart = await Cart.findOne({ user: req.userId });
  if (!cart) {
    return next(new AppError(`There is no cart for this user`, 404));
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    return next(new AppError(`There is no item for this id :${itemId}`, 404));
  }

  await validatePrescriptionForUser(prescriptionId, req.userId);

  const cartItem = cart.cartItems[itemIndex];
  const product = await Medicine.findById(cartItem.product).lean();
  
  if (!product || product.requiresPrescription === false) {
    return next(new AppError(`This product does not require a prescription`, 400));
  }

  cartItem.prescription = prescriptionId;
  cart.cartItems[itemIndex] = cartItem;

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Prescription attached successfully",
    data: cart,
  });
});
