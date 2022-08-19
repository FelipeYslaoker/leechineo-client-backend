const getRegionOf = (uf) => {
    const regions = [
        {
            name: 'Norte',
            items: [
                'AC',
                'AP',
                'AM',
                'PA',
                'RO',
                'RR',
                'TO'
            ]
        },
        {
            name: 'Nordeste',
            items: [
                'AL',
                'BA',
                'CE',
                'MA',
                'PB',
                'PE',
                'PI',
                'RN',
                'SE'
            ]
        },
        {
            name: 'Centro-Oeste',
            items: [
                'GO',
                'MT',
                'MS'
            ]
        },
        {
            name: 'Sudeste',
            items: [
                'ES',
                'MG',
                'RJ',
                'SP'
            ]
        },
        {
            name: 'Sul',
            items: [
                'PR',
                'SC',
                'RS'
            ]
        }
    ]
    return regions.filter(region => region.items.includes(uf))[0].name
}

module.exports = getRegionOf
