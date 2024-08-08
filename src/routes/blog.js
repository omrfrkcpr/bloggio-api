"use strict";

const router = require("express").Router();
const blog = require("../controllers/blog");
const checkVisitSession = require("../middlewares/checkVisitSession");
const { isLogin, isBlogOwnerOrAdmin } = require("../middlewares/permissions");

// URL: /blogs

const { list, create, like, save, read, update } = blog; // destructure

router.route("/").get(list).post(isLogin, create);
router.route("/:id/like").put(isLogin, like);
router.route("/:id/save").put(isLogin, save);
router
  .route("/:id")
  .all(isBlogOwnerOrAdmin)
  .get(checkVisitSession, read)
  .put(update)
  .patch(update)
  .delete(blog.delete);

module.exports = router;
