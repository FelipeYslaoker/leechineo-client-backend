const Ticket = require("../models/Ticket");
const verifyTicket = require("./verifyTicket");
const errors = require("../config/errors");

const error = (status, message) => ({ error: { status, message } });

const validateTicket = async ({ name, productID, user, type }) => {
  const ticket = await Ticket.findOne({ name });
  if (ticket) {
    if (type === "product" && ticket.type === "product" && !productID) {
      return error(400, errors.invalidRequest);
    }
    if (type === "product" && ticket.type === "cart") {
        return error(403, errors.ticket.ticketCantBeAppliedOnThisProduct(name))
    } else if (type === "cart" && ticket.type === "product") {
        return error(403, errors.ticket.ticketCantBeAppliedOnCart(name))
    }
    if (type === "product" && !ticket.products.includes(Number(productID))) {
        return error(403, errors.ticket.ticketCantBeAppliedOnThisProduct(name))
    }
    const valid = verifyTicket(ticket, user);
    if (valid) {
      return { ticket: ticket.id };
    } else {
      return error(403, errors.ticket.ticketNotElegible(name))
    }
  } else {
    return error(404, errors.ticket.ticketNotExist(name));
  }
};

module.exports = validateTicket;
