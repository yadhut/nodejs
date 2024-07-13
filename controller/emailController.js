const nodemailer = require('nodemailer');
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler( async (data, req, res) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: 'yadhukris90@gmail.com',
          pass: 'yhuqoognphoepavs',
        },
    });
    const details = {
        from: '"do-not-replay 👻" <do-not-replay@egmail.com>', // sender address
        to: data.to, // list of receivers
        subject: data.subject, // Subject line
        text: data.text, // plain text body
        html: data.html, // html body
    }
    const info = await transporter.sendMail(details)
    console.log(`Email have been sent successfully...${info}`);

    // transporter.sendMail(details, function(error, info){
    //     if (error) {
    //       console.log(error);
    //     } else {
    //       console.log('Email sent: ' + info.response);
    //     }
    // });
});

module.exports = sendEmail