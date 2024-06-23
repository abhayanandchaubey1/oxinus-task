const nodemailer = require('nodemailer');
const config = require('../config');

class EmailClient {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.nodemailer.host,
      port: config.nodemailer.port,
      secure: false,
      auth: {
        user: config.nodemailer.user,
        pass: config.nodemailer.password
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: true
    });
  }

  sendEmail(subject, body, to, from) {
    const mailOptions = {
      from: from,
      to: to,
      subject: subject,
      html: body
    };

    return new Promise((resolve, reject) => {
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          reject(error);
        } else {
          console.log('Email sent:', info.response);
          resolve('Email sent successfully');
        }
      });
    });
  }
}

export default EmailClient;
