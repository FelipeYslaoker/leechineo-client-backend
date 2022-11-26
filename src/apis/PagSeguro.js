const { default: axios } = require("axios")
const getRegionOf = require("../app/plugins/getRegionOf")

class PagSeguro {
    static #req = axios.create({
        baseURL: 'https://sandbox.api.pagseguro.com/',
        timeout: 600000,
        headers: {
            'Authorization': process.env.PAG_SEGURO_TOKEN,
            'Content-Type': 'application/json'
        }
    })

    static #priceConverter (price) {
        const priceToFixed = Number(price).toFixed(2)
        const priceString = priceToFixed.toString()
        const finalPrice = priceString.replaceAll('.', '')
        return Number(finalPrice)
    }

    static async creditCard ({ price, installments, creditCard, verification = false }) {
        const response = await this.#req.post('/charges', {
            amount: {
                value: this.#priceConverter(price),
                currency: 'BRL'
            },
            payment_method: {
                type: 'CREDIT_CARD',
                installments,
                capture: verification ? false : true,
                card: creditCard
            }
        })
        return response.data
    }
    static async slip ({ dueDate, holderName, holderTaxID, holderEmail, price, address }) {
        const response = await this.#req.post('/charges', {
            amount: {
                value: this.#priceConverter(price),
                currency: 'BRL'
            },
            payment_method: {
                type: 'BOLETO',
                installments: 1,
                capture: true,
                boleto: {
                    due_date: dueDate,
                    holder: {
                        name: holderName,
                        tax_id: holderTaxID,
                        email: holderEmail,
                        address: {
                            street: address.street,
                            number: address.number,
                            complement: address.complement,
                            locality: address.district,
                            city: address.city,
                            region_code: address.state,
                            country: 'Brasil',
                            region: getRegionOf(address.state),
                            postal_code: address.zipcode.replaceAll('-', '')
                        }
                    }
                }
            }
        })
        return response.data
    }
    static async refund ({ transactionId, price }) {
        console.log(transactionId)
        const response = await this.#req.post(`/charges/${transactionId}/cancel`, {
            amount: {
                value: this.#priceConverter(price)
            }
        })
        return response.data
    }
}

module.exports = PagSeguro
