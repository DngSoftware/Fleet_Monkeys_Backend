const puppeteer = require('puppeteer-core');
const fs = require('fs').promises;
const path = require('path');
const sanitizeHtml = require('sanitize-html');

// Set cache directory (use /tmp/puppeteer_cache on AWS, comment out local path)
process.env.PUPPETEER_CACHE_DIR = path.join(__dirname, 'puppeteer_cache'); // Local Windows
// process.env.PUPPETEER_CACHE_DIR = '/tmp/puppeteer_cache'; // Uncomment for AWS

// Helper function to generate HTML content for Purchase Order
function generatePOHtml(poDetails, parcels) {
  // Sanitize inputs to prevent XSS
  const sanitizedData = {
    series: sanitizeHtml(poDetails.Series || 'N/A'),
    requiredByDate: sanitizeHtml(poDetails.RequiredByDate || 'N/A'),
    companyName: sanitizeHtml(poDetails.CompanyName || 'N/A'),
    supplierName: sanitizeHtml(poDetails.SupplierName || 'N/A'),
    supplierAddress: sanitizeHtml(`${poDetails.SupplierName || ''}\n${poDetails.City || ''}\nBotswana`),
    companyAddress: sanitizeHtml(`${poDetails.CompanyName || ''}\n${poDetails.City || ''}\nBotswana`),
    terms: sanitizeHtml(poDetails.Terms || 'N/A'),
  };

  // HTML template with enhanced CSS matching pdfGenerator1.js
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
        <h1>Purchase Order</h1>
        <p>Date: ${new Date().toLocaleDateString()}</p>
      </div>
      <div class="section">
        <div>
          <strong>Purchase Order Series:</strong> ${sanitizedData.series}
        </div>
        <div>
          <strong>To Supplier:</strong> ${sanitizedData.supplierName}
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
          <strong>Supplier Address:</strong><br>${sanitizedData.supplierAddress}
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
            <th>Rate</th>
            <th>Amount</th>
          </tr>
          ${parcels
            .map(
              parcel => `
                <tr>
                  <td>${sanitizeHtml(parcel.ItemName || 'N/A')}</td>
                  <td>${sanitizeHtml(parcel.ItemQuantity?.toString() || 'N/A')}</td>
                  <td>${sanitizeHtml(parcel.UOMName || 'N/A')}</td>
                  <td>${sanitizeHtml(parcel.Rate?.toString() || 'N/A')}</td>
                  <td>${sanitizeHtml(parcel.Amount?.toString() || 'N/A')}</td>
                </tr>
              `
            )
            .join('')}
        </table>
      </div>
      <div class="footer">
        <p>Please review and confirm receipt of this purchase order.</p>
        <p>Contact: Fleet Monkey Team | Email: support@fleetmonkey.com</p>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
}

async function generatePurchaseOrderPDF(poDetails, parcels, outputPath) {
  try {
    // Ensure the output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Generate HTML content for Purchase Order
    const htmlContent = generatePOHtml(poDetails, parcels);

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

    console.log(`Purchase Order PDF created at: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error creating Purchase Order PDF: ${error.message}`);
    throw new Error(`Failed to generate Purchase Order PDF: ${error.message}`);
  }
}

module.exports = { generatePurchaseOrderPDF };