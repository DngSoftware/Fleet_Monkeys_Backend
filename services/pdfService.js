const PDFDocument = require('pdfkit');

class PDFService {
  static generatePurchaseRFQPDF(purchaseRFQData, companyData) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      const filename = `PurchaseRFQ_${purchaseRFQData.purchaseRFQ.PurchaseRFQID}.pdf`;

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve({ filename, pdfData });
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('Purchase Request for Quotation (RFQ)', { align: 'center' });
      doc.moveDown();

      // Company Info
      if (companyData) {
        doc.fontSize(12).text(companyData.CompanyName, { align: 'left' });
        if (companyData.Website) doc.text(companyData.Website, { align: 'left' });
        if (companyData.VAT_Account) doc.text(`VAT: ${companyData.VAT_Account}`, { align: 'left' });
        doc.moveDown();
      }

      // RFQ Details
      doc.fontSize(14).text('RFQ Details', { underline: true });
      doc.fontSize(12)
        .text(`RFQ ID: ${purchaseRFQData.purchaseRFQ.PurchaseRFQID}`)
        .text(`Sales RFQ ID: ${purchaseRFQData.purchaseRFQ.SalesRFQID}`)
        .text(`Status: ${purchaseRFQData.purchaseRFQ.Status}`)
        .text(`Created: ${new Date(purchaseRFQData.purchaseRFQ.CreatedDateTime).toLocaleString()}`);
      doc.moveDown();

      // Parcels Table
      if (purchaseRFQData.parcels && purchaseRFQData.parcels.length > 0) {
        doc.fontSize(14).text('Parcels', { underline: true });
        doc.moveDown(0.5);

        // Table Header
        const tableTop = doc.y;
        const itemCodeX = 50;
        const itemNameX = 150;
        const quantityX = 350;
        const uomX = 450;

        doc.fontSize(10).font('Helvetica-Bold')
          .text('Item Code', itemCodeX, tableTop)
          .text('Item Name', itemNameX, tableTop)
          .text('Quantity', quantityX, tableTop)
          .text('UOM', uomX, tableTop);

        // Table Rows
        let y = tableTop + 20;
        purchaseRFQData.parcels.forEach(parcel => {
          doc.fontSize(10).font('Helvetica')
            .text(parcel.ItemCode || '', itemCodeX, y)
            .text(parcel.ItemName || '', itemNameX, y, { width: 200 })
            .text(parcel.ItemQuantity.toFixed(2), quantityX, y)
            .text(parcel.UOM || '', uomX, y);
          y += 20;
        });

        doc.moveDown();
      }

      // Footer
      doc.fontSize(10).text('Please submit your quotation by responding to this email.', { align: 'center' });
      doc.text('Contact us for any clarifications.', { align: 'center' });

      doc.end();
    });
  }
}

module.exports = PDFService;