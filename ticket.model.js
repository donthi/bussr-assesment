const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
  creationDate: {
    type: Date,
    default: new Date(),
  },
  customerName: {
    type: String,
    trim: true,
  },
  performanceTitle: {
    type: String,
    trim: true,
  },
  performanceTime: {
    type: Date,
  },
  ticketPrice: {
    type: Number,
  },
});

let Ticket;
module.exports = mongoose.model("Ticket", TicketSchema);
