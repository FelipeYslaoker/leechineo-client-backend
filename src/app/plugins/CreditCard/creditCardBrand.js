const checkers = [
    {
        name: 'Amex',
        id: 'amex',
        rules: [
            new RegExp('^3[47][0-9]{13}$')
        ]
    },
    {
        name: 'Visa',
        id: 'visa',
        rules: [
            new RegExp('^4[0-9]{12}(?:[0-9]{3})?$')
        ]
    },
    {
        name: 'China Union Pay',
        id: 'china_union_pay',
        rules: [
            new RegExp('^62[0-9]{14}[0-9]*$'),
            new RegExp('^81[0-9]{14}[0-9]*$')
        ]
    },
    {
        name: 'Mastercard',
        id: 'mastercard',
        rules: [
            new RegExp('^5[1-5][0-9]{14}$'),
            new RegExp('^2[2-7][0-9]{14}$')
        ]
    },
    {
        name: 'Discover',
        id: 'discover',
        rules: [
            new RegExp('^6011[0-9]{12}[0-9]*$'),
            new RegExp('^62[24568][0-9]{13}[0-9]*$'),
            new RegExp('^6[45][0-9]{14}[0-9]*$')
        ]
    },
    {
        name: 'Dinners',
        id: 'dinners',
        rules: [
            new RegExp('^3[0689][0-9]{12}[0-9]*$'),
        ]
    },
    {
        name: 'JBC',
        id: 'jbc',
        rules: [
            new RegExp('^35[0-9]{14}[0-9]*$')
        ]
    }
]

const getCardBrand = (number) => {
    const brand = checkers.find(
        checker => checker.rules.find(
            rule => rule.test(number.replaceAll(' ', ''))
        )
    )
    return {
        id: brand.id,
        name: brand.name
    }
}

module.exports = getCardBrand
