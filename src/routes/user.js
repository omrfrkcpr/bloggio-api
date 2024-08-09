"use strict";

const router = require("express").Router();
const user = require("../controllers/user");
const { upload, uploadToS3 } = require("../middlewares/awsS3Upload");
const idValidation = require("../middlewares/idValidation");
const {
  isLogin,
  isUserOwnerOrAdmin,
  isStaffOrAdmin,
} = require("../middlewares/permissions");
const { emailLimiter } = require("../middlewares/rateLimiters");

// URL: /users

const { list, create, feedback, update, read, agreeContract, statistics } =
  user; // destructure

router
  .route("/")
  .get(isStaffOrAdmin, list)
  .post(upload.single("avatar"), isStaffOrAdmin, uploadToS3, create);

router.put("/agree-contract/:userId", agreeContract);
router.post("/feedback", emailLimiter, feedback);
router.get(
  "/:id/statistics",
  isLogin,
  idValidation,
  isUserOwnerOrAdmin,
  statistics
);

router
  .route("/:id")
  .all(isLogin, idValidation, isUserOwnerOrAdmin)
  .get(read)
  .put(upload.single("avatar"), uploadToS3, update)
  .patch(upload.single("avatar"), uploadToS3, update)
  .delete(user.delete);

module.exports = router;
