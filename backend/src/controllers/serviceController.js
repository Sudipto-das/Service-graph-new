const Service = require("../models/Service");
const App = require("../models/App");
const Edge = require("../models/Edge");
const AppError = require("../utils/AppError");

// Get all services of an app
exports.getServices = async (req, res, next) => {
  try {
    const app = await App.findOne({ _id: req.params.appId, owner: req.user.id });

    if (!app) {
      return next(new AppError("App not found", 404));
    }

    const services = await Service.find({ app: app._id }).sort({ createdAt: -1 });

    res.json({ services });
  } catch (error) {
    next(error);
  }
};

// Get single service
exports.getService = async (req, res, next) => {
  try {
    const app = await App.findOne({ _id: req.params.appId, owner: req.user.id });

    if (!app) {
      return next(new AppError("App not found", 404));
    }

    const service = await Service.findOne({ _id: req.params.serviceId, app: app._id });

    if (!service) {
      return next(new AppError("Service not found", 404));
    }

    res.json({ service });
  } catch (error) {
    next(error);
  }
};

// Create new service
exports.createService = async (req, res, next) => {
  try {
    const app = await App.findOne({ _id: req.params.appId, owner: req.user.id });

    if (!app) {
      return next(new AppError("App not found", 404));
    }

    const { name, type, config, metadata, position } = req.body;

    const service = await Service.create({
      name,
      type,
      config,
      metadata,
      position,
      app: app._id,
    });

    // Add service to app's services array
    app.services.push(service._id);
    await app.save();

    res.status(201).json({ service });
  } catch (error) {
    next(error);
  }
};

// Update service
exports.updateService = async (req, res, next) => {
  try {
    const app = await App.findOne({ _id: req.params.appId, owner: req.user.id });

    if (!app) {
      return next(new AppError("App not found", 404));
    }

    const { name, type, status, config, runtime, position, metadata } = req.body;

    const service = await Service.findOneAndUpdate(
      { _id: req.params.serviceId, app: app._id },
      { name, type, status, config, runtime, position, metadata },
      { new: true, runValidators: true }
    );

    if (!service) {
      return next(new AppError("Service not found", 404));
    }

    res.json({ service });
  } catch (error) {
    next(error);
  }
};

// Delete service and its edges
exports.deleteService = async (req, res, next) => {
  try {
    const app = await App.findOne({ _id: req.params.appId, owner: req.user.id });

    if (!app) {
      return next(new AppError("App not found", 404));
    }

    const service = await Service.findOne({ _id: req.params.serviceId, app: app._id });

    if (!service) {
      return next(new AppError("Service not found", 404));
    }

    // Delete all edges connected to this service
    await Edge.deleteMany({
      app: app._id,
      $or: [{ source: service._id }, { target: service._id }],
    });

    // Remove service from app's services array
    app.services = app.services.filter((s) => s.toString() !== service._id.toString());
    await app.save();

    // Delete the service
    await Service.findByIdAndDelete(service._id);

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Update service position (for drag-drop on canvas)
exports.updatePosition = async (req, res, next) => {
  try {
    const app = await App.findOne({ _id: req.params.appId, owner: req.user.id });

    if (!app) {
      return next(new AppError("App not found", 404));
    }

    const { position } = req.body;

    const service = await Service.findOneAndUpdate(
      { _id: req.params.serviceId, app: app._id },
      { position },
      { new: true }
    );

    if (!service) {
      return next(new AppError("Service not found", 404));
    }

    res.json({ service });
  } catch (error) {
    next(error);
  }
};

// Update service runtime metrics
exports.updateMetrics = async (req, res, next) => {
  try {
    const app = await App.findOne({ _id: req.params.appId, owner: req.user.id });

    if (!app) {
      return next(new AppError("App not found", 404));
    }

    const { cpu, memory, requests, errors, latency } = req.body;

    const service = await Service.findOneAndUpdate(
      { _id: req.params.serviceId, app: app._id },
      { runtime: { cpu, memory, requests, errors, latency } },
      { new: true }
    );

    if (!service) {
      return next(new AppError("Service not found", 404));
    }

    res.json({ service });
  } catch (error) {
    next(error);
  }
};
