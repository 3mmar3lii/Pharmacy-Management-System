const express = require("express");
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const subCategoryRoutes = require("./subCategoryRoutes");

const router = express.Router();

router.use("/:categoryId/subcategories", subCategoryRoutes);

router
    .route("/")
    .get(authMiddleware.AuthMiddleware, categoryController.getAllCategories)
    .post(
        authMiddleware.AuthMiddleware,
        authMiddleware.restirctTo("admin", "pharmacist"),
        categoryController.createCategory
    );

router
    .route("/:id")
    .get(authMiddleware.AuthMiddleware, categoryController.getCategory)
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
