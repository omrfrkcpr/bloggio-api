"use strict";

const router = require("express").Router();
const user = require("../controllers/user");
const { upload, uploadToS3 } = require("../middlewares/awsS3Upload");
const { isLogin, isUserOwnerOrAdmin } = require("../middlewares/permissions");
const { emailLimiter } = require("../middlewares/rateLimiters");

// URL: /users

const { list, create, handleFeedback, update, read } = user; // destructure

router.route("/").get(list).post(upload.single("avatar"), uploadToS3, create);

router.post("/feedback", emailLimiter, handleFeedback);

router
  .route("/:id")
  .all(isLogin, isUserOwnerOrAdmin)
  .get(read)
  .put(upload.single("avatar"), uploadToS3, update)
  .patch(upload.single("avatar"), uploadToS3, update)
  .delete(user.delete);

module.exports = router;
