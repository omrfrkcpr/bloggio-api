"use strict";

const router = require("express").Router();
const token = require("../controllers/token");
const { isStaffOrAdmin } = require("../middlewares/permissions");

// URL: /tokens

const { list, create, read, update } = token; // destructure

router.use(isStaffOrAdmin);

router.route("/").get(list).post(create);
router.route("/:id").get(read).put(update).patch(update).delete(token.delete);

module.exports = router;
