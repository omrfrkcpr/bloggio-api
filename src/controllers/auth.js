"use strict";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Token = require("../models/token");
const TokenVerification = require("../models/tokenVerification");
const TokenBlacklist = require("../models/tokenBlacklist");
const passwordEncrypt = require("../helpers/passwordEncrypt");
const { CustomError } = require("../errors/customError");
const { sendEmail } = require("../utils/email/emailService");
const { getWelcomeEmailHtml } = require("../utils/email/welcome/welcomeEmail");
const {
  getForgotPasswordEmailHtml,
} = require("../utils/email/forgot/forgotPassword");
const {
  getResetPasswordEmailHtml,
} = require("../utils/email/reset/resetPassword");
const validator = require("validator");
const {
  generateAccessToken,
  generateRefreshToken,
  generateAllTokens,
} = require("../helpers/tokenGenerator");

module.exports = {
  register: async (req, res) => {
    /*
        #swagger.tags = ["Authentication"]
        #swagger.summary = "Register"
        #swagger.description = 'Register with valid firstName, lastName, email and password'
        // _swagger.deprecated = true
        // _swagger.ignore = true
        #swagger.parameters["body"] = {
            in: "body",
            required: true,
             schema: {
              "firstName": "John",
              "lastName": "Doe",
              "email": "john.doe@gmail.com",
              "password": "Test@1234",
             }
      }
    */
    const { firstName, lastName, email, password, username } = req.body;

    const isStrong = validator.isStrongPassword(password, {
      minLength: 6,
      minSymbols: 1,
    });

    if (!isStrong) {
      throw new CustomError(
        "Invalid Password. Please provide a valid password",
        400
      );
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      throw new CustomError("Email already exists!", 400);
    }

    let imagePath = "";
    if (req.fileLocation) {
      imagePath = req.fileLocation;
    }

    // Create new user
    user = new User({
      firstName,
      lastName,
      email,
      password: bcrypt.hashSync(password, 10),
      isActive: false, // user will active his account via verification email
      isAdmin: false,
      avatar: imagePath,
      username,
    });

    // Save new user to the database
    const newUser = await user.save();

    // Create new Token in TokenVerificationModel
    const verificationTokenData = await TokenVerification.create({
      userId: newUser._id,
      token: passwordEncrypt(newUser._id + Date.now()),
    });

    // Send email to user
    const emailSubject = "Welcome to HabitHub!";
    const emailHtml = getWelcomeEmailHtml(
      firstName,
      verificationTokenData.token
    );

    await sendEmail(email, emailSubject, emailHtml);

    // Return success message with new user data
    res.status(201).send({
      error: false,
      message: "Please verify your email to complete your registration",
    });
  },
  authSuccess: async (req, res) => {
    /*
      #swagger.tags = ["Authentication"]
      #swagger.summary = "Successful Authentication Callback"
      #swagger.description = "Handles successful authentication, generates tokens, and redirects the user to the client URL with user data encoded in the query parameters."
      #swagger.responses[302] = {
        description: 'Redirects to the client URL with user data',
        headers: {
          Location: {
            description: 'The URL to which the user is redirected after successful authentication.',
            schema: {
              type: 'string',
              example: 'https://your-client-url.com/auth/success?provider=google&user=%7B%22error%22:false,%22message%22:%22You%20are%20successfully%20logged%20in!%22,%22bearer%22:%7B%22access%22:%22access-token%22,%22refresh%22:%22refresh-token%22%7D,%22token%22:%22token-data%22,%22user%22:%7B%22id%22:%22user-id%22,%22name%22:%22John%20Doe%22%7D%7D'
            }
          }
        }
      }
      #swagger.responses[400] = {
        description: 'Bad request if the user is not authenticated',
        schema: {
          error: true,
          message: 'Authentication failed or user not found'
        }
      }
      #swagger.security = [{
        "bearerAuth": []
      }]
    */
    const client_url = process.env.CLIENT_URL;
    if (!req.user) {
      return res.redirect(`${client_url}/auth/failure`);
    }
    console.log("User: ", req.user);
    // res.redirect(`${client_url}/auth/success?provider=google`);
    // Successful authentication, send user data to frontend

    const { tokenData, accessToken, refreshToken } = await generateAllTokens(
      req.user
    );

    const data = {
      error: false,
      message: "You are successfully logged in!",
      bearer: {
        access: accessToken,
        refresh: refreshToken,
      },
      token: tokenData.token,
      user: req.user,
    };
    res.redirect(
      `${client_url}/auth/success?provider=google&user=${encodeURIComponent(
        JSON.stringify(data)
      )}`
    );
  },
  // POST
  verifyEmail: async (req, res) => {
    /*
      #swagger.tags = ['Authentication']
      #swagger.summary = 'Verification'
      #swagger.description = 'Verify user email with a verification token'
      #swagger.parameters['token'] = {
        in: 'path',
        description: 'Verification token received via email',
        required: true,
        type: 'string'
      }
  */
    const token = req.params.token;

    // Check existance of provided token in tokenVerifications collection
    const tokenData = await TokenVerification.findOne({ token });

    if (!tokenData) {
      throw new CustomError(
        "Verification failed. Please try to login or register again!",
        400
      );
    }

    // Find user
    const user = await User.findById(tokenData.userId);

    if (!user) {
      throw new CustomError("Account not found. Please try again!", 404);
    }

    // Activate user status
    user.isActive = true;
    await user.save();

    // Delete VerficiationToken
    await Token.findByIdAndDelete(tokenData._id);

    // Success response
    res
      .status(200)
      .send({ error: false, message: "Account successfully verified!" });
  },
  // POST
  login: async (req, res) => {
    /*
      #swagger.tags = ["Authentication"]
      #swagger.summary = "Login"
      #swagger.description = 'Login with email and password for get simpleToken and JWT'
      _swagger.deprecated = true
      _swagger.ignore = true
      #swagger.parameters["body"] = {
          in: "body",
          required: true,
          schema: {
              "email": "testUser@gmail.com",
              "password": "Test@1234",
          }
      }
    */
    const { email, password } = req.body;
    // console.log("Login attempt:", email, password);

    if (email && password) {
      const user = await User.findOne({ email });
      // console.log("User found:", user);

      if (!user) {
        throw new CustomError(
          "Wrong email or password. Please try to register or login again!",
          401
        );
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);
      // console.log("Password validation result:", isPasswordValid);
      if (isPasswordValid) {
        if (user.isActive) {
          //^ SIMPLE TOKEN
          let tokenData = await Token.findOne({
            userId: user.id || user._id,
          });
          // console.log("Token data found:", tokenData);

          let accessToken = "";
          let refreshToken = "";

          if (!tokenData) {
            const tokens = await generateAllTokens(user);
            accessToken = tokens.accessToken;
            refreshToken = tokens.refreshToken;
            tokenData = tokens.tokenData;
          } else {
            accessToken = await generateAccessToken(user);
            refreshToken = await generateRefreshToken(user);
          }

          console.log("Login response data:", {
            accessToken,
            refreshToken,
            tokenData,
          }); // Debugging

          //! Response for TOKEN and JWT
          res.status(200).send({
            error: false,
            message: "You are successfully logged in!",
            bearer: {
              access: accessToken,
              refresh: refreshToken,
            },
            token: tokenData.token,
            user,
          });
        } else {
          throw new CustomError(
            "Unverified Account. Please verify your email address!",
            401
          );
        }
      } else {
        throw new CustomError(
          "Wrong email or password. Please try again!",
          401
        );
      }
    } else {
      throw new CustomError("Please provide a valid email and password", 401);
    }
  },
  // POST
  forgot: async (req, res) => {
    /*
      #swagger.tags = ['Authentication']
      #swagger.summary = 'Forgot'
      #swagger.description = 'Request a url with email to reset password'
      #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
              "email":"testUser@gmail.com"
          }
      }
    */
    const { email } = req.body;
    const user = await User.findOne({ email });
    //console.log(user, "forgot");
    if (!user) {
      throw new CustomError("Wrong email address!", 401);
    }

    const forgotToken = await jwt.sign(
      { id: user?._id || user?.id },
      process.env.REFRESH_KEY,
      {
        expiresIn: "1d",
      }
    );
    // console.log(token, "tokenGenerated");

    if (forgotToken) {
      // Send forgot request email to user
      const forgotEmailSubject = "Password Reset Request!";
      const forgotEmailHtml = getForgotPasswordEmailHtml(
        user.firstName,
        forgotToken
      );

      await sendEmail(email, forgotEmailSubject, forgotEmailHtml);

      res.status(200).send({
        error: false,
        message:
          "Password reset link has been sent to your e-mail. Please check your mailbox.",
      });
    }
  },
  // POST
  reset: async (req, res) => {
    /*
      #swagger.tags = ['Authentication']
      #swagger.summary = 'JWT: Reset'
      #swagger.description = 'Reset password with email, new password, and refresh token.'
      #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            email: 'testUser@gmail.com',
            newPassword: 'newPassword@123',
          }
      }
      #swagger.parameters['token'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Refresh token received via email',
      }
    */
    const { email, newPassword } = req.body;
    const { token } = req.params;

    const refreshToken = token;

    if (email && newPassword && refreshToken) {
      // Validate the new password
      const isStrong = validator.isStrongPassword(newPassword, {
        minLength: 6,
        minSymbols: 1,
      });

      if (!isStrong) {
        throw new CustomError(
          "Invalid Password. Please provide a valid password",
          400
        );
      }

      // Search for this user with email
      const user = await User.findOne({ email });
      console.log(user, "userFound");

      if (!user) {
        throw new CustomError("No such user found, please try again!", 404);
      }

      // Verify token
      const decoded = await jwt.verify(refreshToken, process.env.REFRESH_KEY);
      // console.log(decoded, "tokenVerified");

      if (!decoded) {
        throw new CustomError("Invalid or expired token", 400);
      }

      const userId = decoded.id;
      const userToUpdate = await User.findById(userId);

      if (userToUpdate) {
        // Hash the new password
        const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

        // Reset validated and hashed password
        userToUpdate.password = hashedNewPassword;
        await userToUpdate.save();
        // console.log(userToUpdate, "passwordUpdated");

        // Send reset email to user
        const resetEmailSubject = "Password Reset Confirmation!";
        const resetEmailHtml = getResetPasswordEmailHtml(
          userToUpdate.firstName
        );

        await sendEmail(email, resetEmailSubject, resetEmailHtml);

        res.status(200).send({
          message: "Your Password has been successfully reset!",
          error: false,
        });
      } else {
        throw new CustomError("User not found!", 404);
      }
    } else {
      throw new CustomError("Missing required fields!", 400);
    }
  },
  // POST
  refresh: async (req, res) => {
    /*
      #swagger.tags = ['Authentication']
      #swagger.summary = 'JWT: Refresh'
      #swagger.description = 'Refresh accessToken with refreshToken'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            bearer: {
                refresh: '...refreshToken...'
            }
        }
      }
    */
    const refreshToken = req.body?.bearer?.refresh;

    if (refreshToken) {
      // Verify the refresh token
      const refreshData = await jwt.verify(
        refreshToken,
        process.env.REFRESH_KEY
      );

      if (refreshData) {
        const { _id } = refreshData;

        // Check if id exist in token data
        if (_id) {
          // Find the user by id in the database
          const user = await User.findOne({ _id });

          if (user) {
            // Check if the user is active
            if (user.isActive) {
              // Generate a new JWT access token
              const accessToken = jwt.sign(
                user.toJSON(),
                process.env.ACCESS_KEY,
                {
                  expiresIn: process.env.ACCESS_EXP || "30m",
                }
              );

              // Return the new access token
              res.status(200).send({
                error: false,
                bearer: {
                  access: accessToken,
                },
              });
            } else {
              throw new CustomError(
                "Unverified Account. Please verify your email address!",
                401
              );
            }
          } else {
            throw new CustomError("Wrong user data!", 401);
          }
        } else {
          throw new CustomError("No data found in refresh token!", 404);
        }
      } else {
        throw new CustomError(
          "JWT refresh token has expired or is invalid!",
          401
        );
      }
    } else {
      throw new CustomError("No refresh token provided!", 401);
    }
  },
  // GET
  logout: async (req, res) => {
    /*
      #swagger.tags = ["Authentication"]
      #swagger.summary = "SimpleToken: Logout"
      #swagger.description = 'Delete simple token key and put JWT to the Blacklist.'
    */

    const auth = req.headers?.authorization;
    const tokenKey = auth ? auth.split(" ") : null;
    let deleted = null;

    if (tokenKey && tokenKey[0] == "Token") {
      // Simple Token Logout
      deleted = await Token.deleteOne({ token: tokenKey[1] });
    } else if (tokenKey && tokenKey[0] == "Bearer") {
      // JWT Token Logout
      const token = tokenKey[1];
      const decoded = jwt.verify(token, process.env.ACCESS_KEY);
      if (decoded) {
        // Add jwt token to the blacklist
        const blacklisted = new TokenBlacklist({ token: token });
        await blacklisted.save();
        deleted = true; // Assuming this is successful due to Blacklisting
      }
    }

    res.status(deleted !== null ? 200 : 400).send({
      error: !deleted !== null,
      message:
        deleted !== null
          ? "You are successfully logged out!"
          : "Logout failed. Please try again!",
    });
  },
};
