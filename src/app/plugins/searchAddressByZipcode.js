const errors = require('../config/errors')

const axios = require('axios').default

const searchAddressByZipcode = async (zipcode) => {
    try {
        const address = (await axios.get(`https://viacep.com.br/ws/${zipcode.replace('-', '')}/json/`)).data
        const _address = {
            zipcode: address.cep,
            publicPlace: address.logradouro,
            complement: address.complemento,
            district: address.bairro,
            city: address.localidade,
            state: address.uf,
        }
        if (!_address.zipcode || !_address.city || !_address.state) {
            return errors.zipcode.invalidZipcode
        }
        return _address
    } catch (e) {
        return errors.zipcode.invalidZipcode
    }
}

module.exports = searchAddressByZipcode
