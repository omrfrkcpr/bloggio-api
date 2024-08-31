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
const { AWS_S3_BUCKET_REGION, AWS_S3_BASE } = require("../../constants");
const { mongoose } = require("../configs/dbConnection");

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

    let listFilter = {};

    if (!req.user.isAdmin) {
      listFilter._id = req.user._id;
    }

    const data = await res.getModelList(User, listFilter);
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(User, listFilter),
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

    // console.log("user.avatar", user.avatar); // debugging
    const avatarIncludesS3 = user.avatar && user.avatar.includes(AWS_S3_BASE);
    // console.log("avatarIncludesS3", avatarIncludesS3); // debugging

    if (req.fileLocation) {
      if (avatarIncludesS3) {
        const identifierForImage = extractDateNumber(user.avatar);
        // console.log("identifierForImage", identifierForImage); // debugging
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
  feedback: async (req, res) => {
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
  // /:id/statistics => POST
  statistics: async (req, res) => {
    const userId = req.params.id;
    // console.log(userId);

    const { timeRange } = req.body;
    // console.log(timeRange);

    const now = new Date();
    const filterCondition = {};

    if (timeRange === "Last 3 Months") {
      filterCondition.createdAt = {
        $gte: new Date(now.setMonth(now.getMonth() - 3)),
      };
    } else if (timeRange === "Last 6 Months") {
      filterCondition.createdAt = {
        $gte: new Date(now.setMonth(now.getMonth() - 6)),
      };
    } else if (timeRange === "Last 1 Year") {
      filterCondition.createdAt = {
        $gte: new Date(now.setFullYear(now.getFullYear() - 1)),
      };
    }

    // Blogs statistics using aggregate
    const blogsStats = await Blog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          ...filterCondition,
        },
      }, // filter spesific blogs based on userId and timeRange
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          publishedBlogs: { $sum: { $cond: ["$isPublish", 1, 0] } },
          unpublishedBlogs: { $sum: { $cond: [{ $not: "$isPublish" }, 1, 0] } },
          totalLikes: { $sum: { $size: "$likes" } },
          totalVisitors: { $sum: "$countOfVisitors" },
        },
      },
    ]);

    const blogStats = blogsStats[0] || {
      totalBlogs: 0,
      publishedBlogs: 0,
      unpublishedBlogs: 0,
      totalLikes: 0,
      totalVisitors: 0,
    };

    // Collect comments count for each blog
    const commentsCountByBlog = await Comment.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          ...filterCondition,
        },
      },
      {
        $group: {
          _id: "$blogId", // Group by blogId
          totalComments: { $sum: 1 }, // Count comments
        },
      },
    ]);

    const commentsCountMap = commentsCountByBlog.reduce((acc, comment) => {
      acc[comment._id.toString()] = comment.totalComments;
      return acc;
    }, {});

    // Find the most popular blog by likes + comments + visitors
    const userBlogs = await Blog.find({
      userId: new mongoose.Types.ObjectId(userId),
      isPublish: true, // Only consider published blogs
      ...filterCondition,
    });

    let mostPopularBlog = null;
    let maxEngagement = 0;

    for (const blog of userBlogs) {
      const blogId = blog._id.toString();
      const likes = blog.likes.length;
      const visitors = blog.countOfVisitors || 0;
      const comments = commentsCountMap[blogId] || 0;

      const totalEngagement = likes + visitors + comments;

      // search until we find the most popular one
      if (totalEngagement > maxEngagement) {
        maxEngagement = totalEngagement;
        mostPopularBlog = blog;
      }
    }

    if (mostPopularBlog) {
      mostPopularBlog = await Blog.findById(mostPopularBlog._id).populate([
        "userId",
        "categoryId",
      ]);
    }

    const latestBlog = await Blog.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      isPublish: true, // Only consider published blogs
    })
      .sort({ createdAt: -1 }) // Sort by creation date descending to get the latest blog
      .populate(["userId", "categoryId"]);

    // Comments statistics using aggregate
    const commentsStats = await Comment.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          ...filterCondition,
        },
      }, // filter spesific comments based on userId
      {
        $group: {
          _id: null,
          totalComments: { $sum: 1 },
          totalLikes: { $sum: { $size: "$likes" } },
        },
      },
    ]);

    const commentStats = commentsStats[0] || {
      totalComments: 0,
      totalLikes: 0,
    };

    // Collect all users' saved blog IDs
    const allSavedBlogs = await User.aggregate([
      { $unwind: "$saved" }, // Creates a separate document for each saved blog
      {
        $group: {
          _id: "$saved", // Groups by blog IDs (if the same blog is saved by more than one user, each one is counted as a separate record.)
          count: { $sum: 1 }, // Counts the number of times each blog ID has been registered
        },
      },
    ]);

    // Find out how many of the user's blogs are saved
    const userBlogIds = await Blog.find(
      { userId: new mongoose.Types.ObjectId(userId) },
      { _id: 1 } // Get just ids
    );

    const userBlogIdsSet = new Set(
      userBlogIds.map((blog) => blog._id.toString())
    ); // Convert blog ids to set

    const totalSavedBlogs = allSavedBlogs
      .filter((savedBlog) => userBlogIdsSet.has(savedBlog._id.toString())) // Filter saved blogs based on this user's blogs
      .reduce((acc, savedBlog) => acc + savedBlog.count, 0); // count all filtered blogs

    res.status(200).send({
      error: false,
      data: {
        ...blogStats,
        totalComments: commentStats.totalComments,
        totalCommentLikes: commentStats.totalLikes,
        totalSavedBlogs,
        mostPopularBlog: mostPopularBlog || null,
        latestBlog: latestBlog || null,
      },
      message: "User statistics successfully retrieved!",
    });
  },
  // /:id/saved-blogs => GET
  handleSavedBlogs: async (req, res) => {
    /*
      #swagger.tags = ["Users"]
      #swagger.summary = "Get Saved Blogs"
      #swagger.parameters['id'] = {
        in: 'path',
        description: 'User ID',
        required: true,
        type:'string'
      }      
    */
    const userIdFilter = req.user?.isAdmin
      ? { _id: req.params.id }
      : { _id: req.user?._id };

    const user = await User.findOne(userIdFilter);

    const savedBlogIds = user.saved;

    if (savedBlogIds.length === 0) {
      return res.status(200).json({ error: false, data: [] });
    }

    const blogs = await Blog.find({ _id: { $in: savedBlogIds } }).populate([
      "userId",
      "categoryId",
    ]);

    res.status(200).json({ error: false, data: blogs });
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

    // Delete all blogs and comments related to this user
    await Blog.deleteMany(userIdFilter);
    await Comment.deleteMany(userIdFilter);

    // Delete user
    const result = await User.findOneAndDelete(idFilter); // returns data

    if (result.avatar && result.avatar.includes(AWS_S3_BASE)) {
      const identifierForImage = extractDateNumber(result.avatar);
      await deleteObjectByDateKeyNumber(identifierForImage); // delete existing user avatar from s3 bucket
    }

    res.status(204).send({
      error: false,
      message: "Account successfully deleted!",
    });
  },
};
