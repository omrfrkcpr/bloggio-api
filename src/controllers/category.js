"use strict";

const Category = require("../models/Category");

module.exports = {
  // GET /categories
  list: async (req, res) => {
    /*
            #swagger.tags = ["Categories"]
            #swagger.summary = "List Categories"
            #swagger.description = `
                You can use <u>filter[] & search[] & sort[] & page & limit</u> queries with endpoint.
                <ul> Examples:
                    <li>URL/?<b>filter[name]=value</b></li>
                    <li>URL/?<b>sort[name]=asc</b></li>
                    <li>URL/?<b>limit=10&page=1</b></li>
                </ul>
            `
        */

    const data = await res.getModelList(Category);

    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Category),
      data,
    });
  },
  // GET /categories/sub-categories
  listWithSubs: async (req, res) => {
    /*
            #swagger.tags = ["Categories"]
            #swagger.summary = "List Categories With SubCategories"
        */
    const categoriesWithSubs = await Category.aggregate([
      {
        $lookup: {
          from: "subCategories",
          localField: "_id",
          foreignField: "categoryId",
          as: "subcategories",
        },
      },
      {
        $match: {
          "subcategories.0": { $exists: true },
        },
      },
      {
        $sort: {
          name: 1,
        },
      },
      {
        $addFields: {
          subcategories: {
            $sortArray: { input: "$subcategories", sortBy: { name: 1 } },
          },
        },
      },
    ]);

    res.status(200).send({ error: false, data: categoriesWithSubs });
  },

  // POST /categories
  create: async (req, res) => {
    /*
            #swagger.tags = ["Categories"]
            #swagger.summary = "Create Category"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    $ref: "#/definitions/Category"
                }
            }
        */

    const { name } = req.body;

    const newCategory = new Category({
      name,
    });

    const data = await newCategory.save();

    res.status(201).send({
      error: false,
      data,
      message: "New Category successfully created!",
    });
  },

  // GET /categories/:id
  read: async (req, res) => {
    /*
            #swagger.tags = ["Categories"]
            #swagger.summary = "Get Single Category"
            #swagger.parameters['id'] = {
              in: 'path',
              description: 'Category Id',
              required: true,
              type: 'string'
            }
        */

    const categoryId = req.params.id;

    const data = await Category.findById(categoryId);

    res.status(200).send({
      error: false,
      data,
    });
  },

  // PUT || PATCH /categories/:id
  update: async (req, res) => {
    /*
            #swagger.tags = ["Categories"]
            #swagger.summary = "Update Category"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                   $ref: "#/definitions/Category"
                }
            }
            #swagger.parameters['id'] = {
                in: 'path',
                description: 'Category Id',
                required: true,
                type: 'string'
            }
        */

    const { name } = req.body;

    const data = await Category.findOneAndUpdate(
      { _id: req.params.id },
      { name },
      {
        runValidators: true,
        new: true,
      }
    );

    res.status(202).send({
      error: false,
      new: data,
      message: "Category successfully updated!",
    });
  },

  // DELETE /categories/:id
  delete: async (req, res) => {
    /*
            #swagger.tags = ["Categories"]
            #swagger.summary = "Delete Category"
            #swagger.parameters['id'] = {
              in: 'path',
              description: 'Category Id',
              required: true,
              type: 'string'
            }
        */

    const data = await Category.deleteOne({ _id: req.params.id });

    res.status(204).send({
      error: false,
      message: "Category successfully deleted!",
    });
  },
};
