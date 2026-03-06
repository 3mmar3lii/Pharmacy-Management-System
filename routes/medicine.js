const express = require("express")
const router = require("express").Router();
const upload = require("../middlewares/upload");
const addMedicine = require("../controllers/medicine");

router.post("/", upload.single("image"), addMedicine);

module.exports = router;