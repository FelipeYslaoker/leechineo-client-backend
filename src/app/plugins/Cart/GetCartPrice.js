const Settings = require("../../models/Settings")
const generateCart = require("../generateCart")


const GetCartPrice = async ({ userID, cart, installments }) => {
    if (!cart) {
        cart = await generateCart(userID)
    }
    const price = cart.map(cartItem => cartItem.price.final || cartItem.price.base).reduce((prev, curr) => (prev + curr), 0)
    let interest = 0;
    if (installments) {
        const _installments = await Settings.findOne({ name: 'installments' })
        if (installments) {
            const installmentSelected = JSON.parse(_installments.value).find(_installment => _installment.value === installments)
            interest = (price * installmentSelected.interest) / 100
        }
    }
    return price + interest
}

module.exports = GetCartPrice
