const express = require("express");
const controller = require("../controllers/supplierController");

const router = express.Router();

router
    .route("/")
    .post(controller.createSupplier)
    .get(controller.getAllSuppliers);

router
    .route("/:id")
    .get(controller.getSupplier)
    .put(controller.updateSupplier)
    .delete(controller.deleteSupplier);

module.exports = router;
