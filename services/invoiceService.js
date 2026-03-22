const Invoice = require("../models/Invoice");


const createInvoiceForOrder = async (order, userId) => {
  // Check if an invoice already exists to ensure idempotency
  let existingInvoice = await Invoice.findOne({ order: order._id });
  
  if (existingInvoice) {
    return existingInvoice;
  }

  // Create and return the new invoice
  const newInvoice = await Invoice.create({
    order: order._id,
    invoiceNumber: `INV-${Date.now()}`,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethodType === "card" ? "credit_card" : "cash",
    issuedBy: userId,
  });

  return newInvoice;
};

module.exports = {
  createInvoiceForOrder,
};
