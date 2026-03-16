const express = require("express");
const router = express.Router();

const invoiceController = require("../controllers/invoice.controller");

router.get("/", invoiceController.getAllInvoices);

router.get("/:id", invoiceController.getInvoice);

router.post("/generate/:orderId", invoiceController.generateInvoice);

router.patch("/:id", invoiceController.updateInvoice);

router.delete("/:id", invoiceController.deleteInvoice);

router.patch("/pay/:id", invoiceController.payInvoice);

module.exports = router;