const PDFDocument = require('pdfkit');
const sanitizeHtml = require('sanitize-html');

function generatePurchaseOrderPDF(poDetails, parcels) {
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
                series: sanitizeHtml(poDetails.Series || 'N/A'),
                requiredByDate: sanitizeHtml(poDetails.RequiredByDate || 'N/A'),
                companyName: sanitizeHtml(poDetails.CompanyName || 'N/A'),
                supplierName: sanitizeHtml(poDetails.SupplierName || 'N/A'),
                supplierAddress: sanitizeHtml(
                    [poDetails.SupplierName, poDetails.City, 'Botswana'].filter(Boolean).join(', ') || 'N/A'
                ),
                companyAddress: sanitizeHtml(
                    [poDetails.CompanyName, poDetails.City, 'Botswana'].filter(Boolean).join(', ') || 'N/A'
                ),
                terms: sanitizeHtml(poDetails.Terms || 'N/A'),
            };

            console.log('Sanitized data for Purchase Order PDF:', sanitizedData);
            console.log('Parcels:', parcels);

            // Header: Logo (simulated) and Title
            doc.fillColor(colors.header).font('Bold').fontSize(24).text('Fleet Monkey', 40, 30);
            doc.fillColor(colors.text).fontSize(18).text('Purchase Order', 40, 60, { align: 'center' });
            doc.font('Regular').fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`, 40, 80, { align: 'right' });
            doc.rect(40, 90, doc.page.width - 80, 2).fill(colors.header);
            doc.moveDown(1.5);

            // Purchase Order Details
            doc.fillColor(colors.text).font('Bold').fontSize(12).text('Purchase Order Details', 40);
            doc.font('Regular').fontSize(10)
               .text(`Purchase Order Series: ${sanitizedData.series}`, 40)
               .text(`Required By Date: ${sanitizedData.requiredByDate}`);
            doc.moveDown(1);

            // Supplier and Company Info (Two Columns)
            const colWidth = (doc.page.width - 80) / 2;
            const startY = doc.y;
            doc.font('Bold').fontSize(12).text('To Supplier', 40, startY);
            doc.font('Regular').fontSize(10).text(sanitizedData.supplierName, 40, doc.y);
            doc.text(sanitizedData.supplierAddress, 40, doc.y, { width: colWidth - 10 });
            doc.font('Bold').fontSize(12).text('From Company', 40 + colWidth, startY);
            doc.font('Regular').fontSize(10).text(sanitizedData.companyName, 40 + colWidth, doc.y);
            doc.text(sanitizedData.companyAddress, 40 + colWidth, doc.y, { width: colWidth - 10 });
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
                colWidths: [200, 60, 60, 60, 60],
                headers: ['Item Name', 'Quantity', 'UOM', 'Rate', 'Amount'],
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
                [parcel.ItemName, parcel.ItemQuantity?.toString(), parcel.UOMName, parcel.Rate?.toString(), parcel.Amount?.toString()].forEach((cell, i) => {
                    doc.fillColor(colors.text)
                       .text(cell || 'N/A', currentX + table.padding, table.y, {
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
               .text('Please review and confirm receipt of this purchase order.', 40, footerY, { align: 'center' });
            doc.text('Contact: Fleet Monkey Team | Email: support@fleetmonkey.com', 40, doc.y, { align: 'center' });

            doc.end();
        } catch (error) {
            console.error(`Error generating Purchase Order PDF: ${error.message}`);
            reject(new Error(`Error generating Purchase Order PDF: ${error.message}`));
        }
    });
}

module.exports = { generatePurchaseOrderPDF };