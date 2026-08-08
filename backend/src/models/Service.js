const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    type: {
      type: String,
      enum: ["api", "database", "queue", "cache", "gateway", "worker", "frontend", "other"],
      default: "api",
    },
    status: {
      type: String,
      enum: ["healthy", "degraded", "down", "unknown"],
      default: "unknown",
    },
    app: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "App",
      required: true,
    },
    config: {
      port: { type: Number, min: 1, max: 65535 },
      protocol: { type: String, enum: ["http", "https", "grpc", "tcp", "udp"], default: "http" },
      healthCheck: { type: String },
      endpoint: { type: String },
    },
    runtime: {
      cpu: { type: Number, min: 0, max: 100, default: 0 },
      memory: { type: Number, min: 0, max: 100, default: 0 },
      requests: { type: Number, default: 0 },
      errors: { type: Number, default: 0 },
      latency: { type: Number, default: 0 },
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    metadata: {
      version: { type: String },
      language: { type: String },
      framework: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({ app: 1, name: 1 });
serviceSchema.index({ app: 1, status: 1 });

module.exports = mongoose.model("Service", serviceSchema);
