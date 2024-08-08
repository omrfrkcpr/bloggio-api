"use strict";

const router = require("express").Router();
const token = require("../controllers/token");
const { isStaffOrAdmin } = require("../middlewares/permissions");

// URL: /tokens

router.use(isStaffOrAdmin);

router.route("/").get(token.list).post(token.create);

router
  .route("/:id")
  .get(token.read)
  .put(token.update)
  .patch(token.update)
  .delete(token.delete);

module.exports = router;
