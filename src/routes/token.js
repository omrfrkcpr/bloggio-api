"use strict";

const router = require("express").Router();
const token = require("../controllers/token");
const idValidation = require("../middlewares/idValidation");
const { isStaffOrAdmin } = require("../middlewares/permissions");

// URL: /tokens

const { list, create, read, update } = token; // destructure

router.use(isStaffOrAdmin);

router.route("/").get(list).post(create);
router
  .route("/:id")
  .all(idValidation)
  .get(read)
  .put(update)
  .patch(update)
  .delete(token.delete);

module.exports = router;
