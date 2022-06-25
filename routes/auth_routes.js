const express = require("express");
const { register, login } = require("../controllers/auth_controller.js");
// const protect = require("../middlewares/auth_middleware.js");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

module.exports = router;
