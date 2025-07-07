const PDFDocument = require('pdfkit');
const sanitizeHtml = require('sanitize-html');

function generateSalesInvoicePDF(siDetails, parcels) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Fonts
      doc.registerFont('Regular', 'Helvetica');
      doc.registerFont('Bold', 'Helvetica-Bold');
      doc.registerFont('Italic', 'Helvetica-Oblique');

      // Colors
      const colors = {
        primary: '#003087', // Dark blue for headers and accents
        secondary: '#4CAF50', // Green for totals and highlights
        text: '#333333',    // Dark gray for text
        rowEven: '#F8F8F8', // Light gray for even rows
        rowOdd: '#FFFFFF',  // White for odd rows
        border: '#D3D3D3',  // Light gray for borders
        footer: '#003087',  // Dark blue for footer
      };

      // Sanitize data
      const sanitizedData = {
        series: sanitizeHtml(siDetails.Series || 'N/A'),
        postingDate: sanitizeHtml(siDetails.PostingDate || 'N/A'),
        requiredByDate: sanitizeHtml(siDetails.RequiredByDate || 'N/A'),
        deliveryDate: sanitizeHtml(siDetails.DeliveryDate || 'N/A'),
        customerName: sanitizeHtml(siDetails.CustomerName || 'N/A'),
        customerAddress: sanitizeHtml(
          [siDetails.CustomerName, siDetails.City, 'Botswana'].filter(Boolean).join(', ') || 'N/A'
        ),
        companyName: sanitizeHtml(siDetails.CompanyName || 'N/A'),
        companyAddress: sanitizeHtml(
          [siDetails.CompanyName, siDetails.City, 'Botswana'].filter(Boolean).join(', ') || 'N/A'
        ),
        terms: sanitizeHtml(siDetails.Terms || 'N/A'),
      };

      // Calculate totals
      const subtotal = parcels.reduce((sum, parcel) => sum + (parcel.Amount || 0), 0).toFixed(2);
      const taxAmount = siDetails.TotalTaxAmount ? parseFloat(siDetails.TotalTaxAmount).toFixed(2) : '0.00';
      const grandTotal = (parseFloat(subtotal) + parseFloat(taxAmount)).toFixed(2);

      console.log('Sanitized data for Sales Invoice PDF:', sanitizedData);
      console.log('Parcels:', parcels);
      console.log('Totals:', { subtotal, taxAmount, grandTotal });

      // Header: Logo and Title
      doc.fillColor(colors.primary)
        .font('Bold')
        .fontSize(26)
        .text('Fleet Monkey', 50, 30);
      doc.font('Regular')
        .fontSize(10)
        .text('Logistics & Supply Chain Solutions', 50, 55);
      doc.fillColor(colors.text)
        .font('Bold')
        .fontSize(20)
        .text('Sales Invoice', doc.page.width - 250, 30, { align: 'right' });
      doc.font('Regular')
        .fontSize(10)
        .text(`Invoice Number: ${sanitizedData.series}`, doc.page.width - 250, 55, { align: 'right' })
        .text(`Issue Date: ${new Date().toLocaleDateString()}`, doc.page.width - 250, 70, { align: 'right' });
      doc.lineWidth(2)
        .moveTo(50, 90)
        .lineTo(doc.page.width - 50, 90)
        .stroke(colors.primary);
      doc.moveDown(2);

      // Invoice Details
      doc.fillColor(colors.primary)
        .font('Bold')
        .fontSize(14)
        .text('Invoice Details', 50, doc.y);
      doc.fillColor(colors.text)
        .font('Regular')
        .fontSize(10)
        .text(`Series: ${sanitizedData.series}`, 50, doc.y + 10)
        .text(`Posting Date: ${sanitizedData.postingDate}`, 50, doc.y + 5)
        .text(`Required By Date: ${sanitizedData.requiredByDate}`, 50, doc.y + 5)
        .text(`Delivery Date: ${sanitizedData.deliveryDate}`, 50, doc.y + 5);
      doc.moveDown(2);

      // Customer and Company Info (Two Columns)
      const colWidth = (doc.page.width - 100) / 2;
      const infoY = doc.y;
      doc.fillColor(colors.primary)
        .font('Bold')
        .fontSize(12)
        .text('Billed To', 50, infoY);
      doc.fillColor(colors.text)
        .font('Regular')
        .fontSize(10)
        .text(sanitizedData.customerName, 50, infoY + 15)
        .text(sanitizedData.customerAddress, 50, doc.y + 5, { width: colWidth - 10 });
      doc.fillColor(colors.primary)
        .font('Bold')
        .fontSize(12)
        .text('From', 50 + colWidth, infoY);
      doc.fillColor(colors.text)
        .font('Regular')
        .fontSize(10)
        .text(sanitizedData.companyName, 50 + colWidth, infoY + 15)
        .text(sanitizedData.companyAddress, 50 + colWidth, doc.y + 5, { width: colWidth - 10 });
      doc.moveDown(1);
      doc.lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke(colors.border);
      doc.moveDown(2);

      // Items Table
      doc.fillColor(colors.primary)
        .font('Bold')
        .fontSize(14)
        .text('Itemized List', 50);
      doc.moveDown(0.5);

      // Table Setup
      const table = {
        x: 50,
        y: doc.y,
        colWidths: [40, 220, 60, 60, 60, 80],
        headers: ['#', 'Description', 'Qty', 'UOM', 'Rate', 'Amount'],
        rowHeight: 30,
        padding: 8,
      };

      // Table Header
      doc.fillColor(colors.text)
        .font('Bold')
        .fontSize(11);
      doc.rect(table.x, table.y, table.colWidths.reduce((a, b) => a + b, 0), table.rowHeight)
        .fill(colors.primary);
      let currentX = table.x;
      table.headers.forEach((header, i) => {
        doc.fillColor(colors.text)
          .text(header, currentX + table.padding, table.y + 8, {
            width: table.colWidths[i] - 2 * table.padding,
            align: i === 1 ? 'left' : 'right'
          });
        currentX += table.colWidths[i];
      });
      doc.lineWidth(1)
        .rect(table.x, table.y, table.colWidths.reduce((a, b) => a + b, 0), table.rowHeight)
        .stroke(colors.border);
      table.y += table.rowHeight;

      // Table Rows
      doc.font('Regular')
        .fontSize(10);
      parcels.forEach((parcel, index) => {
        const fillColor = index % 2 === 0 ? colors.rowEven : colors.rowOdd;
        doc.fillColor(fillColor)
          .rect(table.x, table.y, table.colWidths.reduce((a, b) => a + b, 0), table.rowHeight)
          .fill();
        currentX = table.x;
        [
          (index + 1).toString(),
          parcel.ItemName || 'N/A',
          parcel.ItemQuantity?.toString() || '0',
          parcel.UOMName || 'N/A',
          parcel.Rate ? parseFloat(parcel.Rate).toFixed(2) : '0.00',
          parcel.Amount ? parseFloat(parcel.Amount).toFixed(2) : '0.00'
        ].forEach((cell, i) => {
          doc.fillColor(colors.text)
            .text(cell, currentX + table.padding, table.y + 8, {
              width: table.colWidths[i] - 2 * table.padding,
              align: i === 1 ? 'left' : 'right'
            });
          currentX += table.colWidths[i];
        });
        doc.lineWidth(0.5)
          .rect(table.x, table.y, table.colWidths.reduce((a, b) => a + b, 0), table.rowHeight)
          .stroke(colors.border);
        table.y += table.rowHeight;
      });

      // Totals Section
      doc.moveDown(1);
      const totalsX = doc.page.width - 200;
      doc.fillColor(colors.primary)
        .font('Bold')
        .fontSize(12)
        .text('Summary', totalsX, doc.y, { align: 'right' });
      doc.fillColor(colors.text)
        .font('Regular')
        .fontSize(10)
        .text(`Subtotal: ${subtotal}`, totalsX, doc.y + 10, { align: 'right' })
        .text(`Tax Total: ${taxAmount}`, totalsX, doc.y + 5, { align: 'right' });
      doc.fillColor(colors.secondary)
        .font('Bold')
        .text(`Grand Total: ${grandTotal}`, totalsX, doc.y + 5, { align: 'right' });
      doc.moveDown(2);

      // Terms and Conditions
      doc.fillColor(colors.primary)
        .font('Bold')
        .fontSize(12)
        .text('Terms and Conditions', 50);
      doc.fillColor(colors.text)
        .font('Regular')
        .fontSize(10)
        .text(sanitizedData.terms, 50, doc.y + 10, { width: doc.page.width - 100, paragraphGap: 5 });
      doc.moveDown(1);
      doc.lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke(colors.border);
      doc.moveDown(2);

      // Footer
      const footerY = doc.page.height - 100;
      doc.lineWidth(2)
        .moveTo(50, footerY - 10)
        .lineTo(doc.page.width - 50, footerY - 10)
        .stroke(colors.footer);
      doc.fillColor(colors.text)
        .font('Italic')
        .fontSize(10)
        .text('Thank you for your business. Please remit payment by the due date as per the terms above.', 50, footerY, { align: 'center' });
      doc.font('Regular')
        .text('Fleet Monkey | Email: support@fleetmonkey.com | Phone: +267 1234 5678', 50, doc.y + 5, { align: 'center' })
        .text('Plot 123, Commerce Park, Gaborone, Botswana', 50, doc.y + 5, { align: 'center' });

      doc.end();
    } catch (error) {
      console.error(`Error generating Sales Invoice PDF: ${error.message}`);
      reject(new Error(`Error generating Sales Invoice PDF: ${error.message}`));
    }
  });
}

module.exports = { generateSalesInvoicePDF };