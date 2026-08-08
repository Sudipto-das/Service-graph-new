const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const appRoutes = require("./src/routes/appRoutes");
const serviceRoutes = require("./src/routes/serviceRoutes");
const edgeRoutes = require("./src/routes/edgeRoutes");
const errorHandler = require("./src/middleware/errorHandler");

dotenv.config();

connectDB();

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

app.use("/api/auth", authRoutes);
app.use("/api/apps", appRoutes);
app.use("/api/apps/:appId/services", serviceRoutes);
app.use("/api/apps/:appId/edges", edgeRoutes);

// Handle undefined routes
app.all("*", (req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Error handler middleware (must be after all routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
