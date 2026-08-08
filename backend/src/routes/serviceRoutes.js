const express = require("express");
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  updatePosition,
  updateMetrics,
} = require("../controllers/serviceController");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createServiceSchema,
  updateServiceSchema,
  updatePositionSchema,
  updateMetricsSchema,
} = require("../utils/validators");

const router = express.Router({ mergeParams: true });

// All routes are protected (auth required)
router.use(auth);

router.route("/").get(getServices).post(validate(createServiceSchema), createService);

router
  .route("/:serviceId")
  .get(getService)
  .put(validate(updateServiceSchema), updateService)
  .delete(deleteService);

router.patch("/:serviceId/position", validate(updatePositionSchema), updatePosition);

router.patch("/:serviceId/metrics", validate(updateMetricsSchema), updateMetrics);

module.exports = router;
