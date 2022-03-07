const redis = require("redis");
const bcrypt = require("bcrypt");

require("../models/Angel");
const User = require("../models/User");
const generateToken = require("../utils/tokenGenerator");
const sendSMS = require("../utils/sendSMS");
const { RESPONSE, ERROR_RESPONSE } = require("../constant");

const client = redis.createClient();

client.connect();

const postCertification = async (req, res, next) => {
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

    const info = {
      message: `[무지개편지] 인증번호 [${certificationCode}]를 입력해주세요.`,
      phoneNumber,
    };

    sendSMS(info);

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

exports.postCertification = postCertification;
exports.postVerification = postVerification;
exports.postSignUp = postSignUp;
exports.postLogin = postLogin;
