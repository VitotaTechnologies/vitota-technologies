require('dotenv').config();
const nodemailer = require('nodemailer');

async function main() {
  console.log('SMTP TEST START');
  console.log('HOST:', process.env.SMTP_HOST);
  console.log('PORT:', process.env.SMTP_PORT);
  console.log('USER:', process.env.SMTP_USER);
  console.log('PASSWORD LOADED:', Boolean(process.env.SMTP_PASSWORD));

  const port = Number(process.env.SMTP_PORT || 587);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    requireTLS: port === 587,

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },

    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  try {
    await transporter.verify();

    console.log('');
    console.log('================================');
    console.log('SMTP AUTHENTICATION SUCCESS');
    console.log('================================');
  } catch (error) {
    console.log('');
    console.log('================================');
    console.log('SMTP AUTHENTICATION FAILED');
    console.log('================================');
    console.log('');

    console.log('CODE:', error.code);
    console.log('COMMAND:', error.command);
    console.log('RESPONSE CODE:', error.responseCode);
    console.log('RESPONSE:', error.response);
  }
}

main();