"use strict";

const Blog = require("../models/blog");
const User = require("../models/user");
const Comment = require("../models/comment");

module.exports = {
  // GET
  list: async (req, res) => {
    /*
            #swagger.tags = ["Blogs"]
            #swagger.summary = "List Blogs"
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

    const data = await res.getModelList(Blog, {}, [
      { path: "userId", select: "firstName lastName avatar username" },
      { path: "categoryId", select: "name" },
    ]);

    // Get virtual countOfComments for each blog
    for (const blog of data) {
      await blog.populateCommentsCount();
    }

    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Blog),
      data: data.map((blog) => blog.toJSON()),
      trendings: await Blog.find({ isPublish: true })
        .sort({ countOfVisitors: -1 })
        .limit(10),
    });
  },

  // POST
  create: async (req, res) => {
    /*
            #swagger.tags = ["Blogs"]
            #swagger.summary = "Create Blog"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    $ref: "#/definitions/Blog'
                }
            }
        */

    let userId = req.user._id;

    if (req.user?.isAdmin) {
      userId = req.body?.userId;
    }

    const data = await Blog.create({ ...req.body, userId });

    res.status(200).send({
      error: false,
      data,
      message: "New Blog successfully created!",
    });
  },

  // /:id => GET
  read: async (req, res) => {
    /*
            #swagger.tags = ["Blogs"]
            #swagger.summary = "Get Single Blog"
            #swagger.parameters['id'] = {
              in: 'path',
              description: 'Blog Id',
              required: true,
              type: 'string'
            }
        */

    const blogId = req.params.id;

    // If passed from checkVisitSession middleware, then increase countOfVisitors of this Blog
    await Blog.findByIdAndUpdate(
      blogId,
      { $inc: { countOfVisitors: 1 } },
      { new: true }
    );

    const data = await Blog.findById(blogId).populate(["userId", "categoryId"]);

    // Get virtual countOfComments for single blog
    await data.populateCommentsCount();

    res.status(200).send({
      error: false,
      data: data.toJSON(),
    });
  },

  // /:id => PUT || PATCH
  update: async (req, res) => {
    /*
            #swagger.tags = ["Blogs"]
            #swagger.summary = "Update Blog"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                   $ref: "#/definitions/Blog'
                }
            }
            #swagger.parameters['id'] = {
                in: 'path',
                description: 'Blog Id',
                required: true,
                type: 'string'
            }
        */

    const data = await Blog.updateOne({ _id: req.params.id }, req.body, {
      runValidators: true,
      new: true,
    });

    res.status(202).send({
      error: false,
      new: data,
      message: "Blog successfully updated!",
    });
  },

  // /:id/like => PUT
  like: async (req, res) => {
    const blogId = req.params.id;
    const userId = req.user._id;

    const blog = await Blog.findById(blogId);

    const alreadyLiked = blog.likes.includes(userId);

    // Remove or Add like
    if (alreadyLiked) {
      await Blog.findByIdAndUpdate(blogId, { $pull: { likes: userId } });
    } else {
      await Blog.findByIdAndUpdate(blogId, { $addToSet: { likes: userId } });
    }

    res.status(200).send({
      error: false,
    });
  },
  // /:id/save => PUT
  save: async (req, res) => {
    const blogId = req.params.id;
    const userId = req.user._id;

    const user = await User.findById(userId);

    const alreadySaved = user.saved.includes(blogId);

    // Remove or Save blog
    if (alreadySaved) {
      await User.findByIdAndUpdate(userId, { $pull: { saved: blogId } });
    } else {
      await User.findByIdAndUpdate(userId, { $addToSet: { saved: blogId } });
    }

    // Retrieve the updated user
    const updatedUser = await User.findById(userId);

    res.status(200).send({
      error: false,
      message: alreadySaved ? "Blog removed" : "Blog saved",
      new: updatedUser,
    });
  },

  // /id => DELETE
  delete: async (req, res) => {
    /*
            #swagger.tags = ["Blogs"]
            #swagger.summary = "Delete Blog"
            #swagger.parameters['id'] = {
              in: 'path',
              description: 'Blog Id',
              required: true,
              type: 'string'
            }
        */

    let userId = req.user._id;

    if (req.user.isAdmin) {
      userId = req.body.userId;
    }

    const data = await Blog.deleteOne({ _id: req.params.id, userId });

    if (data.deletedCount) {
      await User.updateMany(
        { saved: req.params.id }, // Find the user that has this blog among saved blogs
        { $pull: { saved: req.params.id } } // Remove this ID from the 'saved' array
      );
    }

    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      message: data.deletedCount
        ? "Blog successfully deleted!"
        : "Blog not found!",
    });
  },
};
