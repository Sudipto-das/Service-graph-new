const express = require("express");
const { signup, login, logout, getMe } = require("../controllers/authController");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { signupSchema, loginSchema } = require("../utils/validators");

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", auth, getMe);

module.exports = router;
