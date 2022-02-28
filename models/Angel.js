const mongoose = require("mongoose");

const AngelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  letters: {
    type: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Letter",
      },
    ],
    default: [],
  },
  activation: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Angel", AngelSchema);
