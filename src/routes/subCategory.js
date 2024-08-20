"use strict";

const router = require("express").Router();
const subCategory = require("../controllers/subCategory");
const { isAdmin, isStaffOrAdmin } = require("../middlewares/permissions");
const idValidation = require("../middlewares/idValidation");

// URL: /sub-categories

const { list, create, read, update } = subCategory;

router.route("/").get(list).post(isStaffOrAdmin, create);

router
  .route("/:id")
  .all(idValidation, isStaffOrAdmin)
  .get(isStaffOrAdmin, read)
  .put(isStaffOrAdmin, update)
  .patch(isStaffOrAdmin, update)
  .delete(isAdmin, subCategory.delete);

module.exports = router;
