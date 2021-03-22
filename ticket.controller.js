const Boom = require("@hapi/boom");
const Ticket = require("./ticket.model");

function groupBy(arr, cb) {
  return arr.reduce((acc, item) => {
    const key = cb(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
}

function getMonth(monthNumber) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return monthNames[monthNumber];
}

class TicketController {
  static async getAll(req, h) {
    try {
      const tickets = await Ticket.find({}).exec();
      return h.response(tickets);
    } catch (err) {
      return h.response(Boom.badImplementation(err));
    }
  }

  static async getById(req, h) {
    try {
      const ticket = await Ticket.findById(req.params.id).exec();
      return h.response(ticket);
    } catch (err) {
      return h.response(Boom.badImplementation(err));
    }
  }

  static async create(req, h) {
    try {
      const ticket = new Ticket(req.payload);
      await ticket.save();
      return h.response(ticket);
    } catch (err) {
      return h.response(Boom.badImplementation(err));
    }
  }

  static async update(req, h) {
    try {
      const ticket = await Ticket.findByIdAndUpdate(
        req.params.id,
        req.payload,
        { new: true }
      ).exec();
      return h.response(ticket);
    } catch (err) {
      return h.response(Boom.badImplementation(err));
    }
  }

  static async remove(req, h) {
    try {
      const ticket = await Ticket.findByIdAndDelete(req.params.id).exec();
      return h.response(ticket);
    } catch (err) {
      return h.response(Boom.badImplementation(err));
    }
  }

  static async getProfitsByMonth(req, h) {
    try {
      const method = req.query.method;
      if (method === "aggregate") {
        const profitsByMonth = await Ticket.aggregate([
          {
            $group: {
              _id: { $month: "$performanceTime" },
              totalProfit: {
                $sum: "$ticketPrice",
              },
            },
          },
        ]).exec();
        return h.response(
          profitsByMonth.map((x) => ({
            month: getMonth(x._id - 1),
            totalProfit: x.totalProfit,
          }))
        );
      } else if (method === "js") {
        const tickets = await Ticket.find({}).exec();
        const ticketsByMonth = groupBy(tickets, (ticket) =>
          ticket.performanceTime.getMonth()
        );
        const result = Object.keys(ticketsByMonth).map((month) => {
          const profit = ticketsByMonth[month].reduce(
            (acc, ticket) => acc + ticket.ticketPrice,
            0
          );
          return {
            month: getMonth(month),
            totalProfit: profit,
          };
        });
        return h.response(result);
      }
    } catch (err) {
      return h.response(Boom.badImplementation(err));
    }
  }

  static async getVisitsByMonth(req, h) {
    try {
      const method = req.query.method;
      if (method === "aggregate") {
        const visitsByMonth = await Ticket.aggregate([
          {
            $group: {
              _id: { $month: "$performanceTime" },
              totalVisits: {
                $sum: 1,
              },
            },
          },
        ]).exec();
        return h.response(
          visitsByMonth.map((x) => ({
            month: getMonth(x._id - 1),
            totalVisits: x.totalVisits,
          }))
        );
      } else if (method === "js") {
        const tickets = await Ticket.find({}).exec();
        const ticketsByMonth = groupBy(tickets, (ticket) =>
          ticket.performanceTime.getMonth()
        );
        const result = Object.keys(ticketsByMonth).map((month) => ({
          month: getMonth(month),
          totalVisits: ticketsByMonth[month].length,
        }));
        return h.response(result);
      }
    } catch (err) {
      return h.response(Boom.badImplementation(err));
    }
  }
}

module.exports = TicketController;
