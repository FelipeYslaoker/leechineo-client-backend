const dateStringParse = require('./dateStringParse')

module.exports = (ticket, user) => {
    const validationList = []
    const today = new Date(`${((new Date().getMonth()) + 1).toString().padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}-${new Date().getFullYear()}`)
    for (const rule of ticket.rules) {
        switch (rule.id) {
            case 'only-x-times':
                if (user?.usedTickets) {
                    validationList.push(user.usedTickets.filter(usedTicket => usedTicket === ticket._id.toString()).length < Number(rule.value))
                } else {
                    validationList.push(true)
                }
                break
            case 'only-x-days-after-account-created':
                if (!user) return false
                const createdAccountDate = user.createdAt
                const diffDays = Math.ceil(Math.abs(createdAccountDate - today) / (1000 * 60 * 60 * 24))
                validationList.push(diffDays > Number(rule.value))
                break
            case 'only-from-x-and-x-date':
                const initialDate = new Date(dateStringParse({ date: rule.value.initialDate, parseType: 'dd-mm-yyyy/mm-dd-yyyy' })) //FLAG
                const finalDate = new Date(dateStringParse({ date: rule.value.finalDate, parseType: 'dd-mm-yyyy/mm-dd-yyyy' })) //FLAG
                validationList.push(today >= initialDate && today <= finalDate)
                break
            case 'only-from-x-date':
                const date = dateStringParse({ date: rule.value, parseType: 'dd-mm-yyyy/mm-dd-yyyy' })
                validationList.push(date === `${((new Date().getMonth()) + 1).toString().padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}-${new Date().getFullYear()}`)
                break
            case 'only-with-x-purchase':
                if (user?.orders) {
                    validationList.push(user.orders.length === Number(rule.value))
                } else {
                    validationList.push(false)
                }
                break
            case 'only-from-x-purchase':
                if (user?.orders) {
                    validationList.push(user.orders.length <= Number(rule.value))
                } else {
                    validationList.push(false)
                }
                break
            case 'only-first-purchase':
                if (user?.orders) {
                    validationList.push(user.orders.length === 0)
                } else {
                    validationList.push(false)
                }
                break
            default:
                validationList.push(false)
                break
        }
    }
    return validationList.every(rule => rule)
}
