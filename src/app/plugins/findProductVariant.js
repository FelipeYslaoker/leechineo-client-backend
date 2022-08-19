const findProductVariant = (variant, product) => {
    if (product.variants.type === 'compound') {
        return product.variants.options.filter(option => option.names.join(' ') === variant.join(' '))[0]
    } else if (product.variants.type === 'simple') {
        return product.variants.options.filter(option => option.name === variant[0])[0]
    } else {
        return product.variants.option
    }
}

module.exports = findProductVariant
