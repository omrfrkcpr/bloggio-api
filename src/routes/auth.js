"use strict";

const router = require("express").Router();
const {
  register,
  login,
  refresh,
  reset,
  forgot,
  verifyEmail,
  logout,
  authSuccess,
} = require("../controllers/auth");
const passport = require("passport");

// BASE_URL: /auth

const client_url = process.env.CLIENT_URL;

router.post("/register", register);
router.post("/verify-email/:token", verifyEmail);
router.post("/login", login);
router.get("/logout", logout);

router.post("/refresh", refresh);
router.post("/forgot", forgot);
router.post("/reset/:token", reset);

// Google authentication routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: true,
    failureRedirect: `${client_url}/auth/failure`,
  }),
  authSuccess
);

module.exports = router;
