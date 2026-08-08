const App = require("../models/App");
const Service = require("../models/Service");
const Edge = require("../models/Edge");
const AppError = require("../utils/AppError");

// Get all apps for logged-in user
exports.getApps = async (req, res, next) => {
  try {
    const apps = await App.find({ owner: req.user.id })
      .populate("services", "name type status")
      .sort({ createdAt: -1 });

    res.json({ apps });
  } catch (error) {
    next(error);
  }
};

// Get single app with all services and edges
exports.getApp = async (req, res, next) => {
  try {
    const app = await App.findOne({ _id: req.params.id, owner: req.user.id })
      .populate("services")
      .populate("edges");

    if (!app) {
      return next(new AppError("App not found", 404));
    }

    res.json({ app });
  } catch (error) {
    next(error);
  }
};

// Create new app
exports.createApp = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const app = await App.create({
      name,
      description,
      owner: req.user.id,
    });

    res.status(201).json({ app });
  } catch (error) {
    next(error);
  }
};

// Update app
exports.updateApp = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;

    const app = await App.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { name, description, status },
      { new: true, runValidators: true }
    );

    if (!app) {
      return next(new AppError("App not found", 404));
    }

    res.json({ app });
  } catch (error) {
    next(error);
  }
};

// Delete app with all services and edges
exports.deleteApp = async (req, res, next) => {
  try {
    const app = await App.findOne({ _id: req.params.id, owner: req.user.id });

    if (!app) {
      return next(new AppError("App not found", 404));
    }

    // Delete all services of this app
    await Service.deleteMany({ app: app._id });

    // Delete all edges of this app
    await Edge.deleteMany({ app: app._id });

    // Delete the app itself
    await App.findByIdAndDelete(app._id);

    res.json({ message: "App deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Get full graph data (services + edges) for an app
exports.getGraphData = async (req, res, next) => {
  try {
    const app = await App.findOne({ _id: req.params.id, owner: req.user.id });

    if (!app) {
      return next(new AppError("App not found", 404));
    }

    const services = await Service.find({ app: app._id });
    const edges = await Edge.find({ app: app._id })
      .populate("source", "name type status")
      .populate("target", "name type status");

    res.json({
      nodes: services.map((s) => ({
        id: s._id.toString(),
        type: "serviceNode",
        position: s.position,
        data: {
          name: s.name,
          type: s.type,
          status: s.status,
          config: s.config,
          runtime: s.runtime,
        },
      })),
      edges: edges.map((e) => ({
        id: e._id.toString(),
        source: e.source._id.toString(),
        target: e.target._id.toString(),
        label: e.label,
        metadata: e.metadata,
      })),
    });
  } catch (error) {
    next(error);
  }
};
