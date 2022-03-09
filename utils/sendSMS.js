const axios = require("axios");

const { date, signature } = require("./smsHeader");
const { URL } = require("../constant");

const sendSMS = async (info) => {
  const { message, phoneNumber } = info;
  const { NCP_ACCESS_KEY, CALLER_ID } = process.env;

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
      content: `[무지개편지]\n${message}`,
      messages: [
        {
          to: `${phoneNumber}`,
        },
      ],
    },
  });
};

module.exports = sendSMS;
