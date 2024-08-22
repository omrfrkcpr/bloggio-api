"use strict";

const router = require("express").Router();
const blog = require("../controllers/blog");
// const checkVisitSession = require("../middlewares/checkVisitSession");
const { isLogin, isBlogOwnerOrAdmin } = require("../middlewares/permissions");
const idValidation = require("../middlewares/idValidation");

// URL: /blogs

const { list, create, like, save, read, update } = blog; // destructure

router.route("/").get(list).post(isLogin, create);
router.route("/:id/like").put(isLogin, idValidation, like);
router.route("/:id/save").put(isLogin, idValidation, save);
router
  .route("/:id")
  .all(isLogin, idValidation)
  // .get(checkVisitSession, read)
  .get(read)
  .put(isBlogOwnerOrAdmin, update)
  .patch(isBlogOwnerOrAdmin, update)
  .delete(isBlogOwnerOrAdmin, blog.delete);

module.exports = router;
