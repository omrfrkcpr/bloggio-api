"use strict";

const router = require("express").Router();
const blog = require("../controllers/blog");
const { isLogin, isBlogOwnerOrAdmin } = require("../middlewares/permissions");

// URL: /blogs

const { list, create, like, read, update } = blog; // destructure

router.route("/").get(list).post(isLogin, create);
router.route("/:id/like").put(isLogin, like);
router
  .route("/:id")
  .all(isBlogOwnerOrAdmin)
  .get(read)
  .put(update)
  .patch(update)
  .delete(blog.delete);

module.exports = router;
