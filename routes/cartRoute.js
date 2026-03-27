const express = require("express");

const {
  addProductToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  clearCart,
  updateCartItemQuantity,
  attachPrescriptionToCartItem,
} = require("../controllers/cartController");

const { AuthMiddleware, restirctTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(AuthMiddleware, restirctTo("user"));

router
  .route("/")
  .post(addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearCart);

router
  .route("/:itemId")
  .put(updateCartItemQuantity)
  .delete(removeSpecificCartItem);

router.route("/:itemId/prescription").put(attachPrescriptionToCartItem);

module.exports = router;
