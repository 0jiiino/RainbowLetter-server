const axios = require("axios");
const bcrypt = require("bcrypt");
const cache = require("memory-cache");
const cryptoJs = require("crypto-js");

require("../models/Angel");
const User = require("../models/User");
const generateToken = require("../utils/tokenGenerator");
const { RESPONSE, ERROR_RESPONSE, URL } = require("../constant");

const postCertification = async (req, res, next) => {
  const { phoneNumber } = req.body;
  const { NCP_ACCESS_KEY, NCP_SECRET_KEY, NCP_SERVICE_ID, CALLER_ID } =
    process.env;

  const date = Date.now().toString();
  const method = "POST";
  const space = " ";
  const newLine = "\n";
  const url2 = `/sms/v2/services/${NCP_SERVICE_ID}/messages`;
  const hmac = cryptoJs.algo.HMAC.create(cryptoJs.algo.SHA256, NCP_SECRET_KEY);

  const certificationCode =
    Math.floor(Math.random() * (999999 - 100000)) + 100000;

  cache.del(phoneNumber);
  cache.put(phoneNumber, certificationCode.toString(), 180000);

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
    const existedUser = await User.findOne({ phoneNumber }).lean().exec();

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
        content: `[무지개편지]\n인증번호 [${certificationCode}]를 입력해주세요.`,
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
  const certificationCode = cache.get(phoneNumber);

  try {
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
    const existedEmail = await User.findOne({ email }).lean().exec();
    const existedNickname = await User.findOne({ nickname }).lean().exec();

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
    const user = await User.findOne({ email }).populate("angels").lean().exec();

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
