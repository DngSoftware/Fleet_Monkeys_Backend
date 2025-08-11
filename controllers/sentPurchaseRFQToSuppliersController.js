const { getPurchaseRFQDetails, getSupplierDetails, createSupplierQuotation, getSupplierQuotationDetails, logPurchaseRFQToSupplier } = require('../models/sentPurchaseRFQToSuppliersModel');
const { generateRFQPDF } = require('../services/pdfGenerator');
const { sendDocumentEmail } = require('../utils/emailSender');
const Bottleneck = require('bottleneck');

const limiter = new Bottleneck({ maxConcurrent: 10, minTime: 100 });

async function sendRFQToSuppliers(req, res) {
  const { purchaseRFQID, supplierIDs, supplierQuotationIDs, createdByID } = req.body;

  // Validation
  const errors = [];
  if (!purchaseRFQID || isNaN(purchaseRFQID)) errors.push('PurchaseRFQID is required and must be a number');
  if (!supplierIDs || !Array.isArray(supplierIDs) || supplierIDs.length === 0) errors.push('supplierIDs is required and must be a non-empty array');
  if (!createdByID || isNaN(createdByID)) errors.push('createdByID is required and must be a number');
  if (supplierQuotationIDs && (!Array.isArray(supplierQuotationIDs) || supplierQuotationIDs.length !== supplierIDs.length)) {
    errors.push('supplierQuotationIDs must be an array of the same length as supplierIDs');
  }
  if (errors.length > 0) {
    console.warn(`Validation errors for PurchaseRFQID=${purchaseRFQID}:`, errors);
    return res.status(400).json({ success: false, message: errors.join('; ') });
  }

  try {
    // Fetch RFQ details and parcels
    const { rfqDetails, parcels } = await getPurchaseRFQDetails(purchaseRFQID);
    
    // Fetch all supplier details in one query
    const suppliers = await getSupplierDetails(supplierIDs);
    const supplierMap = new Map(suppliers.map(s => [s.SupplierID, s]));

    // Process suppliers in parallel
    const results = await Promise.all(
      supplierIDs.map(async (supplierID, i) => {
        try {
          const supplier = supplierMap.get(supplierID);
          if (!supplier || !supplier.SupplierEmail) {
            return { supplierID, supplierQuotationID: supplierQuotationIDs?.[i], success: false, message: 'Supplier email not found' };
          }

          // Create or use existing supplier quotation
          const supplierQuotationID = supplierQuotationIDs ? supplierQuotationIDs[i] : await createSupplierQuotation(purchaseRFQID, supplierID, createdByID);
          
          // Fetch quotation details
          const { quotationDetails, quotationParcels } = await getSupplierQuotationDetails(supplierQuotationID, supplierID);

          // Generate PDF with rate limiting
          console.log(`Generating PDF for SupplierID=${supplierID}`);
          const pdfBuffer = await limiter.schedule(() => generateRFQPDF(rfqDetails, parcels, supplier, quotationDetails, quotationParcels));

          // Send email with rate limiting
          console.log(`Sending email to ${supplier.SupplierEmail} for RFQ ${rfqDetails.Series}`);
          const emailResult = await limiter.schedule(() => sendDocumentEmail(supplier.SupplierEmail, rfqDetails.Series, pdfBuffer, 'PurchaseRFQ'));

          // Log the RFQ sent to supplier
          await logPurchaseRFQToSupplier(purchaseRFQID, supplierID, createdByID);

          return {
            supplierID,
            supplierQuotationID,
            success: true,
            message: `Supplier Quotation (ID: ${supplierQuotationID}) sent to ${supplier.SupplierEmail} and logged`,
          };
        } catch (error) {
          console.error(`Error for SupplierID=${supplierID}:`, error.message, error.stack);
          return { supplierID, supplierQuotationID: supplierQuotationIDs?.[i], success: false, message: `Failed for supplier ${supplierID}: ${error.message}` };
        }
      })
    );

    return res.status(200).json({ success: true, results });
  } catch (error) {
    console.error(`Error sending RFQ for PurchaseRFQID=${purchaseRFQID}:`, error.message, error.stack);
    return res.status(500).json({ success: false, message: `Failed to send RFQ: ${error.message}` });
  }
}

module.exports = { sendRFQToSuppliers };