const jwt = require("jsonwebtoken");

const generateToken = (email) => {
  const { TOKEN_KEY } = process.env;
  const accessToken = jwt.sign({ email }, TOKEN_KEY, { expiresIn: "7d" });

  return accessToken;
};

module.exports = generateToken;
