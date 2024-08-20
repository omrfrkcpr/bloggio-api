"use strict";

const { mongoose } = require("../configs/dbConnection");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { collection: "subCategories", timestamps: true }
);

subCategorySchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

module.exports = mongoose.model("SubCategory", subCategorySchema);
