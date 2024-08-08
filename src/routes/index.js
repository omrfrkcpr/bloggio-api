"use strict";

const router = require("express").Router();

// URL: /api/${VERSION}

router.use("/auth", require("./auth"));
router.use("/blogs", require("./blog"));
router.use("/users", require("./user"));
router.use("/tokens", require("./token"));
// router.use("/comments", require("./comment"));
// router.use("/categories", require("./category"));

// document:
router.use("/documents", require("./document"));

module.exports = router;
