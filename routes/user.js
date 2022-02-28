const express = require("express");

const {
  postCertification,
  postVerification,
} = require("../controllers/userControllers");

const router = express.Router();

router.post("/certification", postCertification);
router.post("/verification", postVerification);

module.exports = router;
