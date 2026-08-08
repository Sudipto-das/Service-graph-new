const Edge = require("../models/Edge");
const App = require("../models/App");
const Service = require("../models/Service");
const AppError = require("../utils/AppError");

// Get all edges of an app
exports.getEdges = async (req, res, next) => {
  try {
    const app = await App.findOne({ _id: req.params.appId, owner: req.user.id });

    if (!app) {
      return next(new AppError("App not found", 404));
    }

    const edges = await Edge.find({ app: app._id })
      .populate("source", "name type status")
      .populate("target", "name type status");

    res.json({ edges });
  } catch (error) {
    next(error);
  }
};

// Get single edge
exports.getEdge = async (req, res, next) => {
  try {
    const app = await App.findOne({ _id: req.params.appId, owner: req.user.id });

    if (!app) {
      return next(new AppError("App not found", 404));
    }

    const edge = await Edge.findOne({ _id: req.params.edgeId, app: app._id })
      .populate("source", "name type status")
      .populate("target", "name type status");

    if (!edge) {
      return next(new AppError("Edge not found", 404));
    }

    res.json({ edge });
  } catch (error) {
    next(error);
  }
};

// Create new edge (connection between services)
exports.createEdge = async (req, res, next) => {
  try {
    const app = await App.findOne({ _id: req.params.appId, owner: req.user.id });

    if (!app) {
      return next(new AppError("App not found", 404));
    }

    const { source, target, label, metadata } = req.body;

    // Check if source and target services exist in this app
    const sourceService = await Service.findOne({ _id: source, app: app._id });
    const targetService = await Service.findOne({ _id: target, app: app._id });

    if (!sourceService || !targetService) {
      return next(new AppError("Source or target service not found", 404));
    }

    // Check if edge already exists
    const existingEdge = await Edge.findOne({
      app: app._id,
      source,
      target,
    });

    if (existingEdge) {
      return next(new AppError("Edge already exists between these services", 409));
    }

    const edge = await Edge.create({
      source,
      target,
      label,
      metadata,
      app: app._id,
    });

    // Add edge to app's edges array
    app.edges.push(edge._id);
    await app.save();

    const populatedEdge = await Edge.findById(edge._id)
      .populate("source", "name type status")
      .populate("target", "name type status");

    res.status(201).json({ edge: populatedEdge });
  } catch (error) {
    next(error);
  }
};

// Update edge
exports.updateEdge = async (req, res, next) => {
  try {
    const app = await App.findOne({ _id: req.params.appId, owner: req.user.id });

    if (!app) {
      return next(new AppError("App not found", 404));
    }

    const { label, metadata } = req.body;

    const edge = await Edge.findOneAndUpdate(
      { _id: req.params.edgeId, app: app._id },
      { label, metadata },
      { new: true, runValidators: true }
    )
      .populate("source", "name type status")
      .populate("target", "name type status");

    if (!edge) {
      return next(new AppError("Edge not found", 404));
    }

    res.json({ edge });
  } catch (error) {
    next(error);
  }
};

// Delete edge
exports.deleteEdge = async (req, res, next) => {
  try {
    const app = await App.findOne({ _id: req.params.appId, owner: req.user.id });

    if (!app) {
      return next(new AppError("App not found", 404));
    }

    const edge = await Edge.findOne({ _id: req.params.edgeId, app: app._id });

    if (!edge) {
      return next(new AppError("Edge not found", 404));
    }

    // Remove edge from app's edges array
    app.edges = app.edges.filter((e) => e.toString() !== edge._id.toString());
    await app.save();

    // Delete the edge
    await Edge.findByIdAndDelete(edge._id);

    res.json({ message: "Edge deleted successfully" });
  } catch (error) {
    next(error);
  }
};
