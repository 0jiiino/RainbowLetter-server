const express = require("express");

const {
  postCertification,
  postVerification,
  postSignUp,
} = require("../controllers/userControllers");
const validateSignUp = require("../middlewares/signUpValidation");

const router = express.Router();

router.post("/certification", postCertification);
router.post("/verification", postVerification);
router.post("/signUp", validateSignUp, postSignUp);

module.exports = router;
