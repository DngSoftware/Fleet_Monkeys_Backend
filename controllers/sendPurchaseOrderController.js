const { getPurchaseOrderDetails } = require('../models/sendPurchaseOrderModel');
const { generatePurchaseOrderPDF } = require('../services/pdfGeneratorPO');
const { sendRFQEmail } = require('../utils/emailSender');
const fs = require('fs').promises;
const path = require('path');

async function sendPurchaseOrder(req, res) {
  const { poId } = req.body;

  // Validate inputs
  const errors = [];
  if (!poId || isNaN(poId)) {
    errors.push('poId is required and must be a number');
  }

  if (errors.length > 0) {
    console.warn(`Validation errors for POID=${poId}:`, errors);
    return res.status(400).json({ success: false, message: errors.join('; ') });
  }

  try {
    console.log(`Processing Purchase Order for POID=${poId}`);

    // Fetch Purchase Order details and parcels
    const { poDetails, parcels } = await getPurchaseOrderDetails(poId);

    if (!poDetails.SupplierEmail || poDetails.SupplierEmail === 'NA') {
      console.warn(`No email found for SupplierID=${poDetails.SupplierID}`);
      return res.status(400).json({
        success: false,
        message: `No email address found for supplier ${poDetails.SupplierName}`,
      });
    }

    // Generate PDF
    const pdfPath = path.join(__dirname, '..', 'temp', `PurchaseOrder_${poId}.pdf`);
    console.log(`Generating PDF: ${pdfPath}`);
    await generatePurchaseOrderPDF(poDetails, parcels, pdfPath);

    // Send email with PDF
    console.log(`Sending email to ${poDetails.SupplierEmail} for Purchase Order ${poDetails.Series}`);
    const emailResult = await sendRFQEmail(poDetails.SupplierEmail, poDetails.Series, pdfPath);
    console.log(`Email result for POID=${poId}:`, emailResult);

    // Clean up PDF file
    await fs.unlink(pdfPath).catch(err => console.warn(`Failed to delete PDF for POID=${poId}: ${err.message}`));

    return res.status(200).json({
      success: true,
      message: `Purchase Order (ID: ${poId}) sent to ${poDetails.SupplierEmail}`,
    });
  } catch (error) {
    console.error(`Error sending Purchase Order for POID=${poId}:`, error.message, error.stack);
    return res.status(500).json({
      success: false,
      message: `Failed to send Purchase Order: ${error.message}`,
    });
  }
}

module.exports = { sendPurchaseOrder };