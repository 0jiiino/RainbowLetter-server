const express = require("express");
const { patchEcho } = require("../controllers/letterControllers");
const validateToken = require("../middlewares/tokenValidation");

const router = express.Router();

router.patch("/:id/echos", patchEcho);

module.exports = router;
