const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const subCategoryRoutes = require("./routes/subCategoryRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
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
app.use("/api/v1/subcategories", subCategoryRoutes);
app.use("/api/v1/suppliers", supplierRoutes);

//medicine routes

const medicineRoutes = require("./routes/medicine");
app.use("/api/v1/medicines", medicineRoutes);


// error middleware
app.use(errorMiddleware);


module.exports = app;