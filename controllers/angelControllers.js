const Angel = require("../models/Angel");
const User = require("../models/User");
const { ERROR_RESPONSE } = require("../constant");

const postAngel = async (req, res, next) => {
  const { id: userId, name } = req.body;

  try {
    const { _id: id } = await Angel.create({ name });
    const user = await User.findById(userId);

    user.angels.push(id);
    await user.save();

    res.json({
      status: 201,
      angel: {
        id,
        name,
      },
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

exports.postAngel = postAngel;
