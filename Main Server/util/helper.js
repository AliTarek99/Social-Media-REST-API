const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

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

exports.decodejwt = (req, res, next) => {
    let token = req.Authorization || req.get('Authorization');
    if(token) {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.userId;
        if(next)
            return next();
        return payload;
    }
}