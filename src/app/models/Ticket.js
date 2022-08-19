const mongoose = require('../config/database')

const TicketSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    discount: {
        type: Object,
        required: true
    },
    products: Array,
    type: {
        type: String,
        required: true
    },
    rules: {
        type: Array,
        required: true
    }
});

const Ticket = mongoose.model('Ticket', TicketSchema);

module.exports = Ticket;
