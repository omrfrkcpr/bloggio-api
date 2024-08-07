"use strict";

const { mongoose } = require("../configs/dbConnection");
const passwordEncrypt = require("../helpers/passwordEncrypt");
const { validateEmail, validatePassword } = require("../helpers/userValidator");
const Blog = require("../models/blog");
const Comment = require("../models/comment");

/*
  {
    "_id": "64cbbd50e4b0c9f12f9d78f1",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "avatar": "https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg",
    "email": "john.doe@example.com",
    "password": "encrypted_password",
    "isActive": true,
    "isAdmin": false,
    "isStaff": false,
    "createdAt": "2024-08-08T12:34:56.000Z",
    "updatedAt": "2024-08-08T12:34:56.000Z",
  }
*/

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 15,
      trim: true,
    },
    avatar: {
      type: String,
      default:
        "https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isStaff: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

userSchema.pre(["save", "updateOne"], function (next) {
  const data = this?._update || this;

  if (data.email && !validateEmail(data.email)) {
    return next(new Error("Invalid Email address!"));
  }

  if (data?.password) {
    if (!validatePassword(data.password)) {
      return next(new Error("Invalid Password!"));
    }
    data.password = passwordEncrypt(data.password);

    if (this?._update) {
      this._update = data;
    } else {
      this.password = data.password;
    }
  }
  next();
});

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false, // hide __v
  transform: (doc, ret) => {
    // extract __v only
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
