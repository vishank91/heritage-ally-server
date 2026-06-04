const nodemailer = require("nodemailer")
const mailer = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAILSENDER,
        pass: process.env.PASSWORD,
    },
})

module.exports = mailer