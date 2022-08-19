const mailer = require('../config/mailer')

module.exports = ({email, template, subject, context}, callback) => {
    mailer.sendMail({
        to: email,
        template,
        from: '"Leechineo" <teste@leechineo.com>',
        subject,
        ctx: context
    }, callback)
}
