require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const user = require("./routes/user");
const angel = require("./routes/angel");

const app = express();

mongoose.connect(process.env.MONGODB_URL).catch((error) => {
  console.log(`🔴 Connection error.. with [${error}]`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/users", user);
app.use("/angels", angel);

module.exports = app;
