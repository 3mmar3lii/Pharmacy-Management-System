const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
// cart and order routes
const cartRoutes = require("./routes/cartRoute");
const orderRoutes = require("./routes/orderRoute");
//medicine routes
const medicineRoutes = require("./routes/medicine");
const invoiceRoutes = require("./routes/invoice");
const supplierRoutes = require("./routes/supplierRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const app = express();

// static files
app.use(express.static("./static"));
// body req
app.use(express.json());
// cors
app.use(cors());
// secuirty
app.use(helmet());

app.use(express.json({ limit: "10kb" }));

// routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/invoices", invoiceRoutes);
app.use("/api/v1/medicines", medicineRoutes);
app.use("/api/v1/suppliers", supplierRoutes);
app.use("/api/v1/inventory", inventoryRoutes);





// error middleware
app.use(errorMiddleware);


module.exports = app;