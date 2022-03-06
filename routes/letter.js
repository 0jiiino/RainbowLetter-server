const express = require("express");
const { patchEcho, getLetters } = require("../controllers/letterControllers");
const validateToken = require("../middlewares/tokenValidation");

const router = express.Router();

router.get("/", validateToken, getLetters);
router.patch("/:id/echos", validateToken, patchEcho);

module.exports = router;
