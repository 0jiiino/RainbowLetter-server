require("../models/Letter");
const Angel = require("../models/Angel");
const User = require("../models/User");
const { ERROR_RESPONSE } = require("../constant");

const postAngel = async (req, res, next) => {
  const { id: userId, name } = req.body;

  try {
    const { _id: id } = await Angel.create({ name });
    const user = await User.findById(userId);

    user.angels.push(id);
    await user.save();

    res.json({
      status: 201,
      angel: {
        id,
        name,
      },
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

const getAngelLetters = async (req, res, next) => {
  const { id } = req.params;

  try {
    const { letters } = await Angel.findById(id).populate("letters").lean();

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

const patchAngel = async (req, res, next) => {
  const { id } = req.params;
  const { activation } = req.body;

  try {
    const angel = await Angel.findById(id).populate("letters");
    const { letters } = angel;

    for (let i = 0; i < letters.length; i++) {
      if (letters[i].echo) {
        letters.echo = false;

        await letters[i].save();
      }
    }

    angel.activation = activation;

    await angel.save();

    res.json({
      status: 201,
      result: "success",
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

exports.postAngel = postAngel;
exports.getAngelLetters = getAngelLetters;
exports.patchAngel = patchAngel;
