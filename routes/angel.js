const express = require("express");
const { postAngel } = require("../controllers/angelControllers");
const validateToken = require("../middlewares/tokenValidation");

const router = express.Router();

router.post("/", validateToken, postAngel);

module.exports = router;
