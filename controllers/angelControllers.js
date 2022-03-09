const Letter = require("../models/Letter");
const Angel = require("../models/Angel");
const User = require("../models/User");
const { ERROR_RESPONSE, RESPONSE } = require("../constant");

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

const postLetter = async (req, res, next) => {
  const { nickname, id, title, content } = req.body;

  try {
    const newLetter = await Letter.create({
      creator: nickname,
      createdAt: new Date(),
      title,
      content,
    });

    const angel = await Angel.findById(id);
    angel.letters.push(newLetter._id);

    await angel.save();

    res.json({
      status: 201,
      letter: newLetter,
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

const getAngels = async (req, res, next) => {
  const { id } = req.params;
  const inactiveAngels = [];

  try {
    const { angels } = await User.findById(id)
      .populate({
        path: "angels",
      })
      .lean()
      .exec();

    for (let i = 0; i < angels.length; i++) {
      if (!angels[i].activation) {
        const angelInfo = { name: angels[i].name, id: angels[i]._id };

        inactiveAngels.push(angelInfo);
      }
    }

    res.json({
      mailboxAngels: inactiveAngels,
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
exports.postLetter = postLetter;
exports.getAngels = getAngels;
