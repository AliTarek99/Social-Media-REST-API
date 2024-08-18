const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASS
    }
});

exports.sendEmail = async (subject, textBody, htmlBody, to) => {
    let info = await transporter.sendMail({
        from: process.env.EMAIL,
        to: to,
        subject: subject,
        html: htmlBody,
        text: textBody
    });

    console.log("Message sent: %s", info.messageId);

    return info;
}