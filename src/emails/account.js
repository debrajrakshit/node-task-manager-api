const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'andrew@mead.io',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app ${name}. Let me know how you get along with the app.`
    });
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'andrew@mead.io',
        subject: 'Cancellation of account',
        text: `Hi! ${name}, your account is successfully deleted! Thank you for using our service. We hope to see you back sometime soon.`
    });
}

module.exports = {
    sendWelcomeEmail : sendWelcomeEmail,
    sendCancellationEmail: sendCancellationEmail
}