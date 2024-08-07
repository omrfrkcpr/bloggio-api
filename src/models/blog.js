"use strict";

const { mongoose } = require("../configs/dbConnection");
const convertHtmlToText = require("../helpers/convertHtmlToText");

const DEFAULT_IMAGE_URL =
  "https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg?w=360";

/*
  {
    "_id": "64cbbd50e4b0c9f12f9d78f2",
    "userId": "64cbbd50e4b0c9f12f9d78f1",
    "categoryId": "64cbbd50e4b0c9f12f9d78f0",
    "title": "Sample Blog Post",
    "content": "<h1>Sample Blog Title</h1><p>This is the content of the blog post. It may contain <strong>HTML</strong> tags and <a href='#'>links</a>.</p>",
    "image": "https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg?w=360",
    "isPublish": true,
    "likes": [
      "64cbbd50e4b0c9f12f9d78f3",
      "64cbbd50e4b0c9f12f9d78f4"
    ],
    "countOfVisitors": 128,
    "blogDetails": {
      "countOfLikes": 2,
      "countOfComments": 5,
      "readTime": "1 min read"
    },
    "updatedAtFormatted": "May 5, 2024",
    "createdAt": "2024-05-01T10:00:00.000Z"
  }
*/

const blogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 125,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    image: {
      type: String,
      default: DEFAULT_IMAGE_URL,
    },
    isPublish: {
      type: Boolean,
      default: true, // true: published | false: draft
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    countOfVisitors: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    collection: "blogs",
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//? INDEXES

blogSchema.index({ userId: 1 });
blogSchema.index({ categoryId: 1 });

//? VIRTUALS

blogSchema.virtual("countOfComments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "blogId",
  count: true,
});

blogSchema.virtual("updatedAtFormatted").get(function () {
  return this.updatedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

blogSchema.virtual("contentPrev").get(function () {
  const textContent = convertHtmlToText(this.content);
  const words = textContent.split(/\s+/);
  return words.slice(0, 20).join(" ") + (words.length > 20 ? "..." : "");
});

blogSchema.virtual("readTime").get(function () {
  const averageReadingSpeed = 200; // 200 words per minute
  const textContent = convertHtmlToText(this.content);
  const words = textContent.split(/\s+/).length;
  const minutes = Math.ceil(words / averageReadingSpeed);
  return `${minutes} min read`;
});

blogSchema.virtual("countOfLikes").get(function () {
  return this.likes.length;
});

//? RESPONSE STRUCTURE
blogSchema.set("toJSON", {
  virtuals: true,
  versionKey: false, // hide __v
  transform: (doc, ret) => {
    ret.blogDetails = {
      countOfLikes: ret.countOfLikes,
      countOfComments: ret.countOfComments,
      readTime: ret.readTime,
    };
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});

module.exports = mongoose.model("Blog", blogSchema);
