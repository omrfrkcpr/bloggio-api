"use strict";

const mongoose = require("mongoose");
const { MONGODB_URI } = require("../../constants");

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("MongoDB Not Connected!: ", err.message);
    process.exit(1);
  }
};

module.exports = { mongoose, connectDB };
