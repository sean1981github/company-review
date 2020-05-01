const express = require("express");
const router = express.Router();
const { protectRoute } = require("../middleware/auth");

const {
  findAllCompanies,
  findOneCompany,
  createOneReview,
} = require("../controllers/companies.controller");

router.get("/", findAllCompanies);
router.get("/:id", findOneCompany);
router.post("/:id/reviews", protectRoute, createOneReview);

module.exports = router;
