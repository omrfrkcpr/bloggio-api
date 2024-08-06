"use strict";

require("express-async-errors");
const express = require("express");
const app = express();
const { CLIENT_URL, PORT, HOST } = require("./constants");

//Connect Database
const { connectDB } = require("./src/configs/dbConnection");
connectDB();

//CORS
const cors = require("cors");
const corsOptions = {
  origin: CLIENT_URL,
  methods: ["GET", "POST", "PUT", "PATCH", "HEAD", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 204,
  credentials: true,
};
app.use(cors(corsOptions));

// Accept JSON
app.use(express.json({ limit: "10kb" }));

// Accept FormData
app.use(express.urlencoded({ extended: true }));

app.all("/", (req, res) => {
  res.send({
    error: false,
    message: "Welcome to Bloggio API",
  });
});

app.use((req, res, next) => {
  res.status(404).send({
    error: true,
    message: "Route not found!",
  });
});

app.listen(PORT, () => console.log(`server runned on http://${HOST}:${PORT}`));
