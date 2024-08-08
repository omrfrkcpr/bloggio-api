"use strict";

const Token = require("../models/token");

module.exports = {
  list: async (req, res) => {
    /*
            #swagger.ignore = true
        */

    const data = await res.getModelList(Token);

    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Token),
      data,
    });
  },

  create: async (req, res) => {
    /*
            #swagger.ignore = true
        */

    const data = await Token.create(req.body);

    res.status(201).send({
      error: false,
      data,
      message: "Token successfully created",
    });
  },

  read: async (req, res) => {
    /*
            #swagger.ignore = true
        */

    const data = await Token.findOne({ _id: req.params.id });

    res.status(200).send({
      error: false,
      data,
    });
  },

  update: async (req, res) => {
    /*
            #swagger.ignore = true
        */

    const data = await Token.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        runValidators: true,
        new: true,
      }
    );

    res.status(202).send({
      error: !data.modifiedCount,
      new: data,
      message: data.modifiedCount
        ? "Token successfully updated"
        : "Token not found",
    });
  },

  delete: async (req, res) => {
    /*
            #swagger.ignore = true
        */

    const data = await Token.deleteOne({ _id: req.params.id });

    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      message: data.deletedCount
        ? "Token successfully deleted"
        : "Token not found",
      data,
    });
  },
};
