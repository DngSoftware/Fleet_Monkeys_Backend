const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'keyur.it2001@gmail.com',
    pass: 'vtbgmipgoyaatiqq',
  },
  service: 'gmail',
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

async function sendRFQEmail(toEmail, rfqSeries, pdfBuffer) {
  try {
    const mailOptions = {
      from: `"Fleet Monkey" <keyur.it2001@gmail.com>`,
      to: toEmail,
      subject: `Purchase RFQ: ${rfqSeries}`,
      text: `Dear Supplier,\n\nPlease find attached the Purchase RFQ (${rfqSeries}) for your review. Kindly submit your quotation at your earliest convenience.\n\nBest regards,\nFleet Monkey Team`,
      attachments: [
        {
          filename: `RFQ_${rfqSeries}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${toEmail}: Message ID ${info.messageId}`);
    return { success: true, message: `Email sent to ${toEmail}` };
  } catch (error) {
    console.error(`Error sending email to ${toEmail} for RFQ ${rfqSeries}:`, error.message, error.stack);
    throw new Error(`Error sending email: ${error.message}`);
  }
}

module.exports = { sendRFQEmail };