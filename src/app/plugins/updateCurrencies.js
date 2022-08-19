const axios = require('axios').default
const Currency = require('../models/Currency')

module.exports = async () => {
    try {
        const response = await axios.get('https://economia.awesomeapi.com.br/json/available/uniq')
        for (const key in response.data) {
            if (key === 'USD') {
                continue
            }
            try {
                const convertion = await axios.get(`https://economia.awesomeapi.com.br/json/last/${key}-USD`)
                const currency = await Currency.findOne({code: key})
                if (currency && currency.value !== convertion.data[`${key}USD`].ask) {
                    console.log(`Atualizando moeda: ${key}`)
                    await Currency.findOneAndUpdate({code: key}, {value: convertion.data[`${key}USD`].ask, updatedAt: Date.now()})
                } else {
                    console.log(`Criando moeda: ${key}`)
                    await Currency.create({
                        name: response.data[key],
                        code: key,
                        value: convertion.data[`${key}USD`].ask
                    })
                }
            } catch (e) {
                continue
            }
        }
    } catch (e) {
        console.log(e?.response?.data || 'Erro interno')
    }
}