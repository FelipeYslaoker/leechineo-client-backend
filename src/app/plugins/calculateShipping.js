const { default: axios } = require('axios')
const errors = require('../config/errors')
const Product = require('../models/Product')
const findProductVariant = require('./findProductVariant')
const ShippingMethod = require('../models/ShippingMethod')
const getRegionOf = require('./getRegionOf')

const error = (status, message) => ({ error: { status, message } });

const calculateShipping = async (product, zipcode) => {
    if (!zipcode || !product.id || !product.variant) {
        return error(400, errors.invalidRequest)
    }
    const address = (await axios.get(`https://viacep.com.br/ws/${zipcode}/json/`)).data
        if (address.erro) {
            return error(400, errors.zipcode.invalidZipcode)
        } else {
            const _product = await Product.findOne({urlNumber: Number(product.id)})
            const variantOption = findProductVariant(product.variant, _product)
            if (!variantOption) {
                return error(400, errors.invalidRequest)
            } else {
                const shippingMethod = await ShippingMethod.findById(variantOption.shippingMethod)
                if (!shippingMethod) {
                    return error(400, errors.shipping.notFound)
                }
                const defaultMapping = {
                    name: shippingMethod.name,
                    mapping: {
                        zipcode,
                        value: shippingMethod.defaultMapping.price.value, //TODO Converter moeda
                        time: shippingMethod.defaultMapping.time
                    }
                }
                if (shippingMethod?.mappings?.length < 1) {
                    return defaultMapping
                } else {
                    const mapping = 
                        shippingMethod.mappings.filter(_mapping => _mapping.addressLocation.localidade === address.localidade)[0] ||
                        shippingMethod.mappings.filter(_mapping => _mapping.addressLocation.uf === address.uf)[0] ||
                        shippingMethod.mappings.filter(_mapping => {
                            return getRegionOf(_mapping.addressLocation.uf) === getRegionOf(address.uf)
                        })[0]
                    const formattedMapping = {
                        name: shippingMethod.name,
                        mapping: {
                            zipcode,
                            value: mapping.price.value, //TODO Converter moeda
                            time: mapping.time
                        }
                    }
                    if (mapping.regionRadius === 'city') {
                        if (address.localidade === mapping.addressLocation.localidade) {
                            return formattedMapping
                        } else {
                            return defaultMapping
                        }
                    } else if (mapping.regionRadius === 'state') {
                        if (address.uf === mapping.addressLocation.uf) {
                            return formattedMapping
                        } else {
                            return defaultMapping
                        }
                    } else {
                        if (getRegionOf(address.uf) === getRegionOf(mapping.addressLocation.uf)) {
                            return formattedMapping
                        } else {
                            return defaultMapping
                        }
                    }                        
                }
            }
        }
}

module.exports = calculateShipping
