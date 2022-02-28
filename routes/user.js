const express = require("express");

const { postCertification } = require("../controllers/userControllers");

const router = express.Router();

router.post("/certification", postCertification);

module.exports = router;
