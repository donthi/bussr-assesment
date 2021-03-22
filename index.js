const Hapi = require("@hapi/hapi");
const TicketController = require("./ticket.controller");
const Mongoose = require("mongoose");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const HapiSwagger = require("hapi-swagger");
const HapiJWTAuth = require("hapi-auth-jwt2");
const Joi = require("joi");

const server = Hapi.server({
  port: 3000,
  host: "0.0.0.0",
});

const swaggerOptions = {
  info: {
    title: "Test API Documentation",
    version: "1.0.0",
  },
};

const url =
  process.env.DB_CONN_STRING ||
  `mongodb://localhost:27017/tickets?retryWrites=true&w=majority`;

const connectionParams = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};

const validate = async function (decoded, request, h) {
  return { isValid: true };
};

server.route({
  method: "GET",
  path: "/",
  config: { auth: false },
  handler: (req, h) => {
    return "Hello from HapiJS!";
  },
});

server.route({
  method: "GET",
  path: "/tickets",
  handler: TicketController.getAll,
  options: {
    description: "Get tickets",
    notes: "Returns list of tickets",
    tags: ["api", "tickets"],
  },
});

server.route({
  method: "GET",
  path: "/tickets/{id}",
  handler: TicketController.getById,
  options: {
    description: "Get ticket",
    notes: "Returns a ticket",
    tags: ["api", "tickets"],
    validate: {
      params: Joi.object({
        id: Joi.string().required().description("the id for the ticket"),
      }),
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).unknown(),
    },
  },
});

server.route({
  method: "POST",
  path: "/tickets",
  handler: TicketController.create,
  options: {
    description: "Create ticket",
    notes: "Creates a ticket",
    tags: ["api", "tickets"],
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).unknown(),
      payload: Joi.object().keys({
        customerName: Joi.string().required(),
        performanceTitle: Joi.string().required(),
        performanceTime: Joi.string().required(),
        ticketPrice: Joi.number().integer().required(),
      }),
    },
  },
});

server.route({
  method: "PUT",
  path: "/tickets/{id}",
  handler: TicketController.update,
  options: {
    description: "Update ticket",
    notes: "Updates a ticket",
    tags: ["api", "tickets"],
    validate: {
      params: Joi.object({
        id: Joi.string().required().description("the id for the ticket"),
      }),
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).unknown(),
    },
  },
});

server.route({
  method: "DELETE",
  path: "/tickets/{id}",
  handler: TicketController.remove,
  options: {
    description: "Delete ticket",
    notes: "deletes a ticket",
    tags: ["api", "tickets"],
    validate: {
      params: Joi.object({
        id: Joi.string().required().description("the id for the ticket"),
      }),
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).unknown(),
    },
  },
});

server.route({
  method: "GET",
  path: "/analytics/visited",
  handler: TicketController.getVisitsByMonth,
  options: {
    description: "Visits by month",
    notes: "Returns visits by month",
    tags: ["api", "analytics"],
    validate: {
      query: Joi.object({
        method: Joi.string()
          .required()
          .valid("js", "aggregate")
          .description("the id for the ticket"),
      }),
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).unknown(),
    },
  },
});

server.route({
  method: "GET",
  path: "/analytics/profits",
  handler: TicketController.getProfitsByMonth,
  options: {
    description: "Profits by month",
    notes: "profits by month",
    tags: ["api", "analytics"],
    validate: {
      query: Joi.object({
        method: Joi.string()
          .required()
          .valid("js", "aggregate")
          .description("the id for the ticket"),
      }),
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).unknown(),
    },
  },
});

const init = async () => {
  await Mongoose.connect(url, connectionParams);
  await server.register(HapiJWTAuth);
  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ]);
  server.auth.strategy("jwt", "jwt", {
    key: "secret",
    validate,
  });
  server.auth.default("jwt");
  server.start();
};

init()
  .then(() => {
    console.log("Server running on %s", server.info.uri);
  })
  .catch((err) => {
    console.log(err);
  });
