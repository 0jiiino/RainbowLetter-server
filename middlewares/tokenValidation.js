const jwt = require("jsonwebtoken");

const { ERROR_RESPONSE } = require("../constant");

const validateToken = (req, res, next) => {
  const { TOKEN_KEY } = process.env;
  const accessToken = req.get("Authorization");

  try {
    jwt.verify(accessToken, TOKEN_KEY);

    next();
  } catch {
    res.json({
      error: {
        status: 401,
        message: ERROR_RESPONSE.UNAUTHORIZED,
      },
    });
  }
};

module.exports = validateToken;
