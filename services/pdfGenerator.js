const PDFDocument = require('pdfkit');
const sanitizeHtml = require('sanitize-html');

function generateRFQPDF(rfqDetails, parcels, supplierDetails, quotationDetails, quotationParcels) {
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
                series: sanitizeHtml(rfqDetails.Series || 'N/A'),
                requiredByDate: sanitizeHtml(rfqDetails.RequiredByDate || 'N/A'),
                supplierQuoteSeries: sanitizeHtml(quotationDetails?.Series || 'N/A'),
                companyName: sanitizeHtml(rfqDetails.CompanyName || 'N/A'),
                supplierName: sanitizeHtml(supplierDetails?.SupplierName || 'N/A'),
                supplierAddress: sanitizeHtml(
                    [supplierDetails.AddressTitle, supplierDetails.City, 'Botswana'].filter(Boolean).join(', ') || 'N/A'
                ),
                companyAddress: sanitizeHtml(
                    [rfqDetails.CompanyName, rfqDetails.City, 'Botswana'].filter(Boolean).join(', ') || 'N/A'
                ),
                terms: sanitizeHtml(rfqDetails.Terms || 'N/A'),
            };

            console.log('Sanitized data for PDF:', sanitizedData);
            console.log('Parcels:', parcels);
            console.log('Quotation Parcels:', quotationParcels);

            // Header: Logo (simulated) and Title
            doc.fillColor(colors.header).font('Bold').fontSize(24).text('Fleet Monkey', 40, 30);
            doc.fillColor(colors.text).fontSize(18).text('Purchase RFQ', 40, 60, { align: 'center' });
            doc.font('Regular').fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`, 40, 80, { align: 'right' });
            doc.rect(40, 90, doc.page.width - 80, 2).fill(colors.header);
            doc.moveDown(1.5);

            // RFQ Details
            doc.fillColor(colors.text).font('Bold').fontSize(12).text('RFQ Details', 40);
            doc.font('Regular').fontSize(10)
               .text(`Purchase RFQ Series: ${sanitizedData.series}`, 40)
               .text(`Supplier Quote Series: ${sanitizedData.supplierQuoteSeries}`)
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
                colWidths: [140, 60, 60, 90, 60, 60],
                headers: ['Item Name', 'Quantity', 'UOM', 'Country of Origin', 'Rate', 'Amount'],
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

            // Merge Parcels
            const mergedParcels = parcels.map(p => {
                const matchingQuotation = quotationParcels.find(qp => qp.ItemID === p.ItemID);
                const parcelData = {
                    ItemName: sanitizeHtml(p.ItemName || 'N/A'),
                    ItemQuantity: sanitizeHtml(p.ItemQuantity?.toString() || 'N/A'),
                    UOMName: sanitizeHtml(p.UOMName || 'N/A'),
                    CountryOfOrigin: sanitizeHtml(matchingQuotation?.CountryOfOriginID || 'N/A'),
                    Rate: sanitizeHtml(matchingQuotation?.Rate?.toString() || 'N/A'),
                    Amount: sanitizeHtml(matchingQuotation?.Amount?.toString() || 'N/A'),
                };
                console.log('Rendering parcel:', parcelData);
                return parcelData;
            });

            // Draw Table Rows
            doc.font('Regular').fontSize(10);
            mergedParcels.forEach((parcel, index) => {
                const fillColor = index % 2 === 0 ? colors.rowEven : colors.rowOdd;
                doc.fillColor(fillColor).rect(table.x, table.y - 5, table.colWidths.reduce((a, b) => a + b, 0), table.rowHeight).fill();
                currentX = table.x;
                [parcel.ItemName, parcel.ItemQuantity, parcel.UOMName, parcel.CountryOfOrigin, parcel.Rate, parcel.Amount].forEach((cell, i) => {
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
               .text('Please review and submit your quotation at your earliest convenience.', 40, footerY, { align: 'center' });
            doc.text('Contact: Fleet Monkey Team | Email: support@fleetmonkey.com', 40, doc.y, { align: 'center' });

            doc.end();
        } catch (error) {
            console.error(`Error generating PDF: ${error.message}`);
            reject(new Error(`Error generating PDF: ${error.message}`));
        }
    });
}

module.exports = { generateRFQPDF };