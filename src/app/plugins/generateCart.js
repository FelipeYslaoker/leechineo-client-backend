const CartItem = require("../models/CartItem");
const Product = require("../models/Product")
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const validateTicket = require("./validateTicket");

const generateCart = async (userID) => {
    const user = await User.findById(userID).select("+cart +usedTickets +orders");
    const cart = await CartItem.find({user: userID})
    const cartItems = [];
    for (const item of cart) {
        /*
        const calculateShippinProduct = {
          id: item.product,
          variant: item.variant,
        };
        const shippingMethod = await calculateShipping(
          calculateShippinProduct,
          item.zipcode.replace("-", "")
        );
        */ //TODO Calcualr Frete
        const product = await Product.findOne({ urlNumber: item.product })
        const tickets = []
        for (const ticket of item.tickets) {
            const _ticket = await Ticket.findOne({ name: ticket })
            const valid = await validateTicket({ name: _ticket.name, productID: item.product, user, type: 'product' })
            tickets.push({
                name: _ticket.name,
                discount: _ticket.discount,
                valid: valid.ticket ? true : false
            })
        }
        let basePrice
        let finalPrice
        if (product.variants.type === 'unique') {
            basePrice = product.variants.option.price.value
        } else if (product.variants.type === 'simple') {
            basePrice = product.variants.options.filter(option => option.name === item.variant.join(''))[0].price.value
        } else {
            basePrice = product.variants.options.filter(option => option.names.join(' ') === item.variant.join(' '))[0].price.value
        }
        for (const ticket of tickets) {
            let discount
            if (ticket.discount.type === 'percent') {
                discount = basePrice * ticket.discount.value / 100
            } else {
                discount = ticket.discount.value
            }
            finalPrice = basePrice - discount
        }
        cartItems.push({
            id: item.id,
            quantity: item.quantity,
            product: {
                name: product.name,
                image: product.images[0],
                code: item.product
            },
            // shippingMethod: shippingMethod.error ? 'Unavailable' : shippingMethod, //TODO Enviar metodo de envio
            tickets,
            variant: item.variant,
            price: {
                base: Number(basePrice),
                final: Number(finalPrice)
            }
        })
    }
    return cartItems
}

module.exports = generateCart
