const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'davdet@gmail.com',
        subject: 'Thanks for joining in!',
        //Attenzione alle backticks (`)
        text: `Welcome to the app, ${name}. Let me know how you get along with it.`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'davdet@gmail.com',
        subject: `Goodbye ${name}`,
        text: 'We\'re sorry you\'re leaving us!'
    })
}


/*----------------------------------------------------------------------------------------------------------------------------*/


module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}