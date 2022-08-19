let states = [
    { code: 27, uf: 'AL', stateName: 'Alagoas' },
    { code: 12, uf: 'AC', stateName: 'Acre' },
    { code: 16, uf: 'AP', stateName: 'Amapá' },
    { code: 13, uf: 'AM', stateName: 'Amazonas' },
    { code: 29, uf: 'BA', stateName: 'Bahia' },
    { code: 23, uf: 'CE', stateName: 'Ceará' },
    { code: 53, uf: 'DF', stateName: 'Distrito Federal' },
    { code: 32, uf: 'ES', stateName: 'Espírito Santo' },
    { code: 52, uf: 'GO', stateName: 'Goías' },
    { code: 21, uf: 'MA', stateName: 'Maranhão' },
    { code: 51, uf: 'MT', stateName: 'Mato Grosso' },
    { code: 50, uf: 'MS', stateName: 'Mato Grosso do Sul' },
    { code: 31, uf: 'MG', stateName: 'Minas Gerais' },
    { code: 15, uf: 'PA', stateName: 'Pará' },
    { code: 25, uf: 'PB', stateName: 'Paraíba' },
    { code: 41, uf: 'PR', stateName: 'Paraná' },
    { code: 26, uf: 'PE', stateName: 'Pernambuco' },
    { code: 22, uf: 'PI', stateName: 'Piauí' },
    { code: 33, uf: 'RJ', stateName: 'Rio de Janeiro' },
    { code: 24, uf: 'RN', stateName: 'Rio Grande do Norte' },
    { code: 43, uf: 'RS', stateName: 'Rio Grande do Sul' },
    { code: 11, uf: 'RO', stateName: 'Rondônia' },
    { code: 14, uf: 'RR', stateName: 'Roraíma' },
    { code: 42, uf: 'SC', stateName: 'Santa Catarina' },
    { code: 35, uf: 'SP', stateName: 'São Paulo' },
    { code: 28, uf: 'SE', stateName: 'Sergipe' },
    { code: 17, uf: 'TO', stateName: 'Tocantins' },
];

const getState = (uf) => states.find(state => state?.uf === uf)?.uf

module.exports = getState
