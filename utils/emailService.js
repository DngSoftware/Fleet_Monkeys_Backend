const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'keyur.it2001@gmail.com',
        pass: 'vtbgmipgoyaatiqq'
      }
    });
  }

  async sendEmail(mailOptions) {
    try {
      if (!mailOptions.to) {
        throw new Error('Recipient email address is missing');
      }
      console.log('Sending email with options:', mailOptions);
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, message: 'Failed to send email', error: error.message };
    }
  }

  async sendWelcomeEmail({ email, loginID, password }) {
    if (!email || !loginID) {
      throw new Error(`Missing required fields: email=${email}, loginID=${loginID}`);
    }
    const mailOptions = {
      from: 'keyur.it2001@gmail.com',
      to: email,
      subject: 'Welcome to Fleet Monkey',
      text: `Welcome to Fleet Monkey!\n\nYour login credentials:\nLoginID: ${loginID}\nPassword: ${password}\n\nPlease change your password after logging in.`,
      html: `<h1>Welcome to Fleet Monkey!</h1><p>Your login credentials:</p><ul><li><strong>LoginID:</strong> ${loginID}</li><li><strong>Password:</strong> ${password}</li></ul><p>Please change your password after logging in.</p>`
    };
    return await this.sendEmail(mailOptions);
  }

  async sendPasswordResetEmail({ email, resetToken }) {
    if (!email || !resetToken) {
      throw new Error(`Missing required fields: email=${email}, resetToken=${resetToken}`);
    }
    const resetUrl = `http://your-app-url/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    const mailOptions = {
      from: 'keyur.it2001@gmail.com',
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset.\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link expires in 1 hour.`,
      html: `<h1>Password Reset Request</h1><p>Click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a><p>This link expires in 1 hour.</p>`
    };
    return await this.sendEmail(mailOptions);
  }
}

module.exports = new EmailService();