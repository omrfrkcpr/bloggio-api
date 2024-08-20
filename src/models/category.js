"use strict";

const { mongoose } = require("../configs/dbConnection");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { collection: "categories", timestamps: true }
);

categorySchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

module.exports = mongoose.model("Category", categorySchema);
