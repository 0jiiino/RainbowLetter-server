const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    unique: true,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  angel: {
    type: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Angel",
      },
    ],
    default: [],
  },
});

module.exports = mongoose.model("User", UserSchema);
