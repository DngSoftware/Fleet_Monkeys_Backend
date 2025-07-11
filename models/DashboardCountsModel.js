const poolPromise = require('../config/db.config');

class DashboardCountsModel {
    static async getDashboardCounts() {
        try {
            const pool = await poolPromise;
            const queries = [
                'SELECT COUNT(*) AS salesRFQCount FROM dbo_tblsalesrfq WHERE IsDeleted = 0',
                'SELECT COUNT(*) AS purchaseRFQCount FROM dbo_tblpurchaserfq WHERE IsDeleted = 0',
                'SELECT COUNT(*) AS supplierQuotationCount FROM dbo_tblsupplierquotation WHERE IsDeleted = 0',
                'SELECT COUNT(*) AS salesQuotationCount FROM dbo_tblsalesquotation WHERE IsDeleted = 0',
                'SELECT COUNT(*) AS salesOrderCount FROM dbo_tblsalesorder WHERE IsDeleted = 0',
                'SELECT COUNT(*) AS purchaseOrderCount FROM dbo_tblpo WHERE IsDeleted = 0',
                'SELECT COUNT(*) AS purchaseInvoiceCount FROM dbo_tblpinvoice WHERE IsDeleted = 0',
                'SELECT COUNT(*) AS salesInvoiceCount FROM dbo_tblsalesinvoice WHERE IsDeleted = 0'
            ];

            // Execute all queries in parallel
            const results = await Promise.all(queries.map(query => pool.query(query)));

            // Extract counts from results
            const counts = {
                salesRFQ: results[0][0][0].salesRFQCount,
                purchaseRFQ: results[1][0][0].purchaseRFQCount,
                supplierQuotation: results[2][0][0].supplierQuotationCount,
                salesQuotation: results[3][0][0].salesQuotationCount,
                salesOrder: results[4][0][0].salesOrderCount,
                purchaseOrder: results[5][0][0].purchaseOrderCount,
                purchaseInvoice: results[6][0][0].purchaseInvoiceCount,
                salesInvoice: results[7][0][0].salesInvoiceCount
            };

            return {
                success: true,
                data: counts,
                message: 'Dashboard counts retrieved successfully'
            };
        } catch (err) {
            throw new Error(`Database error: ${err.message}`);
        }
    }
}

module.exports = DashboardCountsModel;