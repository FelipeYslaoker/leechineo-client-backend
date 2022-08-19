const checkers = [
    {
        brand: 'Amex',
        id: 'amex',
        rules: [
            new RegExp('^3[47][0-9]{13}$')
        ]
    },
    {
        brand: 'Visa',
        id: 'visa',
        rules: [
            new RegExp('^4[0-9]{12}(?:[0-9]{3})?$')
        ]
    },
    {
        brand: 'China Union Pay',
        id: 'china_union_pay',
        rules: [
            new RegExp('^62[0-9]{14}[0-9]*$'),
            new RegExp('^81[0-9]{14}[0-9]*$')
        ]
    },
    {
        brand: 'Mastercard',
        id: 'mastercard',
        rules: [
            new RegExp('^5[1-5][0-9]{14}$'),
            new RegExp('^2[2-7][0-9]{14}$')
        ]
    },
    {
        brand: 'Discover',
        id: 'discover',
        rules: [
            new RegExp('^6011[0-9]{12}[0-9]*$'),
            new RegExp('^62[24568][0-9]{13}[0-9]*$'),
            new RegExp('^6[45][0-9]{14}[0-9]*$')
        ]
    },
    {
        brand: 'Dinners',
        id: 'dinners',
        rules: [
            new RegExp('^3[0689][0-9]{12}[0-9]*$'),
        ]
    },
    {
        brand: 'JBC',
        id: 'jbc',
        rules: [
            new RegExp('^35[0-9]{14}[0-9]*$')
        ]
    }
]

const getCardBrand = (card) => {
    const brand = checkers.find(
        checker => checker.rules.find(
            rule => rule.test(card)
        )
    )
    return brand
}

module.exports = getCardBrand
