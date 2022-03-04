const axios = require("axios");
const redis = require("redis");
const bcrypt = require("bcrypt");

const Angel = require("../models/Angel");
const User = require("../models/User");
const generateToken = require("../utils/tokenGenerator");
const { date, signature } = require("../utils/smsHeader");
const { RESPONSE, ERROR_RESPONSE, URL } = require("../constant");
const { response } = require("express");

const client = redis.createClient();

client.connect();

const postCertification = async (req, res, next) => {
  const { NCP_ACCESS_KEY, CALLER_ID } = process.env;
  const { phoneNumber } = req.body;

  const certificationCode =
    Math.floor(Math.random() * (999999 - 100000)) + 100000;

  client.del(phoneNumber);
  client.set(phoneNumber, certificationCode.toString());
  client.expire(phoneNumber, 3600);

  try {
    const existedUser = await User.findOne({ phoneNumber }).lean();

    if (existedUser) {
      res.json({
        status: 400,
        result: RESPONSE.EXISTED_PHONE_NUMBER,
      });

      return;
    }

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
        content: `[무지개편지] 인증번호 [${certificationCode}]를 입력해주세요.`,
        messages: [
          {
            to: `${phoneNumber}`,
          },
        ],
      },
    });

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

const postVerification = async (req, res, next) => {
  const { phoneNumber, code } = req.body;

  try {
    const certificationCode = await client.get(phoneNumber).lean();

    if (code === certificationCode) {
      res.json({
        status: 201,
        result: RESPONSE.SUCCESS,
      });

      return;
    }

    res.json({
      status: 400,
      result: RESPONSE.FAIL,
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

const postSignUp = async (req, res, next) => {
  const { email, password, phoneNumber, nickname } = req.body;
  const { SALT } = process.env;

  try {
    const existedEmail = await User.findOne({ email }).lean();
    const existedNickname = await User.findOne({ nickname }).lean();

    if (existedEmail) {
      res.json({
        status: 400,
        result: RESPONSE.EXISTED_EMAIL,
      });

      return;
    }

    if (existedNickname) {
      res.json({
        status: 400,
        result: RESPONSE.EXISTED_NICKNAME,
      });

      return;
    }

    const encryptedPassword = bcrypt.hashSync(password, Number(SALT));

    await User.create({
      email,
      phoneNumber,
      nickname,
      password: encryptedPassword,
    });

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

const postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate("angels").lean();

    if (!user) {
      res.json({
        status: 400,
        result: RESPONSE.NOT_EXISTED_USER,
      });

      return;
    }

    const isMatchedPassword = await bcrypt.compare(password, user.password);

    if (!isMatchedPassword) {
      res.json({
        status: 400,
        result: RESPONSE.NOT_MATCH_PASSWORD,
      });

      return;
    }

    const accessToken = generateToken(email);
    const { _id: id, nickname, angels } = user;

    if (!angels.length) {
      res.json({
        user: {
          id,
          nickname,
        },
        accessToken,
      });

      return;
    }

    const angel = {};

    for (let i = 0; i < angels.length; i++) {
      if (angels[i].activation) {
        angel.id = angels[i]._id;
        angel.name = angels[i].name;

        break;
      }
    }

    res.json({
      user: {
        id,
        nickname,
        angel,
      },
      accessToken,
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

    response.json({
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

exports.postCertification = postCertification;
exports.postVerification = postVerification;
exports.postSignUp = postSignUp;
exports.postLogin = postLogin;
exports.patchAngel = patchAngel;
