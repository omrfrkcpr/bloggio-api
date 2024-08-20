"use strict";

const SubCategory = require("../models/subCategory");

module.exports = {
  // GET /sub-categories
  list: async (req, res) => {
    /*
            #swagger.tags = ["SubCategories"]
            #swagger.summary = "List SubCategories"
            #swagger.description = `
                You can use <u>filter[] & search[] & sort[] & page & limit</u> queries with endpoint.
                <ul> Examples:
                    <li>URL/?<b>filter[name]=value</b></li>
                    <li>URL/?<b>sort[name]=asc</b></li>
                    <li>URL/?<b>limit=10&page=1</b></li>
                </ul>
            `
        */

    const data = await res.getModelList(SubCategory);

    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(SubCategory),
      data,
    });
  },

  // POST /sub-categories
  create: async (req, res) => {
    /*
            #swagger.tags = ["SubCategories"]
            #swagger.summary = "Create SubCategory"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    $ref: "#/definitions/SubCategory"
                }
            }
        */

    const { name, categoryId } = req.body;

    const newSubCategory = new SubCategory({
      name,
      categoryId,
    });

    const data = await newSubCategory.save();

    res.status(201).send({
      error: false,
      data,
      message: "New SubCategory successfully created!",
    });
  },

  // GET /sub-categories/:id
  read: async (req, res) => {
    /*
            #swagger.tags = ["SubCategories"]
            #swagger.summary = "Get Single SubCategory"
            #swagger.parameters['id'] = {
              in: 'path',
              description: 'SubCategory Id',
              required: true,
              type: 'string'
            }
        */

    const subCategoryId = req.params.id;

    const data = await SubCategory.findById(subCategoryId);

    res.status(200).send({
      error: false,
      data,
    });
  },

  // PUT || PATCH /sub-categories/:id
  update: async (req, res) => {
    /*
            #swagger.tags = ["SubCategories"]
            #swagger.summary = "Update SubCategory"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                   $ref: "#/definitions/SubCategory"
                }
            }
            #swagger.parameters['id'] = {
                in: 'path',
                description: 'SubCategory Id',
                required: true,
                type: 'string'
            }
        */

    const { name, categoryId } = req.body;

    const data = await SubCategory.findOneAndUpdate(
      { _id: req.params.id },
      { name, categoryId },
      {
        runValidators: true,
        new: true,
      }
    );

    res.status(202).send({
      error: false,
      new: data,
      message: "SubCategory successfully updated!",
    });
  },

  // DELETE /sub-categories/:id
  delete: async (req, res) => {
    /*
            #swagger.tags = ["SubCategories"]
            #swagger.summary = "Delete SubCategory"
            #swagger.parameters['id'] = {
              in: 'path',
              description: 'SubCategory Id',
              required: true,
              type: 'string'
            }
        */

    const data = await SubCategory.deleteOne({ _id: req.params.id });

    res.status(204).send({
      error: false,
      message: "SubCategory successfully deleted!",
    });
  },
};
