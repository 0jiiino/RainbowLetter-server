const mongoose = require("mongoose");

const LetterSchema = new mongoose.Schema({
  creator: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  echo: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Letter", LetterSchema);
