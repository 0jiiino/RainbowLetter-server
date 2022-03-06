const Letter = require("../models/Letter");
const { ERROR_RESPONSE } = require("../constant");

const getLetters = async (req, res, next) => {
  try {
    const letters = await Letter.find({ echo: true }).lean();

    res.json({
      status: 200,
      letters,
    });
  } catch {
    res.json({
      error: {
        status: 500,
        message: ERROR_RESPONSE.SERVER_ERROR,
      },
    });
  }
};

const patchEcho = async (req, res, next) => {
  const { echo } = req.body;
  const { id } = req.params;

  try {
    const letter = await Letter.findById(id);

    letter.echo = echo;
    await letter.save();

    res.json({
      status: 200,
      id,
      echo,
    });
  } catch {
    res.json({
      error: {
        status: 500,
        message: ERROR_RESPONSE.SERVER_ERROR,
      },
    });
  }
};

exports.getLetters = getLetters;
exports.patchEcho = patchEcho;
