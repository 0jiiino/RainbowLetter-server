const express = require("express");

const {
  postAngel,
  getAngelLetters,
  patchAngel,
  postLetter,
  getAngels,
  deleteAngel,
  getMailboxLetters,
} = require("../controllers/angelControllers");
const validateToken = require("../middlewares/tokenValidation");

const router = express.Router();

router.post("/", validateToken, postAngel);
router.get("/:id", validateToken, getAngelLetters);
router.patch("/:id", validateToken, patchAngel);
router.post("/letters", validateToken, postLetter);
router.get("/users/:id", validateToken, getAngels);
router.delete("/:angelId/users/:userId", validateToken, deleteAngel);
router.get("/:id/letters", validateToken, getMailboxLetters);

module.exports = router;
