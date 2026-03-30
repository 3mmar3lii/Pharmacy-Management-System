const express = require("express");
const { 
  uploadPrescription, 
  getMyPrescriptions, 
  getAllPrescriptions 
} = require("../controllers/prescriptionController");
const { AuthMiddleware, restirctTo } = require("../middlewares/authMiddleware");
const uploadDisk = require("../middlewares/uploadDisk");

const router = express.Router();

router.use(AuthMiddleware);

router
  .route("/all")
  .get(restirctTo("admin", "pharmacist"), getAllPrescriptions);

router
  .route("/")
  .get(restirctTo("user"), getMyPrescriptions)
  .post(restirctTo("user"), uploadDisk.single("file"), uploadPrescription);

module.exports = router;
