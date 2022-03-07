const axios = require("axios");

const Letter = require("../models/Letter");
const User = require("../models/User");
const { ERROR_RESPONSE, RESPONSE, URL } = require("../constant");
const { date, signature } = require("../utils/smsHeader");
const sendSMS = require("../utils/sendSMS");

const getLetters = async (req, res, next) => {
  try {
    const letters = await Letter.find({ echo: true })
      .sort([["createdAt", -1]])
      .lean();

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
    letter.createdAt = Date.now();
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

const putReply = async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const { creator } = await Letter.findById(id).lean();
    const { phoneNumber } = await User.findOne({ nickname: creator }).lean();

    const info = { message: content, phoneNumber };

    sendSMS({ info });

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

exports.getLetters = getLetters;
exports.patchEcho = patchEcho;
exports.putReply = putReply;
