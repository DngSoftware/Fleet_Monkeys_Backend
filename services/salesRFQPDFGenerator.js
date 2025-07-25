const PDFDocument = require('pdfkit');
const sanitizeHtml = require('sanitize-html');

function generateSalesRFQPDF(salesRFQData, parcels) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Fonts
      doc.registerFont('Regular', 'Helvetica');
      doc.registerFont('Bold', 'Helvetica-Bold');

      // Colors
      const colors = {
        header: '#003087',
        text: '#000000',
        rowEven: '#F5F5F5',
        rowOdd: '#FFFFFF',
        border: '#000000',
        footer: '#003087',
      };

      // Sanitize data
      const sanitizedData = {
        series: sanitizeHtml(salesRFQData.Series || 'N/A'),
        deliveryDate: sanitizeHtml(salesRFQData.DeliveryDate || 'N/A'),
        customerId: sanitizeHtml(salesRFQData.CustomerID?.toString() || 'N/A'),
        companyName: sanitizeHtml(salesRFQData.CompanyName || 'N/A'),
        companyAddress: sanitizeHtml(
          [salesRFQData.CompanyName, salesRFQData.City, 'Botswana'].filter(Boolean).join(', ') || 'N/A'
        ),
        terms: sanitizeHtml(salesRFQData.Terms || 'N/A'),
      };

      console.log('Sanitized data for PDF:', sanitizedData);
      console.log('Parcels:', parcels);

      // Header: Title and Date
      doc.fillColor(colors.header).font('Bold').fontSize(24).text('Fleet Monkey', 40, 30);
      doc.fillColor(colors.text).fontSize(18).text('Sales RFQ Inquiry', 40, 60, { align: 'center' });
      doc.font('Regular').fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`, 40, 80, { align: 'right' });
      doc.rect(40, 90, doc.page.width - 80, 2).fill(colors.header);
      doc.moveDown(1.5);

      // RFQ Details
      doc.fillColor(colors.text).font('Bold').fontSize(12).text('RFQ Details', 40);
      doc.font('Regular').fontSize(10)
         .text(`Series: ${sanitizedData.series}`, 40)
         .text(`Customer ID: ${sanitizedData.customerId}`)
         .text(`Delivery Date: ${sanitizedData.deliveryDate}`);
      doc.moveDown(1);

      // Company Info
      doc.font('Bold').fontSize(12).text('From Company', 40);
      doc.font('Regular').fontSize(10).text(sanitizedData.companyName, 40, doc.y);
      doc.text(sanitizedData.companyAddress, 40, doc.y, { width: doc.page.width - 80 - 10 });
      doc.moveDown(1);
      doc.rect(40, doc.y, doc.page.width - 80, 1).fill(colors.header);
      doc.moveDown(1);

      // Terms
      doc.font('Bold').fontSize(12).text('Terms');
      doc.font('Regular').fontSize(10).text(sanitizedData.terms, 40, doc.y, { paragraphGap: 5 });
      doc.moveDown(1);
      doc.rect(40, doc.y, doc.page.width - 80, 1).fill(colors.header);
      doc.moveDown(1);

      // Items Table
      doc.font('Bold').fontSize(12).text('Items');
      doc.moveDown(0.5);

      // Table Setup
      const table = {
        x: 40,
        y: doc.y,
        colWidths: [140, 60, 60],
        headers: ['Item ID', 'Quantity', 'UOM'],
        rowHeight: 25,
        padding: 8,
      };

      // Draw Table Header
      doc.fillColor(colors.text).font('Bold').fontSize(10);
      doc.rect(table.x, table.y - 5, table.colWidths.reduce((a, b) => a + b, 0), table.rowHeight).fill(colors.header);
      let currentX = table.x;
      table.headers.forEach((header, i) => {
        doc.fillColor(colors.text)
           .text(header, currentX + table.padding, table.y, {
               width: table.colWidths[i] - 2 * table.padding,
               align: i > 0 ? 'right' : 'left'
           });
        currentX += table.colWidths[i];
      });
      doc.lineWidth(1).rect(table.x, table.y - 5, table.colWidths.reduce((a, b) => a + b, 0), table.rowHeight).stroke(colors.border);
      table.y += table.rowHeight;

      // Draw Table Rows
      doc.font('Regular').fontSize(10);
      parcels.forEach((parcel, index) => {
        const fillColor = index % 2 === 0 ? colors.rowEven : colors.rowOdd;
        doc.fillColor(fillColor).rect(table.x, table.y - 5, table.colWidths.reduce((a, b) => a + b, 0), table.rowHeight).fill();
        currentX = table.x;
        [
          sanitizeHtml(parcel.ItemID?.toString() || 'N/A'),
          sanitizeHtml(parcel.ItemQuantity?.toString() || 'N/A'),
          sanitizeHtml(parcel.UOMID?.toString() || 'N/A')
        ].forEach((cell, i) => {
          doc.fillColor(colors.text)
             .text(cell, currentX + table.padding, table.y, {
                 width: table.colWidths[i] - 2 * table.padding,
                 align: i > 0 ? 'right' : 'left'
             });
          currentX += table.colWidths[i];
        });
        doc.lineWidth(0.5).rect(table.x, table.y - 5, table.colWidths.reduce((a, b) => a + b, 0), table.rowHeight).stroke(colors.border);
        table.y += table.rowHeight;
      });

      // Footer
      const footerY = doc.page.height - 80;
      doc.rect(40, footerY - 10, doc.page.width - 80, 2).fill(colors.footer);
      doc.fillColor(colors.text)
         .font('Regular')
         .fontSize(10)
         .text('Thank you for your inquiry. Details will be reviewed shortly.', 40, footerY, { align: 'center' });
      doc.text('Contact: Fleet Monkey Team | Email: support@fleetmonkey.com', 40, doc.y, { align: 'center' });

      doc.end();
    } catch (error) {
      console.error(`Error generating SalesRFQ PDF: ${error.message}`);
      reject(new Error(`Error generating SalesRFQ PDF: ${error.message}`));
    }
  });
}

module.exports = { generateSalesRFQPDF };