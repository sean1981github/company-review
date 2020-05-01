const express = require("express");
const router = express.Router();
const { protectRoute } = require("../middleware/auth");

const {
  findOneUser,
  createOneUser,
  createCookie,
  userValidation,
  userLogout,
} = require("../controllers/users.controller");

router.get("/", protectRoute, findOneUser);
router.post("/register", createOneUser);
router.post("/login", userValidation, createCookie);
router.post("/logout", userLogout);

module.exports = router;
