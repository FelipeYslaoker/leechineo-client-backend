module.exports = ({date, parseType}) => {
    switch (parseType) {
        case 'dd-mm-yyyy/mm-dd-yyyy':
            let newDate = ''
            if (date.includes('/')) {
                newDate = date.split('/')
            } else {
                newDate = date.split('-')
            }
            let day = newDate[0]
            let month = newDate[1]
            let year = newDate[2]
            if (year.length === 2) {
                year = `${new Date().getFullYear().toString().slice(0, 2)}${year}`
            }
            return `${month}-${day}-${year}`    
        default:
            return date
    }
}