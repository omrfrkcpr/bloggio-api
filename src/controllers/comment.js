"use strict";

const Comment = require("../models/comment");

module.exports = {
  // GET /comments
  list: async (req, res) => {
    /*
            #swagger.tags = ["Comments"]
            #swagger.summary = "List Comments"
            #swagger.description = `
                You can use <u>filter[] & search[] & sort[] & page & limit</u> queries with endpoint.
                <ul> Examples:
                    <li>URL/?<b>filter[field1]=value1&filter[field2]=value2</b></li>
                    <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                    <li>URL/?<b>sort[field1]=asc&sort[field2]=desc</b></li>
                    <li>URL/?<b>limit=10&page=1</b></li>
                </ul>
            `
        */

    let listFilter = {};

    // if (!req.user.isAdmin) {
    //   listFilter.userId = req.user._id;
    // }

    const data = await res.getModelList(Comment, listFilter, [
      {
        path: "userId",
        select: "_id username createdAt firstName lastName avatar updatedAt",
      },
    ]);

    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Comment, listFilter),
      data,
    });
  },

  // POST /comments
  create: async (req, res) => {
    /*
            #swagger.tags = ["Comments"]
            #swagger.summary = "Create Comment"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    $ref: "#/definitions/Comment"
                }
            }
        */

    const { blogId, comment } = req.body;
    let userId = req.user._id;

    const newComment = new Comment({
      blogId,
      userId,
      comment,
    });

    const data = await newComment.save();

    res.status(200).send({
      error: false,
      data,
      message: "New Comment successfully created!",
    });
  },

  // GET /comments/:id
  read: async (req, res) => {
    /*
            #swagger.tags = ["Comments"]
            #swagger.summary = "Get Single Comment"
            #swagger.parameters['id'] = {
              in: 'path',
              description: 'Comment Id',
              required: true,
              type: 'string'
            }
        */

    const commentId = req.params.id;

    const data = await Comment.findById(commentId).populate([
      "userId",
      "blogId",
    ]);

    res.status(200).send({
      error: false,
      data,
    });
  },

  // GET /comments/blog/:id
  blogComments: async (req, res) => {
    /*
            #swagger.tags = ["Comments"]
            #swagger.summary = "Get Comments for a Blog"
            #swagger.parameters['id'] = {
              in: 'path',
              description: 'Blog Id',
              required: true,
              type: 'string'
            }
        */

    const blogId = req.params.id;

    const data = await Comment.find({ blogId }).populate([
      { path: "userId", select: "_id username createdAt updatedAt" },
    ]);

    res.status(200).send({
      error: false,
      data,
    });
  },

  like: async (req, res) => {
    /*
            #swagger.tags = ["Comments"]
            #swagger.summary = "Like or Unlike Comment"
            #swagger.parameters['id'] = {
              in: 'path',
              description: 'Comment Id',
              required: true,
              type: 'string'
            }
        */

    const commentId = req.params.id;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);

    const alreadyLiked = comment.likes.includes(userId);

    if (alreadyLiked) {
      await Comment.findByIdAndUpdate(commentId, { $pull: { likes: userId } });
    } else {
      await Comment.findByIdAndUpdate(commentId, {
        $addToSet: { likes: userId },
      });
    }

    res.status(200).send({
      error: false,
    });
  },

  // PUT || PATCH /comments/:id
  update: async (req, res) => {
    /*
            #swagger.tags = ["Comments"]
            #swagger.summary = "Update Comment"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                   $ref: "#/definitions/Comment"
                }
            }
            #swagger.parameters['id'] = {
                in: 'path',
                description: 'Comment Id',
                required: true,
                type: 'string'
            }
        */

    const { comment } = req.body;

    const data = await Comment.findOneAndUpdate(
      { _id: req.params.id },
      { comment },
      {
        runValidators: true,
        new: true,
      }
    );

    res.status(data ? 202 : 404).send({
      error: !data,
      new: data,
      message: data ? "Comment successfully updated!" : "Comment not found!",
    });
  },

  // DELETE /comments/:id
  delete: async (req, res) => {
    /*
            #swagger.tags = ["Comments"]
            #swagger.summary = "Delete Comment"
            #swagger.parameters['id'] = {
              in: 'path',
              description: 'Comment Id',
              required: true,
              type: 'string'
            }
        */

    const data = await Comment.deleteOne({ _id: req.params.id });

    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      message: data.deletedCount
        ? "Comment successfully deleted!"
        : "Comment not found!",
    });
  },
};
