const express = require("express");

const {
  postAngel,
  getAngelLetters,
  patchAngel,
  postLetter,
} = require("../controllers/angelControllers");
const validateToken = require("../middlewares/tokenValidation");

const router = express.Router();

router.post("/", validateToken, postAngel);
router.get("/:id", validateToken, getAngelLetters);
router.patch("/:id", validateToken, patchAngel);
router.post("/letters", validateToken, postLetter);

module.exports = router;
