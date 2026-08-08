const mongoose = require("mongoose");

const appSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "App name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    edges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Edge",
      },
    ],
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

appSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("App", appSchema);
