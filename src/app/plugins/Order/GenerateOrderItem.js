const Product = require('../../models/Product')
const findProductVariant = require('../findProductVariant')
const generateCart = require('../generateCart')

const GenerateOrderItem = async (userID) => {
    const cart = await generateCart(userID)
    const orderItems = []
    for (const cartItem of cart) {
        const product = await Product.findOne({ urlNumber: cartItem.product.code })
        const variant = findProductVariant(cartItem.variant, product)
        const orderItem = {
            name: cartItem.product.name,
            code: cartItem.product.code,
            image: cartItem.product.image,
            price: {
                currency: variant.price.currency,
                basePrice: cartItem.price.base,
                finalPrice: cartItem.price.final || cartItem.price.base
            }
        }
        orderItems.push(orderItem)
    }
    return orderItems
}

module.exports = GenerateOrderItem
