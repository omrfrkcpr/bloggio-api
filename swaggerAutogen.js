"use strict";

const { HOST, PORT } = require("./constants");

/* ------------------------------------------------------- */
const swaggerAutogen = require("swagger-autogen")();
const packageJson = require("./package.json");

const document = {
  info: {
    version: packageJson.version,
    title: packageJson.name,
    description: packageJson.description,
    termsOfService:
      "https://www.termsfeed.com/live/ed8b4e15-b05a-41d6-b12b-920a89756f29",
    contact: { name: packageJson.author, email: "omerrfarukcapur@gmail.com" },
    license: { name: packageJson.license },
  },
  host: `${HOST}:${PORT}`,
  basePath: "/",
  schemes: ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],
  securityDefinitions: {
    Token: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description:
        "Simple Token Authentication * Example: <b>Token ...tokenKey...</b>",
    },
    Bearer: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description:
        "JWT Authentication * Example: <b>Bearer ...accessToken...</b>",
    },
  },
  security: [{ Token: [] }, { Bearer: [] }],
  definitions: {
    // Models:
    Blog: require("./src/models/blog").schema.obj,
    User: require("./src/models/user").schema.obj,
    Comment: require("./src/models/comment").schema.obj,
    Category: require("./src/models/category").schema.obj,
  },
};

const routes = ["./index.js"];
const outputFile = "./src/configs/swagger.json";

// Create JSON file:
swaggerAutogen(outputFile, routes, document);
