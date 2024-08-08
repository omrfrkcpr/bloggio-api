"use strict";

const router = require("express").Router();
const blog = require("../controllers/blog");
const { isLogin, isBlogOwnerOrAdmin } = require("../middlewares/permissions");

// URL: /blogs

router.route("/").get(blog.list).post(isLogin, blog.create);

router.route("/:id/like").put(isLogin, blog.like);

router
  .route("/:id")
  .all(isBlogOwnerOrAdmin)
  .get(blog.read)
  .put(blog.update)
  .patch(blog.update)
  .delete(blog.delete);

module.exports = router;
