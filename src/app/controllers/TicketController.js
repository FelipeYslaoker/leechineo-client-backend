const router = require("express").Router();
const Ticket = require("../models/Ticket");
const auth = require("../middlewares/auth");
const errors = require("../config/errors");
const User = require("../models/User");
const validateTicket = require("../plugins/validateTicket");

router.get("/verify", auth(false), async (req, res) => {
  const { name, type, productID } = req.query;
  const user = await User.findById(req.user.id).select("+usedTickets orders");
  if (!name || !type) {
    return res.status(400).send(errors.invalidRequest);
  }
  try {
    const ticket = await validateTicket({ name, productID, user, type });
    if (ticket.error) {
      return res.status(ticket.error.status).send(ticket.error.message);
    } else {
      return res.send({ ticket: ticket.ticket });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).send(errors.internalServerError);
  }
});

router.get("/get", async (req, res) => {
  try {
    if (req.query.id) {
      const ticket = await Ticket.findById(req.query.id);
      if (!ticket) {
        return res.status(404).send(errors.ticket.ticketNotExist);
      } else {
        return res.send({
          ticket: {
            name: ticket.name,
            discount: ticket.discount,
          },
        });
      }
    } else {
      return res.status(400).send(errors.invalidRequest);
    }
  } catch (e) {
    console.log(e);
    return res.status(500).send(errors.internalServerError);
  }
});

module.exports = (app) => app.use("/ticket", router);
