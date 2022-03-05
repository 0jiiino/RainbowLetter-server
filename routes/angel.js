const express = require("express");
const {
  postAngel,
  getAngelLetters,
  patchAngel,
} = require("../controllers/angelControllers");
const validateToken = require("../middlewares/tokenValidation");

const router = express.Router();

router.post("/", validateToken, postAngel);
router.get("/:id", validateToken, getAngelLetters);
router.patch("/:id", validateToken, patchAngel);

module.exports = router;
