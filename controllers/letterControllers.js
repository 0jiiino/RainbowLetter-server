const axios = require("axios");
const cryptoJs = require("crypto-js");

const Letter = require("../models/Letter");
const User = require("../models/User");
const { ERROR_RESPONSE, RESPONSE, URL } = require("../constant");

const getLetters = async (req, res, next) => {
  try {
    const letters = await Letter.find({ echo: true })
      .sort([["createdAt", -1]])
      .lean()
      .exec();

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
    const letter = await Letter.findById(id).exec();

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
  const { NCP_ACCESS_KEY, NCP_SECRET_KEY, NCP_SERVICE_ID, CALLER_ID } =
    process.env;

  const date = Date.now().toString();
  const method = "POST";
  const space = " ";
  const newLine = "\n";
  const url2 = `/sms/v2/services/${NCP_SERVICE_ID}/messages`;

  const hmac = cryptoJs.algo.HMAC.create(cryptoJs.algo.SHA256, NCP_SECRET_KEY);

  hmac.update(method);
  hmac.update(space);
  hmac.update(url2);
  hmac.update(newLine);
  hmac.update(date);
  hmac.update(newLine);
  hmac.update(NCP_ACCESS_KEY);

  const hash = hmac.finalize();
  const signature = hash.toString(cryptoJs.enc.Base64);

  try {
    const { creator } = await Letter.findById(id).lean().exec();
    const { phoneNumber } = await User.findOne({ nickname: creator })
      .lean()
      .exec();

    await axios({
      method: "POST",
      json: true,
      url: URL,
      headers: {
        "Content-Type": "application/json",
        "x-ncp-iam-access-key": NCP_ACCESS_KEY,
        "x-ncp-apigw-timestamp": date,
        "x-ncp-apigw-signature-v2": signature,
      },
      data: {
        type: "SMS",
        contentType: "COMM",
        countryCode: "82",
        from: CALLER_ID,
        content: `[무지개편지]\n${content}`,
        messages: [
          {
            to: `${phoneNumber}`,
          },
        ],
      },
    });

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
