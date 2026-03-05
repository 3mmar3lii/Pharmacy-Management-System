const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
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


// error middleware
app.use(errorMiddleware);


module.exports = app;