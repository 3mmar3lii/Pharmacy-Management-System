const Cart = require("../models/Cart");
const Medicine = require("../models/Medicine");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

exports.addProductToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity, prescription } = req.body;
  const requestedQuantity = quantity || 1;

  const product = await Medicine.findById(productId);
  if (!product) {
    return next(new AppError(`No product for this id ${productId}`, 404));
  }
  
  if (product.requiresPrescription && !prescription) {
    return next(new AppError(`This product requires a prescription to be added to the cart`, 400));
  }
  
  // 1) Get Cart for logged user
  let cart = await Cart.findOne({ user: req.userId });

  if (!cart) {
    if (product.quantity < requestedQuantity) {
      return next(new AppError(`Not enough stock. Only ${product.quantity} items available.`, 400));
    }
    // create cart for logged user with product
    cart = await Cart.create({
      user: req.userId,
      cartItems: [{ product: productId, price: product.price, quantity: requestedQuantity, prescription: prescription || undefined }],
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
      cart.cartItems[productIndex] = cartItem;
    } else {
      if (product.quantity < requestedQuantity) {
        return next(new AppError(`Not enough stock. Only ${product.quantity} items available.`, 400));
      }
      // product not exists in cart, push product to cartItems array
      cart.cartItems.push({ product: productId, price: product.price, quantity: requestedQuantity, prescription: prescription || undefined });
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
    select: "nameEn nameAr image price",
  });

  if (!cart) {
    return next(new AppError(`There is no cart for this user id : ${req.userId}`, 404));
  }

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
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
  const { quantity } = req.body;

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
