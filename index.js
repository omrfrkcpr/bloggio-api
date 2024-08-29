"use strict";

require("express-async-errors");
const express = require("express");
const app = express();
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const { generalRateLimiter } = require("./src/middlewares/rateLimiters");
const {
  CLIENT_URL,
  PORT,
  HOST,
  NODE_ENV,
  SECRET_KEY,
  MONGODB_URI,
} = require("./constants");

//Connect Database
const { connectDB } = require("./src/configs/dbConnection");
connectDB();

// CORS Configs
const cors = require("cors");

const corsOptions = {
  origin: CLIENT_URL,
  methods: ["GET", "POST", "PUT", "PATCH", "HEAD", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 204,
  credentials: true,
};
app.use(cors(corsOptions));

// Passportjs Authentication Config
require("./src/configs/passportjs-auth/passportConfig");
app.use(cookieParser());
app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: NODE_ENV,
    },
  })
);

// setup passport
app.use(passport.initialize()); // integration between passportjs and express app
app.use(passport.session()); // session data controller

// Accept JSON
app.use(express.json({ limit: "10kb" }));

// Accept FormData
app.use(express.urlencoded({ extended: true }));

// Limit requests from same IP
app.use("/", generalRateLimiter);

// Logger:
app.use(require("./src/middlewares/logger"));

// Auhentication:
app.use(require("./src/middlewares/authentication"));

// findSearchSortPage / res.getModelList:
app.use(require("./src/middlewares/queryHandler"));

// Routes:
app.use("/api/v1", require("./src/routes"));

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

// errorHandler:
app.use(require("./src/middlewares/errorHandler"));

app.listen(PORT, () => console.log(`server runned on http://${HOST}:${PORT}`));
