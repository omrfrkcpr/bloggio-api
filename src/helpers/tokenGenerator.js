"use strict";

const jwt = require("jsonwebtoken");
const passwordEncrypt = require("../helpers/passwordEncrypt");
const Token = require("../models/token");

// Generate Simple Token
const generateSimpleToken = async (user) => {
  const token = passwordEncrypt((user._id) + Date.now());
  const tokenData = await Token.create({
    userId: user._id,
    token: token,
  });

  console.log("Simple Token generated: ", tokenData.token);
  return tokenData;
};

// Generate Access Token
const generateAccessToken = (user) => {
  const accessInfo = {
    key: process.env.ACCESS_KEY,
    time: process.env.ACCESS_EXP || "30m",
    data: {
      _id: user._id,
      email: user.email,
      isActive: user.isActive,
      isAdmin: user.isAdmin,
    },
  };

  const accessToken = jwt.sign(accessInfo.data, accessInfo.key, {
    expiresIn: accessInfo.time,
  });

  console.log("AccessToken generated: ", accessToken);
  return accessToken;
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  const refreshInfo = {
    key: process.env.REFRESH_KEY,
    time: process.env.REFRESH_EXP || "3d",
    data: {
      _id: user._id,
    },
  };

  const refreshToken = jwt.sign(refreshInfo.data, refreshInfo.key, {
    expiresIn: refreshInfo.time,
  });

  console.log("RefreshToken generated: ", refreshToken);
  return refreshToken;
};

// Generate All Tokens
const generateAllTokens = async (user) => {
  const tokenData = await generateSimpleToken(user);
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { tokenData, accessToken, refreshToken };
};

module.exports = {
  generateSimpleToken,
  generateAccessToken,
  generateRefreshToken,
  generateAllTokens,
};
