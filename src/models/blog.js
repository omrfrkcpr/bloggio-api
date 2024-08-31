"use strict";

const { mongoose } = require("../configs/dbConnection");
const convertHtmlToText = require("../helpers/convertHtmlToText");
const Comment = require("../models/comment");

const DEFAULT_IMAGE_URL =
  "https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg?w=360";

/*
  {
      "_id": "66c6b2f4f0bfa6a3189c8d77",
      "userId": "66b5fb9d4a5a46b8162e77c5",
      "categoryId": "66b615ba725abfa77820fe58",
      "title": "The Future of Artificial Intelligence",
      "content": "<h1>Artificial Intelligence: What the Future Holds</h1><p>AI is transforming industries and society at large...</p>",
      "image": "https://example.com/images/ai-future.jpg",
      "isPublish": true,
      "likes": null,
      "tags": [
          "AI",
          "Technology",
          "Future"
      ],
      "countOfVisitors": 512,
      "createdAt": "2024-08-08T15:30:00.000Z",
      "updatedAt": "August 8, 2024",
      "blogDetails": {
          "countOfLikes": 0,
          "countOfComments": 0,
          "readTime": "1 min read",
          "contentPrev": "ARTIFICIAL INTELLIGENCE: WHAT THE FUTURE HOLDS AI is transforming industries and society at large..."
      }
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
      ref: "SubCategory",
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
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 25,
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

//? METHODS
blogSchema.methods.populateCommentsCount = async function () {
  this._countOfComments = await Comment.countDocuments({ blogId: this._id });
  return this._countOfComments;
};

//? VIRTUALS

blogSchema.virtual("countOfComments").get(function () {
  return this._countOfComments || 0;
});

blogSchema.virtual("blogDetails").get(function () {
  const countOfLikes = this.likes.length;

  // Calculate countOfComments
  const countOfComments = this._countOfComments || 0;

  // Calculate readTime
  const averageReadingSpeed = 200; // 200 words per minute
  const textContent = convertHtmlToText(this.content);
  const words = textContent.split(/\s+/);
  const readTime = `${Math.ceil(words.length / averageReadingSpeed)} min read`;

  // Generate content preview
  const contentPrev =
    words.slice(0, 15).join(" ") + (words.length > 20 ? "..." : "");

  return {
    countOfLikes,
    countOfComments,
    readTime,
    contentPrev,
  };
});

//? RESPONSE STRUCTURE
blogSchema.set("toJSON", {
  virtuals: true,
  versionKey: false, // hide __v
  transform: (doc, ret) => {
    // Format updatedAt
    ret.updatedAt = ret.updatedAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Convert empty arrays to null
    if (ret.likes && ret.likes.length === 0) {
      ret.likes = null;
    }
    if (ret.tags && ret.tags.length === 0) {
      ret.tags = null;
    }

    delete ret.__v;
    delete ret.id;
    return ret;
  },
});
module.exports = mongoose.model("Blog", blogSchema);
