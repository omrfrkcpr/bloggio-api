"use strict";

const router = require("express").Router();
const user = require("../controllers/user");
const { upload, uploadToS3 } = require("../middlewares/awsS3Upload");
const { emailLimiter } = require("../middlewares/rateLimiters");

// URL: /users

router
  .route("/")
  .get(user.list)
  .post(upload.single("avatar"), uploadToS3, user.create);

router.post("/feedback", emailLimiter, handleFeedback);

router
  .route("/:id")
  .get(user.read)
  .put(upload.single("avatar"), uploadToS3, user.update)
  .patch(upload.single("avatar"), uploadToS3, user.update)
  .delete(user.delete);

module.exports = router;
