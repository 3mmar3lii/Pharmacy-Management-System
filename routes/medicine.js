const express = require("express")
const router = require("express").Router();
const upload = require("../middlewares/upload");
const {addMedicine,getAllMedicines, getMedicine, updateMedicine, deleteMedicine} = require("../controllers/medicine");

// router.post("/", upload.single("image"), addMedicine);

router
  .route("/")
  .get(getAllMedicines) // get all medicines
  .post(upload.single("image"), addMedicine); // create medicine
  
router
  .route("/:id")
  .get(getMedicine) // get single medicine
  .patch(updateMedicine) // update medicine
  .delete(deleteMedicine); // delete medicine

module.exports = router;