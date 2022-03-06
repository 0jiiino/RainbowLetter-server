const Letter = require("../models/Letter");
const { RESPONSE, ERROR_RESPONSE } = require("../constant");

const patchEcho = async (req, res, next) => {
  const { echo } = req.body;
  const { id } = req.params;

  try {
    const letter = await Letter.findById(id);

    letter.echo = echo;
    await letter.save();

    res.json({
      status: 200,
      result: RESPONSE.SUCCESS,
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

exports.patchEcho = patchEcho;
