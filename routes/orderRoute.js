const express = require("express");
const {
  createCashOrder,
  findAllOrders,
  filterOrderForLoggedUser,
  findSpecificOrder,
  updateOrderStatus,
  updateOrderToPaid,
} = require("../controllers/orderController");

const { AuthMiddleware, restirctTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(AuthMiddleware);

router
  .route("/")
  .get(filterOrderForLoggedUser, findAllOrders);

router.route("/:cartId").post(restirctTo("user"), createCashOrder);

router.route("/:id").get(restirctTo("user", "admin", "pharmacist"), findSpecificOrder);

router.use(restirctTo("admin", "pharmacist"));
router.put("/:id/status", updateOrderStatus);
router.put("/:id/pay", updateOrderToPaid);

module.exports = router;
