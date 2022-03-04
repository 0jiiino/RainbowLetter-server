const express = require("express");

const {
  postCertification,
  postVerification,
  postSignUp,
  postLogin,
  patchAngel,
} = require("../controllers/userControllers");
const validateSignUp = require("../middlewares/signUpValidation");
const validateToken = require("../middlewares/tokenValidation");

const router = express.Router();

router.post("/certification", postCertification);
router.post("/verification", postVerification);
router.post("/signUp", validateSignUp, postSignUp);
router.post("/login", postLogin);
router.patch("/angels/:id", validateToken, patchAngel);

module.exports = router;
