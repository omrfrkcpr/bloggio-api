"use strict";

require("dotenv").config();

module.exports = {
  PORT: process.env?.PORT || 8000,
  HOST: process.env?.HOST || "127.0.0.1",
  CLIENT_URL: process.env?.CLIENT_URL,
  MONGODB_URI: process.env?.MONGODB_URI,
  SECRET_KEY: process.env?.SECRET_KEY,
  PAGE_SIZE: process.env?.PAGE_SIZE || 25,
  ACCESS_KEY: process.env?.ACCESS_KEY,
  ACCESS_EXP: process.env?.ACCESS_EXP || "30m",
  REFRESH_KEY: process.env?.REFRESH_KEY,
  REFRESH_EXP: process.env?.REFRESH_EXP || "2d",
  VERSION: process.env?.VERSION,
};
