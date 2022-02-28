const joi = require("joi");

const validateSignUp = async (req, res, next) => {
  const userSchema = joi.object({
    email: joi
      .string()
      .required()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      }),
    password: joi.string().required().min(8),
    phoneNumber: joi.string().required().length(11),
    nickname: joi.string().required(),
  });

  const value = userSchema.validate(req.body, {
    abortEarly: false,
  });

  if (value.error) {
    const errorMessage = {};
    const { details } = value.error;

    for (let i = 0; i < details.length; i++) {
      const error = details[i];

      errorMessage[error.path[0]] = error.message;
    }

    res.json({
      status: 400,
      error: errorMessage,
    });

    return;
  }

  next();
};

module.exports = validateSignUp;
