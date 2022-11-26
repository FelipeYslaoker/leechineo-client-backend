const CartItem = require('../../models/CartItem')

const CleanCart = async (userID) => {
    const cartUser = await CartItem.find({ user: userID })
    for (const cartItem of cartUser) {
        await CartItem.findByIdAndDelete(cartItem.id)
    }
}

module.exports = CleanCart
