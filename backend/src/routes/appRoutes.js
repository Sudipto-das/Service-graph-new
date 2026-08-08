const express = require("express");
const {
  getApps,
  getApp,
  createApp,
  updateApp,
  deleteApp,
  getGraphData,
} = require("../controllers/appController");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createAppSchema, updateAppSchema } = require("../utils/validators");

const router = express.Router();

// All routes are protected (auth required)
router.use(auth);

router.route("/").get(getApps).post(validate(createAppSchema), createApp);

router.route("/:id").get(getApp).put(validate(updateAppSchema), updateApp).delete(deleteApp);

router.get("/:id/graph", getGraphData);

module.exports = router;
