const express = require("express");
const supplierController = require("../controllers/supplierController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router
    .route("/")
    .get(authMiddleware.AuthMiddleware, supplierController.getAllSuppliers)
    .post(
        authMiddleware.AuthMiddleware,
        authMiddleware.restirctTo("admin", "pharmacist"),
        supplierController.createSupplier
    );

router
    .route("/:id")
    .get(authMiddleware.AuthMiddleware, supplierController.getSupplier)
    .patch(
        authMiddleware.AuthMiddleware,
        authMiddleware.restirctTo("admin", "pharmacist"),
        supplierController.updateSupplier
    )
    .delete(
        authMiddleware.AuthMiddleware,
        authMiddleware.restirctTo("admin", "pharmacist"),
        supplierController.deleteSupplier
    );

module.exports = router;
