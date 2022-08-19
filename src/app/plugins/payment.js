const { default: axios } = require("axios")
const uniqid = require('uniqid')
const getState = require('../getters/state')
const authHeaders = {
    pagSeguro: {
        'Authorization': process.env.PAG_SEGURO_TOKEN,
        'Content-Type': 'application/json'
    }
}

function getPaymentMethod({ paymentMethod, gateway }) {
    if (gateway === 'pagSeguro') {
        switch (paymentMethod) {
            case 'creditCard':
                return 'CREDIT_CARD'
            case 'debitCard':
                return 'DEBIT_CARD'
            case 'slip':
                return 'BOLETO'
        }
    }
}

class Payment {
    static async pay({
        amount: { currency, value },
        paymentMethod: { installments, capture, type },
        referenceID, description, softDescriptor,
        cdCard: { token, number, networToken, expireMonth, expireYear, securityCode, storeCard, holderName },
        slip: { holder, cpf },
        webhookURLs, user,
        address: { zipcode, city, state, district, street, number: housenumber, complement, reference, phone }
    }) {

        const today = new Date()
        const dueDate = new Date(today.setDate(today.getDate() + 3)) //TODO Personalizar o vencimento do boleto
        const dueDay = dueDate.getDate().toString().padStart(2, '0')
        const dueMonth = (dueDate.getMonth() + 1).toString().padStart(2, '0')
        const dueYear = dueDate.getFullYear()

        try {
            const beforeDot = value.toString().split('.')[0]
            const afterDot = value.toString().split('.')[1]
            const price = beforeDot + afterDot[0] + afterDot[1]

            const payment = {
                reference_id: referenceID || uniqid(),
                description: description || 'Pagamento em Leechineo',
                amount: {
                    value: price,
                    currency
                },
                payment_method: {
                    type: getPaymentMethod({ paymentMethod: type, gateway: 'pagSeguro' }),
                    capture: capture || false,
                    installments,
                    soft_descriptor: softDescriptor,
                    card: {
                        number: number?.replaceAll(' ', ''),
                        exp_month: expireMonth,
                        exp_year: '20' + expireYear,
                        security_code: securityCode,
                        holder: {
                            name: holderName
                        }
                    },
                    boleto: {
                        due_date: `${dueYear}-${dueMonth}-${dueDay}`,
                        holder: {
                            name: holder,
                            email: user?.email,
                            tax_id: cpf?.replaceAll('.', '')?.replace('-', ''),
                            address: {
                                street,
                                number: housenumber,
                                locality: district,
                                city,
                                region_code: state,
                                postal_code: zipcode?.replace('-', ''),
                                region: getState(state),
                                country: 'Brasil'
                            }
                        },
                    },
                },
                notification_urls: webhookURLs
            }

            const response = await axios.post('https://sandbox.api.pagseguro.com/charges', payment, {
                headers: authHeaders.pagSeguro
            })
            return {
                status: response.data?.status,
                slipUrl: response.data?.links?.find(link => link.href.includes('pdf'))?.href,
                slipBarcode: response.data?.payment_method?.boleto?.barcode,
                formattedSlipBarcode: response.data?.payment_method?.boleto?.formatted_barcode,
                reference: response.data?.id
            }
        } catch (e) {
            throw e
        }
    }
    static async refund({ reference, value }) {
        try {
            const charge = (await axios.post(`https://sandbox.api.pagseguro.com/charges/${reference}/cancel`, {
                amount: {
                    value
                }
            }, {
                headers: authHeaders.pagSeguro
            })).data
            return {
                status: charge.status
            }
        } catch (e) {
            throw e
        }
    }
}

module.exports = Payment