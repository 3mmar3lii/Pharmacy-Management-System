const express = require("express");
const subCategoryController = require("../controllers/subCategoryController");
const authMiddleware = require("../middlewares/authMiddleware");

// mergeParams allows us to access parameters from other routers
// e.g. we need to access categoryId from categoryRoutes
const router = express.Router({ mergeParams: true });

router
    .route("/")
    .get(
        authMiddleware.AuthMiddleware,
        subCategoryController.createFilterObj,
        subCategoryController.getAllSubCategories
    )
    .post(
        authMiddleware.AuthMiddleware,
        authMiddleware.restirctTo("admin", "pharmacist"),
        subCategoryController.setCategoryIdToBody,
        subCategoryController.createSubCategory
    );

router
    .route("/:id")
    .get(authMiddleware.AuthMiddleware, subCategoryController.getSubCategory)
    .patch(
        authMiddleware.AuthMiddleware,
        authMiddleware.restirctTo("admin", "pharmacist"),
        subCategoryController.updateSubCategory
    )
    .delete(
        authMiddleware.AuthMiddleware,
        authMiddleware.restirctTo("admin", "pharmacist"),
        subCategoryController.deleteSubCategory
    );

module.exports = router;
