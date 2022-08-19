const axios = require('axios').default

module.exports = async ({entry, out}) => {
    try {
        const response = await axios.get(`http://economia.awesomeapi.com.br/json/last/${entry}-${out}`);
        console.log(response.data)
        return response.data[`${entry}${out}`].ask
    } catch (e) {
        console.log(e.response.data)
        throw new Error('Erro ao cotar') 
    }
}
