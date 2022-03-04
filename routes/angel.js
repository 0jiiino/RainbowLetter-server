const express = require("express");
const {
  postAngel,
  getAngelLetters,
} = require("../controllers/angelControllers");
const validateToken = require("../middlewares/tokenValidation");

const router = express.Router();

router.post("/", validateToken, postAngel);
router.get("/:id", validateToken, getAngelLetters);

module.exports = router;
