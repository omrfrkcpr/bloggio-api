"use strict";

const User = require("../models/user");
const Token = require("../models/token");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const bcrypt = require("bcrypt");
const passwordEncrypt = require("../helpers/passwordEncrypt");
const validator = require("validator");
const {
  deleteObjectByDateKeyNumber,
} = require("../helpers/deleteObjectByKeyNumberS3Bucket");
const { extractDateNumber } = require("../helpers/extractDateNumber");
const { CustomError } = require("../errors/customError");
const { sendFeedbackEmail } = require("../utils/email/emailService");
const { AWS_S3_BUCKET_REGION } = require("../../constants");

module.exports = {
  // GET
  list: async (req, res) => {
    /*
      #swagger.tags = ["Users"]
      #swagger.summary = "List Users"
      #swagger.description = `
        You can send query with endpoint for search[], sort[], page and limit.
        <ul> Examples:
            <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
            <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
            <li>URL/?<b>page=2&limit=1</b></li>
        </ul>
      `
    */
    const data = await res.getModelList(User);
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(User),
      data,
    });
  },
  // /:id => GET
  read: async (req, res) => {
    /*
      #swagger.tags = ["Users"]
      #swagger.summary = "Get Single User"
      #swagger.parameters['id'] = {
        in: 'path',
        description: 'User ID',
        required: true,
        type: 'string'
      }
    */
    const filters = req.user?.isAdmin
      ? { _id: req.params.id }
      : { _id: req.user?._id };

    const data = await User.findOne(filters);
    res.status(200).send({
      error: false,
      data,
    });
  },
  // POST
  create: async (req, res) => {
    /*
      #swagger.tags = ["Users"]
      #swagger.summary = "Create User"
      #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
              $ref: "#/definitions/User'
          }
      }
    */

    const isAdmin = req.body.isAdmin || false;
    req.body.isActive = req.body.isActive || true;
    req.body.isAdmin = isAdmin;

    // If new user is admin, then set the other user as isAdmin = false
    if (isAdmin) {
      // set all admin user's as isAdmin = false
      await User.updateMany({ isAdmin: true }, { isAdmin: false });
    }

    let imagePath = "";
    if (req.fileLocation) {
      imagePath = req.fileLocation;
    }

    // Create new user in database
    const data = await User.create({
      ...req.body,
      passpord: bcrypt.hashSync(req.body.password, 10),
      avatar: imagePath,
    });

    // Create new token for new user
    const tokenData = await Token.create({
      userId: data._id,
      token: passwordEncrypt(data._id + Date.now()),
    });

    res.status(201).send({
      error: false,
      message: "New Account successfully created",
      token: tokenData.token,
      data,
    });
  },
  // /:id => PUT / PATCH
  update: async (req, res) => {
    /*
      #swagger.tags = ["Users"]
      #swagger.summary = "Update User"
      #swagger.parameters['id'] = {
        in: 'path',
        description: 'User ID',
        required: true,
        type: 'string'
      }      
      #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
              $ref: "#/definitions/User'
          }
      }
    */
    if (req.body.email) {
      const existingUser = await User.findOne({
        email: req.body.email,
      });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        throw new CustomError("Email already exists", 400);
      }
    } else if (req.body.username) {
      const existingUser = await User.findOne({
        username: req.body.username,
      });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        throw new CustomError("Username already exists", 400);
      }
    }

    const customFilter = req.user?.isAdmin
      ? { _id: req.params.id }
      : { _id: req.user?._id };

    if (!req.user.isAdmin) {
      delete req.body.isActive;
      delete req.body.isAdmin;
    }

    // Fetch current user from database
    const user = await User.findOne(customFilter);

    // Check if password is being updated
    if (req.body.password) {
      const oldPassword = req.body.oldPassword;

      if (!oldPassword) {
        throw new CustomError(
          "Current Password is required to update password",
          400
        );
      } else {
        // Check if old password is correct
        const isCorrectPassword = bcrypt.compareSync(
          oldPassword,
          user.password
        );
        if (!isCorrectPassword) {
          throw new CustomError(
            "Please provide correct current password!",
            401
          );
        }
      }

      const isStrong = validator.isStrongPassword(req.body.password, {
        minLength: 6,
        minSymbols: 1,
      });

      if (!isStrong) {
        throw new CustomError(
          "Invalid Password. Please provide a valid password",
          400
        );
      }
      // Compare new password with current hashed password
      const isSamePassword = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      // If new password is different, hash the new password
      if (!isSamePassword) {
        req.body.password = bcrypt.hashSync(req.body.password, 10);
      }
    }

    // ====================USER-AVATAR===================== //

    const avatarIncludesS3 =
      user.avatar && user.avatar.includes(AWS_S3_BUCKET_REGION);

    if (req.fileLocation) {
      if (avatarIncludesS3) {
        const identifierForImage = extractDateNumber(user.avatar);
        await deleteObjectByDateKeyNumber(identifierForImage); // delete existing user avatar from S3 bucket
      }
      req.body.avatar = req.fileLocation;
    } else if (user.avatar && req.body.avatar === "") {
      if (avatarIncludesS3) {
        const identifierForImage = extractDateNumber(user.avatar);
        await deleteObjectByDateKeyNumber(identifierForImage); // just delete existing user avatar from S3 bucket
      }
    }

    // ====================USER-AVATAR===================== //

    if (req.body.oldPassword) {
      delete req.body.oldPassword; // requires just for security and user notifications
    }

    const data = await User.findOneAndUpdate(customFilter, req.body, {
      runValidators: true,
    }); // returns data

    let message;

    if (req.body.password) {
      message = "Your password has been updated successfully.";
    } else if (
      req.body.username ||
      req.body.email ||
      req.body.avatar ||
      req.body.firstName ||
      req.body.lastName
    ) {
      message = "Your profile information has been updated successfully.";
    } else {
      message = "Your changes have been saved successfully.";
    }

    res.status(202).send({
      error: false,
      message,
      new: await User.findOne(customFilter),
      data,
    });
  },
  // feedback => POST
  handleFeedback: async (req, res) => {
    /*
      #swagger.tags = ["Users"]
      #swagger.summary = "Submit Feedback"
      #swagger.description = "Handles user feedback submission by validating input and sending feedback via email."
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Feedback submission data',
        required: true,
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the user',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user',
              example: 'john.doe@example.com'
            },
            subject: {
              type: 'string',
              description: 'Subject of the feedback',
              example: 'Feedback Subject'
            },
            feedback: {
              type: 'string',
              description: 'Feedback message',
              example: 'This is a feedback message.'
            }
          },
          required: ['name', 'email', 'feedback']
        }
      }
    */
    const { name, email, subject, feedback } = req.body;

    if (!name || !email || !feedback) {
      throw new CustomError("Please fill the contact form!", 400);
    }

    // send feedback email
    await sendFeedbackEmail(name, email, subject, feedback);

    res.status(200).send({
      error: false,
      message: "Thank you. We will get back to you as soon as possible!",
    });
  },
  // agree-contract/:userId => PUT
  agreeContract: async (req, res) => {
    /*
      #swagger.tags = ["Users"]
      #swagger.summary = "Agree to Contract"
      #swagger.description = "Updates user agreement status to indicate they have agreed to the contract."
      #swagger.parameters['userId'] = {
        in: 'path',
        description: 'ID of the user',
        required: true,
        type: 'string',
        example: '60c72b2f9f1b2c6f4c8e9b6a'
      }
    */
    if (req.params.userId) {
      const user = await User.findOneAndUpdate(
        { _id: req.params.userId },
        { isAgreed: true },
        {
          new: true,
          runValidators: true,
        }
      );

      res.status(200).send({
        error: false,
        message: "User has agreed to the contract",
        new: user,
      });
    }
  },
  // /:id => DELETE
  delete: async (req, res) => {
    /*
      #swagger.tags = ["Users"]
      #swagger.summary = "Delete User"
      #swagger.parameters['id'] = {
        in: 'path',
        description: 'User ID',
        required: true,
        type: 'string'
      }      
    */
    const idFilter = req.user?.isAdmin
      ? { _id: req.params.id }
      : { _id: req.user?._id };
    //console.log("idFilter":, idFilter);

    const userIdFilter = req.user?.isAdmin
      ? { userId: req.params.id }
      : { userId: req.user?._id };

    // Delete all tasks and tags related to
    await Blog.deleteMany(userIdFilter);
    await Comment.deleteMany(userIdFilter);

    // Delete user
    const result = await User.findOneAndDelete(idFilter); // returns data

    if (result.avatar && result.avatar.includes(AWS_S3_BUCKET_REGION)) {
      const identifierForImage = extractDateNumber(result.avatar);
      await deleteObjectByDateKeyNumber(identifierForImage); // delete existing user avatar from s3 bucket
    }

    res.status(204).send({
      error: false,
      message: "Account successfully deleted!",
    });
  },
};
