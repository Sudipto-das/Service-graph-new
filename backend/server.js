const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const appRoutes = require("./src/routes/appRoutes");
const serviceRoutes = require("./src/routes/serviceRoutes");
const edgeRoutes = require("./src/routes/edgeRoutes");
const errorHandler = require("./src/middleware/errorHandler");
const { apiLimiter, authLimiter } = require("./src/middleware/rateLimiter")

dotenv.config();

connectDB();

const app = express();

const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

app.use("/api/auth", authRoutes);
app.use("/api/apps",appRoutes);
app.use("/api/apps/:appId/services", serviceRoutes);
app.use("/api/apps/:appId/edges", edgeRoutes);

app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle undefined API routes
app.all("*path", (req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Error handler middleware (must be after all routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
