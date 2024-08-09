"use strict";

const { mongoose } = require("../configs/dbConnection");
const validator = require("validator");
const { CustomError } = require("../errors/customError");

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
    googleId: String,
    avatar: {
      type: String,
      default:
        "https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg",
    },
    city: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      maxlength: 2000,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
      unique: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: true,
      validate: [
        (password) => {
          if (
            !validator.isStrongPassword(password, [
              { minLength: 6, symbols: "@!#$%" },
            ])
          )
            throw new CustomError("Password is invalid");
        },
      ],
    },
    saved: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
      },
    ],
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

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false, // hide __v
  transform: (doc, ret) => {
    // extract __v only
    delete ret.__v;
    delete ret.id;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
