const { getSalesQuotationDetails } = require('../models/sendSalesQuotationModel');
const { generateSalesQuotationPDF } = require('../services/pdfGenerator1');
const { sendRFQEmail } = require('../utils/emailSender');

async function sendSalesQuotation(req, res) {
  const { salesQuotationID } = req.body;

  // Validate inputs
  const errors = [];
  if (!salesQuotationID || isNaN(salesQuotationID)) {
    errors.push('salesQuotationID is required and must be a number');
  }

  if (errors.length > 0) {
    console.warn(`Validation errors for SalesQuotationID=${salesQuotationID}:`, errors);
    return res.status(400).json({ success: false, message: errors.join('; ') });
  }

  try {
    console.log(`Processing Sales Quotation for SalesQuotationID=${salesQuotationID}`);

    // Fetch sales quotation details and parcels
    const { quotationDetails, parcels } = await getSalesQuotationDetails(salesQuotationID);

    if (!quotationDetails.CustomerEmail) {
      console.warn(`No email found for CustomerID=${quotationDetails.CustomerID}`);
      return res.status(400).json({
        success: false,
        message: `No email address found for customer ${quotationDetails.CustomerName}`,
      });
    }

    // Generate PDF buffer
    console.log(`Generating PDF for SalesQuotationID=${salesQuotationID}`);
    const pdfBuffer = await generateSalesQuotationPDF(quotationDetails, parcels);

    // Send email with PDF
    console.log(`Sending email to ${quotationDetails.CustomerEmail} for Sales Quotation ${quotationDetails.Series}`);
    const emailResult = await sendRFQEmail(quotationDetails.CustomerEmail, quotationDetails.Series, pdfBuffer);
    console.log(`Email result for SalesQuotationID=${salesQuotationID}:`, emailResult);

    return res.status(200).json({
      success: true,
      message: `Sales Quotation (ID: ${salesQuotationID}) sent to ${quotationDetails.CustomerEmail}`,
    });
  } catch (error) {
    console.error(`Error sending Sales Quotation for SalesQuotationID=${salesQuotationID}:`, error.message, error.stack);
    return res.status(500).json({
      success: false,
      message: `Failed to send Sales Quotation: ${error.message}`,
    });
  }
}

module.exports = { sendSalesQuotation };