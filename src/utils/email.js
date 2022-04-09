import nodemailer from 'nodemailer';
import config from 'config';
import logger from './logger';

const sendActivationEmail = (name, email, link) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.get('gmailemail'),
      pass: config.get('gmailpassword'),
    }
  });
  
  const mailOptions = {
    from: 'akinwalehabib@gmail.com',
    to: email,
    subject: 'Activate your pasteBinClone account',
    text: `Hi ${name},
    
    You recently signed up for an account on pasteBinClone.
    
    Activate your account by clicking this link: ${link}.
    
    Thank you.`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if(err) {
      logger.error(`sendActivationEmail error - ${err}`);
    } else {
      logger.info(`sendActiovationEmail - Email sent to: ${email}`);
    }
  });
};

export default sendActivationEmail;
