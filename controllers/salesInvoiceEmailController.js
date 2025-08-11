const { getSalesInvoiceDetails } = require('../models/salesInvoiceEmailModel');
const { generateSalesInvoicePDF } = require('../services/pdfGeneratorSalesInvoice');
const { sendDocumentEmail } = require('../utils/emailSender');

async function sendSalesInvoice(req, res) {
  const { salesInvoiceId } = req.body;

  // Validate inputs
  const errors = [];
  if (!salesInvoiceId || isNaN(salesInvoiceId)) {
    errors.push('salesInvoiceId is required and must be a number');
  }

  if (errors.length > 0) {
    console.warn(`Validation errors for SalesInvoiceID=${salesInvoiceId}:`, errors);
    return res.status(400).json({ success: false, message: errors.join('; ') });
  }

  try {
    console.log(`Processing Sales Invoice for SalesInvoiceID=${salesInvoiceId}`);

    // Fetch Sales Invoice details and parcels
    const { siDetails, parcels } = await getSalesInvoiceDetails(salesInvoiceId);

    if (!siDetails.CustomerEmail || siDetails.CustomerEmail === 'NA') {
      console.warn(`No email found for CustomerID=${siDetails.CustomerID}`);
      return res.status(400).json({
        success: false,
        message: `No email address found for customer ${siDetails.CustomerName}`,
      });
    }

    // Generate PDF buffer
    console.log(`Generating PDF for SalesInvoiceID=${salesInvoiceId}`);
    const pdfBuffer = await generateSalesInvoicePDF(siDetails, parcels);

    // Send email with PDF
    console.log(`Sending email to ${siDetails.CustomerEmail} for Sales Invoice ${siDetails.Series}`);
    const emailResult = await sendDocumentEmail(
      siDetails.CustomerEmail,
      siDetails.Series,
      pdfBuffer,
      'SalesInvoice'
    );
    console.log(`Email result for SalesInvoiceID=${salesInvoiceId}:`, emailResult);

    return res.status(200).json({
      success: true,
      message: `Sales Invoice (ID: ${salesInvoiceId}) sent to ${siDetails.CustomerEmail}`,
    });
  } catch (error) {
    console.error(`Error sending Sales Invoice for SalesInvoiceID=${salesInvoiceId}:`, error.message, error.stack);
    return res.status(500).json({
      success: false,
      message: `Failed to send Sales Invoice: ${error.message}`,
    });
  }
}

module.exports = { sendSalesInvoice };