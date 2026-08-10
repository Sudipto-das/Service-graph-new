const mongoose = require("mongoose");

const edgeSchema = new mongoose.Schema(
  {
    source: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    label: {
      type: String,
      enum: ["HTTP", "HTTPS", "gRPC", "TCP", "UDP", "WebSocket", "Event", "Other"],
      default: "HTTP",
    },
    app: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "App",
      required: true,
    },
    metadata: {
      timeout: { type: Number, default: 5000 },
      retries: { type: Number, default: 3 },
      circuitBreaker: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

edgeSchema.index({ app: 1 });
edgeSchema.index({ source: 1, target: 1 });
edgeSchema.index({ app: 1, source: 1, target: 1 }, { unique: true });

module.exports = mongoose.model("Edge", edgeSchema);
