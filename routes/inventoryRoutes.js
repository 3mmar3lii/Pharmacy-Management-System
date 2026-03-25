const express = require("express");
const controller = require("../controllers/inventoryController");

const router = express.Router();

router.post("/add-stock", controller.addStock);
router.post("/deduct-stock", controller.deductStock);
router.get("/low-stock", controller.getLowStock);

module.exports = router;
