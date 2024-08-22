"use strict";

const router = require("express").Router();
const comment = require("../controllers/comment");
const {
  isLogin,
  isCommentOwnerOrAdmin,
} = require("../middlewares/permissions");
const idValidation = require("../middlewares/idValidation");

// URL: /comments

const { list, create, blogComments, like, read, update } = comment;

router.use(isLogin);

router.route("/").get(list).post(create);
router.route("/blog/:id").get(idValidation, blogComments);
router.route("/like/:id").put(idValidation, like);
router
  .route("/:id")
  .all(idValidation)
  .get(read)
  .put(isCommentOwnerOrAdmin, update)
  .patch(isCommentOwnerOrAdmin, update)
  .delete(isCommentOwnerOrAdmin, comment.delete);

module.exports = router;
