const express = require("express");
const {
  patchEcho,
  getLetters,
  putReply,
} = require("../controllers/letterControllers");
const validateToken = require("../middlewares/tokenValidation");

const router = express.Router();

router.get("/", validateToken, getLetters);
router.patch("/:id/echos", validateToken, patchEcho);
router.put("/:id/replies", validateToken, putReply);

module.exports = router;
