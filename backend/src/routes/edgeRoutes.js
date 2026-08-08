const express = require("express");
const {
  getEdges,
  getEdge,
  createEdge,
  updateEdge,
  deleteEdge,
} = require("../controllers/edgeController");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createEdgeSchema, updateEdgeSchema } = require("../utils/validators");

const router = express.Router({ mergeParams: true });

// All routes are protected (auth required)
router.use(auth);

router.route("/").get(getEdges).post(validate(createEdgeSchema), createEdge);

router
  .route("/:edgeId")
  .get(getEdge)
  .put(validate(updateEdgeSchema), updateEdge)
  .delete(deleteEdge);

module.exports = router;
