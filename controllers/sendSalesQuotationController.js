const { getSalesQuotationDetails } = require('../models/sendSalesQuotationModel');
const { generateSalesQuotationPDF } = require('../services/pdfGenerator1');
const { sendRFQEmail } = require('../utils/emailSender');
const fs = require('fs').promises;
const path = require('path');

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

    // Generate PDF
    const pdfPath = path.join(__dirname, '..', 'temp', `SalesQuotation_${salesQuotationID}.pdf`);
    console.log(`Generating PDF: ${pdfPath}`);
    await generateSalesQuotationPDF(quotationDetails, parcels, pdfPath);

    // Send email with PDF
    console.log(`Sending email to ${quotationDetails.CustomerEmail} for Sales Quotation ${quotationDetails.Series}`);
    const emailResult = await sendRFQEmail(quotationDetails.CustomerEmail, quotationDetails.Series, pdfPath);
    console.log(`Email result for SalesQuotationID=${salesQuotationID}:`, emailResult);

    // Clean up PDF file
    await fs.unlink(pdfPath).catch(err => console.warn(`Failed to delete PDF for SalesQuotationID=${salesQuotationID}: ${err.message}`));

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