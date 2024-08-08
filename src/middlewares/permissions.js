"use strict";

//? Middleware Permissions
/* -------------------------------------------------------- */

const { CustomError } = require("../errors/customError");
const Blog = require("../models/blog");
const User = require("../models/user");
const { NODE_ENV } = require("../../constants");

module.exports = {
  isLogin: (req, res, next) => {
    if (!NODE_ENV) return next(); // true on development

    if (req.user && req.user.isActive) {
      next();
    } else {
      throw new CustomError(
        "No Permission: You must login to perform this action!",
        403
      );
    }
  },

  isAdmin: (req, res, next) => {
    if (!NODE_ENV) return next(); // true on development

    if (req.user.isAdmin) {
      next();
    } else {
      throw new CustomError(
        "No Permission: You must be admin to perform this action!",
        403
      );
    }
  },

  isStaff: (req, res, next) => {
    if (!NODE_ENV) return next(); // true on development

    if (req.user.isStaff) {
      next();
    } else {
      throw new CustomError(
        "No Permission: You must be staff to perform this action!",
        403
      );
    }
  },

  isStaffOrAdmin: (req, res, next) => {
    if (!NODE_ENV) return next(); // true on development

    if (req.user.isStaff || req.user.isAdmin) {
      next();
    } else {
      throw new CustomError(
        "No Permission: You must be staff or admin to perform this action!",
        403
      );
    }
  },

  isUserOwnerOrAdmin: async (req, res, next) => {
    if (!NODE_ENV) return next(); // true on development

    const user = await User.findById(req.params.id);
    if (req.user.isAdmin || String(user._id) === String(req.user._id)) {
      next();
    } else {
      throw new CustomError(
        "No Permission: Only admin or owner can perform this action!",
        403
      );
    }
  },

  isBlogOwnerOrAdmin: async (req, res, next) => {
    if (!NODE_ENV) return next(); // true on development

    const blog = await Blog.findById(req.params.id);
    if (req.user.isAdmin || String(blog.userId) === String(req.user._id)) {
      next();
    } else {
      throw new CustomError(
        "No Permission: Only admin or owner can perform this action!",
        403
      );
    }
  },
};
