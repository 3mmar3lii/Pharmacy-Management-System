const express = require("express")
const router = require("express").Router();
const upload = require("../middlewares/upload");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  addMedicine,
  getAllMedicines,
  getMedicine,
  updateMedicine,
  deleteMedicine,
  getLowStockAlerts,
  getExpiringMedicines,
  adjustStock
} = require("../controllers/medicine");

// router.post("/", upload.single("image"), addMedicine);

router
  .route("/low-stock")
  .get(authMiddleware.AuthMiddleware, getLowStockAlerts);

router
  .route("/expiring")
  .get(authMiddleware.AuthMiddleware, getExpiringMedicines);

router
  .route("/")
  .get(authMiddleware.AuthMiddleware, getAllMedicines)
  .post(
    authMiddleware.AuthMiddleware,
    authMiddleware.restirctTo("admin", "pharmacist"),
    upload.single("image"),
    addMedicine
  );

router
  .route("/:id/adjust-stock")
  .post(
    authMiddleware.AuthMiddleware,
    authMiddleware.restirctTo("admin", "pharmacist"),
    adjustStock
  );

router
  .route("/:id")
  .get(authMiddleware.AuthMiddleware, getMedicine)
  .patch(
    authMiddleware.AuthMiddleware,
    authMiddleware.restirctTo("admin", "pharmacist"),
    updateMedicine
  )
  .delete(
    authMiddleware.AuthMiddleware,
    authMiddleware.restirctTo("admin"),
    deleteMedicine
  );

module.exports = router;