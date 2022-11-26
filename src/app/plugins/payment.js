const GNRequest = require('../../apis/gerencianet')
const generateCart = require('./generateCart')
const User = require("../models/User")
const Creditcard = require("../models/CreditCard")
const CryptCard = require("./CreditCard/cryptCard")
const PagSeguro = require("../../apis/PagSeguro")

class Payment {
    static async pix({ userId }) {
        const cart = await generateCart(userId)
        let price = cart.map(cartItem => cartItem.price.final || cartItem.price.base).reduce((prev, curr) => (prev + curr), 0)
        const user = await User.findById(userId)
        const discount = price * 5 / 100
        const finalPrice = price - discount
        const chargeData = {
            calendario: {
                expiracao: 1800,
            },
            devedor: {
                cpf: user.cpf.replace(/\D/g, ''),
                nome: `${user.name} ${user.surname}`
            },
            valor: {
                original: `${finalPrice.toFixed(2)}`
            },
            chave: 'dcb81236-45a4-4b35-bb63-93c0bdc5533a'
        }
        const reqGN = await GNRequest({
            clientID: process.env.GN_CLIENT_ID,
            clientSecret: process.env.GN_CLIENT_SECRET
        });
        const chargeResponse = await reqGN.post('/v2/cob', chargeData)
        const qrCodeResponse = await reqGN.get(`/v2/loc/${chargeResponse.data.loc.id}/qrcode`)
        return {
            id: chargeResponse.data.txid,
            code: qrCodeResponse.data.qrcode,
            qrCode: qrCodeResponse.data.imagemQrcode,
            price: price,
            finalPrice: finalPrice.toFixed()
        }
    }

    static async requestPix({ id }) {
        const reqGN = await GNRequest({
            clientID: process.env.GN_CLIENT_ID,
            clientSecret: process.env.GN_CLIENT_SECRET
        });
        const pixResponse = reqGN.get(`/v2/cob/${id}`)
        return {
            id: pixResponse.data.txid
        }
    }

    static async creditCard({ price, installments = 1, creditCard, securityCode, verification }) {
        const encryptedCard = await Creditcard.findById(creditCard)
        const decryptedCard = (new CryptCard({ encryptedCard, securityCode })).fullDecrypted

        try {
            const payment = await PagSeguro.creditCard({
                price, installments, verification,
                creditCard: {
                    number: decryptedCard.number?.replaceAll(' ', ''),
                    exp_month: decryptedCard.expireMonth,
                    exp_year: '20' + decryptedCard.expireYear,
                    security_code: securityCode,
                    holder: {
                        name: decryptedCard.holderName
                    }
                }
            })
            return {
                status: payment.status,
                transactionId: payment.id
            }
        } catch (e) {
            throw e
        }
    }

    static async slip({ holderName, holderEmail, holderTaxID, price, address }) {
        const today = new Date()
        const dueDate = new Date(today.setDate(today.getDate() + 3)) //TODO Personalizar o vencimento do boleto

        const dueDay = dueDate.getDate().toString().padStart(2, '0')
        const dueMonth = (dueDate.getMonth() + 1).toString().padStart(2, '0')
        const dueYear = dueDate.getFullYear()

        try {
            const payment = await PagSeguro.slip({
                dueDate: `${dueYear}-${dueMonth}-${dueDay}`,
                price, holderName, holderEmail, holderTaxID: holderTaxID.replaceAll('.', '').replaceAll('-', ''),
                address
            })
            return {
                status: payment.status,
                slipUrl: payment.links?.find(link => link.href.includes('pdf'))?.href,
                slipBarcode: payment.payment_method?.boleto?.barcode,
                formattedSlipBarcode: payment.payment_method?.boleto?.formatted_barcode,
                transactionId: payment.id
            }
        } catch (e) {
            throw e
        }
    }

    static async refund({ transactionId, price }) {
        try {
            const payment = await PagSeguro.refund({ transactionId, price })
            return {
                status: payment.status
            }
        } catch (e) {
            throw e
        }
    }
}

module.exports = Payment
