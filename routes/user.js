const express = require("express");

const {
  postCertification,
  postVerification,
  postSignUp,
  postLogin,
  deleteUser,
} = require("../controllers/userControllers");
const validateSignUp = require("../middlewares/signUpValidation");
const validateToken = require("../middlewares/tokenValidation");

const router = express.Router();

router.post("/certification", postCertification);
router.post("/verification", postVerification);
router.post("/signUp", validateSignUp, postSignUp);
router.post("/login", postLogin);
router.delete("/:id", validateToken, deleteUser);

module.exports = router;
