const puppeteer = require('puppeteer-core');
const fs = require('fs').promises;
const path = require('path');
const sanitizeHtml = require('sanitize-html');

// Set cache directory (use /tmp/puppeteer_cache on AWS, comment out local path)
process.env.PUPPETEER_CACHE_DIR = path.join(__dirname, 'puppeteer_cache'); // Local Windows
// process.env.PUPPETEER_CACHE_DIR = '/tmp/puppeteer_cache'; // Uncomment for AWS

// Helper function to generate HTML content
function generatePDFHtml(type, rfqDetails, parcels, supplierDetails, quotationDetails, quotationParcels) {
  // Determine document type (RFQ or Sales Quotation)
  const isRFQ = type === 'RFQ';
  const title = isRFQ ? 'Purchase RFQ' : 'Sales Quotation';
  const recipientLabel = isRFQ ? 'To Supplier' : 'To Customer';
  const recipientName = isRFQ ? supplierDetails.SupplierName : quotationDetails.CustomerName;
  const recipientAddress = isRFQ
    ? `${supplierDetails.AddressTitle || ''}\n${supplierDetails.City || ''}\nBotswana`
    : `${quotationDetails.CustomerName || ''}\n${quotationDetails.City || ''}\nBotswana`;
  const seriesLabel = isRFQ ? 'Purchase RFQ Series' : 'Sales Quotation Series';
  const seriesValue = isRFQ ? rfqDetails.Series : quotationDetails.Series;
  const footerText = isRFQ
    ? 'Please review and submit your quotation at your earliest convenience.'
    : 'Please review and confirm acceptance of this sales quotation.';

  // Merge parcels for RFQ (if applicable)
  const mergedParcels = isRFQ
    ? parcels.map(p => {
        const matchingQuotation = quotationParcels.find(qp => qp.ItemID === p.ItemID);
        return {
          ...p,
          Rate: matchingQuotation ? matchingQuotation.Rate : '',
          Amount: matchingQuotation ? matchingQuotation.Amount : '',
          CountryOfOrigin: matchingQuotation ? matchingQuotation.CountryOfOriginID : '',
        };
      })
    : parcels;

  // Sanitize inputs to prevent XSS
  const sanitizedData = {
    series: sanitizeHtml(seriesValue || 'N/A'),
    requiredByDate: sanitizeHtml((isRFQ ? rfqDetails.RequiredByDate : quotationDetails.RequiredByDate) || 'N/A'),
    companyName: sanitizeHtml((isRFQ ? rfqDetails.CompanyName : quotationDetails.CompanyName) || 'N/A'),
    recipientName: sanitizeHtml(recipientName || 'N/A'),
    recipientAddress: sanitizeHtml(recipientAddress),
    companyAddress: sanitizeHtml(`${(isRFQ ? rfqDetails.CompanyName : quotationDetails.CompanyName) || ''}\n${(isRFQ ? rfqDetails.City : quotationDetails.City) || ''}\nBotswana`),
    terms: sanitizeHtml((isRFQ ? rfqDetails.Terms : quotationDetails.Terms) || 'N/A'),
  };

  // HTML template with enhanced CSS
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .section div { display: inline-block; width: 45%; vertical-align: top; }
        .section div:last-child { text-align: right; }
        .address-section { display: flex; justify-content: space-between; }
        .address-section div { width: 45%; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .footer { margin-top: 20px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <p>Date: ${new Date().toLocaleDateString()}</p>
      </div>
      <div class="section">
        <div>
          <strong>${seriesLabel}:</strong> ${sanitizedData.series}
        </div>
        <div>
          <strong>${recipientLabel}:</strong> ${sanitizedData.recipientName}
        </div>
      </div>
      <div class="section">
        <div>
          <strong>Required By Date:</strong> ${sanitizedData.requiredByDate}
        </div>
        <div>
          <strong>From Company:</strong> ${sanitizedData.companyName}
        </div>
      </div>
      <div class="address-section">
        <div>
          <strong>${recipientLabel} Address:</strong><br>${sanitizedData.recipientAddress}
        </div>
        <div>
          <strong>Company Address:</strong><br>${sanitizedData.companyAddress}
        </div>
      </div>
      <div class="section">
        <strong>Terms:</strong><br>${sanitizedData.terms}
      </div>
      <div class="section">
        <h3>Items</h3>
        <table>
          <tr>
            <th>Item Name</th>
            <th>Quantity</th>
            <th>UOM</th>
            ${isRFQ ? '<th>Country of Origin</th>' : ''}
            <th>Rate</th>
            <th>Amount</th>
          </tr>
          ${mergedParcels
            .map(
              parcel => `
                <tr>
                  <td>${sanitizeHtml(parcel.ItemName || 'N/A')}</td>
                  <td>${sanitizeHtml(parcel.ItemQuantity?.toString() || 'N/A')}</td>
                  <td>${sanitizeHtml(parcel.UOMName || 'N/A')}</td>
                  ${isRFQ ? `<td>${sanitizeHtml(parcel.CountryOfOrigin || '')}</td>` : ''}
                  <td>${sanitizeHtml(parcel.Rate?.toString() || 'N/A')}</td>
                  <td>${sanitizeHtml(parcel.Amount?.toString() || 'N/A')}</td>
                </tr>
              `
            )
            .join('')}
        </table>
      </div>
      <div class="footer">
        <p>${footerText}</p>
        <p>Contact: Fleet Monkey Team | Email: support@fleetmonkey.com</p>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
}

async function generateRFQPDF(rfqDetails, parcels, supplierDetails, quotationDetails, quotationParcels, outputPath) {
  try {
    // Ensure the output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Generate HTML content for RFQ
    const htmlContent = generatePDFHtml('RFQ', rfqDetails, parcels, supplierDetails, quotationDetails, quotationParcels);

    // Launch Puppeteer
    console.log('Starting Puppeteer with Chromium at C:\\chrome-win\\chrome.exe (local) or /usr/bin/chromium-browser (AWS)');
    const browser = await puppeteer.launch({
      executablePath: process.platform === 'win32' ? 'C:\\chrome-win\\chrome.exe' : '/usr/bin/chromium-browser', // Local Windows or AWS
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    console.log('Puppeteer started');

    const page = await browser.newPage();

    // Set HTML content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: { top: '40px', right: '40px', bottom: '40px', left: '40px' },
      printBackground: true,
    });

    // Close browser
    await browser.close();

    console.log(`RFQ PDF created at: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error creating RFQ PDF: ${error.message}`);
    throw new Error(`Failed to generate RFQ PDF: ${error.message}`);
  }
}

async function generateSalesQuotationPDF(quotationDetails, parcels, outputPath) {
  try {
    // Ensure the output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Generate HTML content for Sales Quotation
    const htmlContent = generatePDFHtml('SalesQuotation', null, parcels, null, quotationDetails, []);

    // Launch Puppeteer
    console.log('Starting Puppeteer with Chromium at C:\\chrome-win\\chrome.exe (local) or /usr/bin/chromium-browser (AWS)');
    const browser = await puppeteer.launch({
      executablePath: process.platform === 'win32' ? 'C:\\chrome-win\\chrome.exe' : '/usr/bin/chromium-browser', // Local Windows or AWS
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    console.log('Puppeteer started');

    const page = await browser.newPage();

    // Set HTML content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: { top: '40px', right: '40px', bottom: '40px', left: '40px' },
      printBackground: true,
    });

    // Close browser
    await browser.close();

    console.log(`Sales Quotation PDF created at: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error creating Sales Quotation PDF: ${error.message}`);
    throw new Error(`Failed to generate Sales Quotation PDF: ${error.message}`);
  }
}

module.exports = { generateRFQPDF, generateSalesQuotationPDF };