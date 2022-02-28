const axios = require("axios");
const redis = require("redis");

const User = require("../models/User");
const { date, signature } = require("../utils/smsHeader");
const { RESPONSE, ERROR_RESPONSE, URL } = require("../constant");

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
    const existedUser = await User.findOne({ phoneNumber });

    if (existedUser) {
      return res.json({
        status: 400,
        result: RESPONSE.EXISTED_PHONE_NUMBER,
      });
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
    const certificationCode = await client.get(phoneNumber);

    if (code === certificationCode) {
      return res.json({
        status: 201,
        result: RESPONSE.SUCCESS,
      });
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

exports.postCertification = postCertification;
exports.postVerification = postVerification;
