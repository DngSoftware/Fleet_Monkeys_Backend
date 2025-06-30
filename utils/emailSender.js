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

async function sendDocumentEmail(toEmail, series, pdfBuffer, documentType) {
  try {
    let subject, text, filenamePrefix;
    switch (documentType) {
      case 'PurchaseRFQ':
        subject = `Purchase RFQ: ${series}`;
        text = `Dear Supplier,\n\nPlease find attached the Purchase RFQ (${series}) for your review. Kindly submit your quotation at your earliest convenience.\n\nBest regards,\nFleet Monkey Team`;
        filenamePrefix = 'RFQ';
        break;
      case 'SalesQuotation':
        subject = `Sales Quotation: ${series}`;
        text = `Dear Customer,\n\nPlease find attached the Sales Quotation (${series}) for your review. Kindly confirm acceptance at your earliest convenience.\n\nBest regards,\nFleet Monkey Team`;
        filenamePrefix = 'SalesQuotation';
        break;
      case 'PurchaseOrder':
        subject = `Purchase Order: ${series}`;
        text = `Dear Supplier,\n\nPlease find attached the Purchase Order (${series}) for your review. Kindly confirm receipt at your earliest convenience.\n\nBest regards,\nFleet Monkey Team`;
        filenamePrefix = 'PurchaseOrder';
        break;
      default:
        throw new Error(`Invalid document type: ${documentType}`);
    }

    const mailOptions = {
      from: `"Fleet Monkey" <keyur.it2001@gmail.com>`,
      to: toEmail,
      subject,
      text,
      attachments: [
        {
          filename: `${filenamePrefix}_${series}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${toEmail} for ${documentType} ${series}: Message ID ${info.messageId}`);
    return { success: true, message: `Email sent to ${toEmail}` };
  } catch (error) {
    console.error(`Error sending email to ${toEmail} for ${documentType} ${series}:`, error.message, error.stack);
    throw new Error(`Error sending email: ${error.message}`);
  }
}

module.exports = { sendDocumentEmail };