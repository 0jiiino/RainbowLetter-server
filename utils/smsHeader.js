const cryptoJs = require("crypto-js");

const { NCP_ACCESS_KEY, NCP_SECRET_KEY, NCP_SERVICE_ID } = process.env;
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

exports.signature = signature;
exports.date = date;
