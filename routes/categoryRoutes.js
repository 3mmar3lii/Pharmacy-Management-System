const express = require("express");
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();



router
    .route("/")
    .get(categoryController.getAllCategories)
    .post(
        authMiddleware.AuthMiddleware,
        authMiddleware.restirctTo("admin", "pharmacist"),
        categoryController.createCategory
    );

router
    .route("/:id")
    .get(categoryController.getCategory)
    .patch(
        authMiddleware.AuthMiddleware,
        authMiddleware.restirctTo("admin", "pharmacist"),
        categoryController.updateCategory
    )
    .delete(
        authMiddleware.AuthMiddleware,
        authMiddleware.restirctTo("admin", "pharmacist"),
        categoryController.deleteCategory
    );

module.exports = router;
