"use strict";

const router = require("express").Router();
const category = require("../controllers/category");
const { isAdmin, isStaffOrAdmin } = require("../middlewares/permissions");
const idValidation = require("../middlewares/idValidation");

// URL: /categories

const { list, listWithSubs, create, read, update } = category;

router.route("/").get(list).post(isStaffOrAdmin, create);
router.route("/sub-categories").get(listWithSubs);
router
  .route("/:id")
  .all(idValidation, isStaffOrAdmin)
  .get(isStaffOrAdmin, read)
  .put(isStaffOrAdmin, update)
  .patch(isStaffOrAdmin, update)
  .delete(isAdmin, category.delete);

module.exports = router;
