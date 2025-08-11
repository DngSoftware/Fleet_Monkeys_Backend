const PDFDocument = require('pdfkit');
const sanitizeHtml = require('sanitize-html');

function generateSalesRFQPDF(salesRFQData, parcels) {
  return new Promise((resolve, reject) => {
    try {
      console.log('Generating PDF with data:', { salesRFQData, parcels }); // Debug log
      const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (error) => reject(new Error(`PDF generation error: ${error.message}`)));

      // Register fonts
      doc.registerFont('Regular', 'Helvetica');
      doc.registerFont('Bold', 'Helvetica-Bold');
      doc.registerFont('Italic', 'Helvetica-Oblique');

      // Colors (corporate palette)
      const colors = {
        primary: '#1E3A8A',    // Deep blue
        secondary: '#9333EA',  // Purple accent
        text: '#1F2937',       // Dark gray
        light: '#F9FAFB',      // Off-white background
        border: '#D1D5DB',     // Light gray border
        highlight: '#F3E8FF',  // Light purple highlight
      };

      // Sanitize data
      const sanitizedData = {
        series: sanitizeHtml(salesRFQData.Series || 'N/A'),
        deliveryDate: sanitizeHtml(salesRFQData.DeliveryDate || 'N/A'),
        customerName: sanitizeHtml(salesRFQData.CustomerName || 'N/A'),
        companyName: sanitizeHtml(salesRFQData.CompanyName || 'N/A'),
        terms: sanitizeHtml(salesRFQData.Terms || 'N/A'),
        customerEmail: sanitizeHtml(salesRFQData.CustomerEmail || 'N/A'),
        customerAddress: sanitizeHtml(salesRFQData.CustomerAddress || 'N/A'),
      };

      // Debug: Test if PDF renders anything
      doc.fillColor(colors.text).font('Regular').fontSize(12).text('TEST: PDF is rendering', 50, 50);

      // Header with Branding
      doc.fillColor(colors.primary).font('Bold').fontSize(24).text('Fleet Monkey', 50, 80);
      // Logo placeholder (replace with actual path if available)
      // doc.image('path/to/logo.png', 50, 20, { width: 80 });
      doc.fillColor(colors.secondary).font('Italic').fontSize(12).text('Sales RFQ Inquiry', 50, 110, { align: 'center' });
      doc.font('Regular').fontSize(8).text(`Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, 480, 90, { align: 'right' });
      doc.rect(50, 130, 500, 2).fill(colors.primary).opacity(0.9);
      doc.moveDown(2);

      // Two-Column Layout
      const columnWidth = 240;
      let leftY = doc.y, rightY = doc.y;

      // RFQ Details (Left Column)
      doc.fillColor(colors.primary).font('Bold').fontSize(14).text('RFQ Details', 50, leftY);
      doc.font('Regular').fontSize(10)
         .text(`Series: ${sanitizedData.series}`, 70, leftY + 20)
         .text(`Customer: ${sanitizedData.customerName}`, 70, leftY + 35)
         .text(`Delivery Date: ${sanitizedData.deliveryDate}`, 70, leftY + 50);
      // doc.roundedRect(50, leftY + 15, columnWidth - 10, 60, 4).fill(colors.light).stroke(colors.border);
      leftY += 90;

      // Company Information (Right Column)
      doc.fillColor(colors.primary).font('Bold').fontSize(14).text('From Company', 310, rightY);
      doc.font('Regular').fontSize(10).text(sanitizedData.companyName, 330, rightY + 20, { width: columnWidth - 40 });
      // doc.roundedRect(310, rightY + 15, columnWidth - 10, 40, 4).fill(colors.light).stroke(colors.border);
      rightY += 70;

      // Customer Information (Left Column)
      doc.fillColor(colors.primary).font('Bold').fontSize(14).text('Customer Information', 50, leftY);
      doc.font('Regular').fontSize(10)
         .text(`Name: ${sanitizedData.customerName}`, 70, leftY + 20)
         .text(`Email: ${sanitizedData.customerEmail}`, 70, leftY + 35)
         .text(`Address: ${sanitizedData.customerAddress}`, 70, leftY + 50, { width: columnWidth - 40, paragraphGap: 5 });
      // doc.roundedRect(50, leftY + 15, columnWidth - 10, 80, 4).fill(colors.light).stroke(colors.border);
      leftY += 110;

      // Terms (Right Column)
      doc.fillColor(colors.primary).font('Bold').fontSize(14).text('Terms', 310, rightY);
      doc.font('Regular').fontSize(10).text(sanitizedData.terms, 330, rightY + 20, { width: columnWidth - 40, paragraphGap: 5 });
      // doc.roundedRect(310, rightY + 15, columnWidth - 10, 60, 4).fill(colors.light).stroke(colors.border);
      rightY += 90;

      // Items Table (Full Width)
      const tableY = Math.max(leftY, rightY) + 10;
      doc.fillColor(colors.primary).font('Bold').fontSize(14).text('Items', 50, tableY);
      doc.moveDown(0.5);

      const table = {
        x: 50,
        y: tableY + 20,
        colWidths: [300, 80, 80, 80], // Item Name, Quantity, UOM, Total
        headers: ['Item Name', 'Quantity', 'UOM', 'Total'],
        rowHeight: 30,
        padding: 8,
      };

      // Draw Table Header
      doc.fillColor('#FFFFFF').font('Bold').fontSize(10);
      doc.rect(table.x, table.y, table.colWidths.reduce((a, b) => a + b, 0), table.rowHeight).fill(colors.primary);
      let currentX = table.x;
      table.headers.forEach((header, i) => {
        doc.fillColor('#FFFFFF')
           .text(header, currentX + table.padding, table.y + (table.rowHeight - 10) / 2, {
               width: table.colWidths[i] - 2 * table.padding,
               align: i > 0 ? 'right' : 'left'
           });
        currentX += table.colWidths[i];
      });
      doc.lineWidth(1).rect(table.x, table.y, table.colWidths.reduce((a, b) => a + b, 0), table.rowHeight).stroke(colors.border);
      table.y += table.rowHeight;

      // Draw Table Rows
      doc.font('Regular').fontSize(10);
      let totalAmount = 0;
      if (parcels && parcels.length > 0) {
        parcels.forEach((parcel, index) => {
          const quantity = parseFloat(parcel.ItemQuantity) || 0;
          const unitPrice = 10; // Placeholder, replace with actual price if available
          const rowTotal = quantity * unitPrice;
          totalAmount += rowTotal;

          const fillColor = index % 2 === 0 ? colors.highlight : colors.light;
          doc.fillColor(fillColor).rect(table.x, table.y, table.colWidths.reduce((a, b) => a + b, 0), table.rowHeight).fill();
          currentX = table.x;
          [
            sanitizeHtml(parcel.ItemName || 'N/A'),
            sanitizeHtml(quantity.toString()),
            sanitizeHtml(parcel.UOM || 'N/A'),
            `$${rowTotal.toFixed(2)}`
          ].forEach((cell, i) => {
            doc.fillColor(colors.text)
               .text(cell, currentX + table.padding, table.y + (table.rowHeight - 10) / 2, {
                   width: table.colWidths[i] - 2 * table.padding,
                   align: i > 2 ? 'right' : (i > 0 ? 'right' : 'left')
               });
            currentX += table.colWidths[i];
          });
          doc.lineWidth(0.5).rect(table.x, table.y, table.colWidths.reduce((a, b) => a + b, 0), table.rowHeight).stroke(colors.border);
          table.y += table.rowHeight;
        });

        // Total Row
        doc.fillColor(colors.secondary).rect(table.x, table.y, table.colWidths.reduce((a, b) => a + b, 0), table.rowHeight).fill();
        currentX = table.x;
        ['Total', '', '', `$${totalAmount.toFixed(2)}`].forEach((cell, i) => {
          doc.fillColor('#FFFFFF')
             .text(cell, currentX + table.padding, table.y + (table.rowHeight - 10) / 2, {
                 width: table.colWidths[i] - 2 * table.padding,
                 align: i > 2 ? 'right' : 'left'
             });
          currentX += table.colWidths[i];
        });
        doc.lineWidth(1).rect(table.x, table.y, table.colWidths.reduce((a, b) => a + b, 0), table.rowHeight).stroke(colors.border);
        table.y += table.rowHeight;
      } else {
        doc.fillColor(colors.text).font('Italic').text('No items available.', table.x, table.y + 10);
        table.y += 20;
      }

      // Footer
      const footerY = doc.page.height - 80;
      doc.fillColor(colors.primary).rect(50, footerY - 10, 500, 2).fill();
      doc.fillColor(colors.text)
         .font('Italic')
         .fontSize(9)
         .text('Thank you for your inquiry. For questions, contact us at support@fleetmonkey.com or +1-800-555-1234.', 50, footerY, { align: 'center', width: 500 });
      doc.font('Regular').fontSize(8)
         .text('Follow us: 🅵 🐦 💼 | Fleet Monkey © 2025', 50, footerY + 20, { align: 'center' });

      doc.end();
    } catch (error) {
      console.error(`Error generating SalesRFQ PDF: ${error.message}`);
      reject(new Error(`Error generating SalesRFQ PDF: ${error.message}`));
    }
  });
}

module.exports = { generateSalesRFQPDF };