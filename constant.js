const URL = `https://sens.apigw.ntruss.com/sms/v2/services/${process.env.NCP_SERVICE_ID}/messages`;

const RESPONSE = Object.freeze({
  SUCCESS: "success",
  FAIL: "fail",
  EXISTED_PHONE_NUMBER: "이미 존재하는 번호입니다.",
  EXISTED_EMAIL: "이미 존재하는 이메일입니다.",
  EXISTED_NICKNAME: "이미 존재하는 별명입니다.",
});

const ERROR_RESPONSE = Object.freeze({
  SERVER_ERROR: "Internal Server Error",
});

exports.RESPONSE = RESPONSE;
exports.ERROR_RESPONSE = ERROR_RESPONSE;
exports.URL = URL;
