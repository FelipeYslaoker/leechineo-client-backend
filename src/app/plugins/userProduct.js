const Brand = require('../models/Brand')
const ShippingMethod = require('../models/ShippingMethod')

async function generateVariantOptions(product) {
    switch (product.variants.type) {
        case 'unique':
            const shippingMethod = await ShippingMethod.findById(product.variants.option.shippingMethod)
            return {
                name: product.variants.option.name,
                stock: product.variants.option.stock,
                shippingMethod: {
                    name: shippingMethod.name,
                    mappings: shippingMethod.mappings,
                    defaultMapping: shippingMethod.defaultMapping
                },
                discount: product.variants.option.discount,
                price: product.variants.option.price,
                image: product.variants.option.image
            }
        case 'simple':
            const simpleOptions = []
            for (const option of product.variants.options) {
                const shippingMethod = await ShippingMethod.findById(option.shippingMethod)
                simpleOptions.push({
                    stock: option.stock,
                    discout: option.discount,
                    price: option.price,
                    shippingMethod: {
                        name: shippingMethod.name,
                        mappings: shippingMethod.mappings,
                        defaultMapping: shippingMethod.defaultMapping
                    },
                    name: option.name,
                    image: option.image
                })
            }
            return simpleOptions
        case 'compound':
            const compoundOptions = []
            for (const option of product.variants.options) {
                const shippingMethod = await ShippingMethod.findById(option.shippingMethod)
                compoundOptions.push({
                    stock: option.stock,
                    discount: option.discount,
                    price: option.price,
                    shippingMethod: {
                        name: shippingMethod.name,
                        mappings: shippingMethod.mappings,
                        defaultMapping: shippingMethod.defaultMapping,
                    },
                    names: option.names,
                    image: option.image
                })
            }
            return compoundOptions
    }
}

module.exports = async (product, user) => {
    const _brand = await Brand.findById(product.brand)
    const brand = _brand ? {
        name: _brand.name,
        color: _brand.color,
        url: _brand.url
    } : undefined
    const options = await generateVariantOptions(product)
    const variants = product.variants.type === 'unique' ? {
        title: product.variants.title,
        type: product.variants.type,
        option: options
    }
        : product.variants.type === 'simple' ? {
            title: product.variants.title,
            type: product.variants.type,
            options: options
        }
            : {
                title: product.variants.title,
                type: product.variants.type,
                attributes: product.variants.attributes,
                options: options
            }
    return {
        urlNumber: product.urlNumber,
        name: product.name,
        specifications: product.specifications,
        category: product.category,
        subCategory: product.subCategory,
        subSubCategory: product.subSubCategory,
        brand,
        type: product.type,
        description: product.description,
        images: product.images,
        favorite: user?.favorites?.includes(product?.id) || false,
        variants: variants //TODO Converter preços
    }
}