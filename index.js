require('dotenv').config();
const express = require('express');
const cors = require('cors');
const poolPromise = require('./config/db.config');
const salesRFQRoutes = require('./routes/salesRFQRoutes');
const customerRoutes = require('./routes/customerRoutes');
const companyRoutes = require('./routes/companyRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const serviceTypeRoutes = require('./routes/serviceTypeRoutes');
const salesRFQParcelRoutes = require('./routes/salesRFQParcelRoutes');
const addressRoutes = require('./routes/addressRoutes');
const mailingPriorityRoutes = require('./routes/mailingPriorityRoutes');
const currencyRoutes = require('./routes/currencyRoutes');
const salesRFQApprovalRoutes = require('./routes/salesRFQApprovalRoutes');
const personRoutes = require('./routes/personRoutes');
const personTypeRoutes = require('./routes/personTypeRoutes');
const purchaseRFQRoutes = require('./routes/purchaseRFQRoutes');
const itemRoutes = require('./routes/itemRoutes');
const uomRoutes = require('./routes/uomRoutes');
const authRoutes = require('./routes/authRoutes');
const cityRoutes = require('./routes/cityRoutes');
const countryOfOriginRoutes = require('./routes/countryOfOriginRoutes');
const addressTypeRoutes = require('./routes/addressTypeRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bankAccountRoutes = require('./routes/bankAccountRoutes');
const certificationRoutes = require('./routes/certificationRoutes');
const RolesRoutes = require('./routes/roleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const rolePermissionRoutes = require('./routes/rolePermissionRoutes');
const purchaseRFQParcelRoutes = require('./routes/purchaseRFQParcelRoutes');
const purchaseRFQApprovalRoutes = require('./routes/purchaseRFQApprovalRoutes');
const subscriptionPlanRoutes = require('./routes/subscriptionPlanRoutes');
const supplierQuotationRoutes = require('./routes/supplierQuotationRoutes');
const formRoleRoutes = require('./routes/formRoleRoutes');
const formRoleApproverRoutes = require('./routes/formRoleApproverRoutes');
const supplierQuotationParcelRoutes = require('./routes/supplierQuotationParcelRoutes');
const supplierQuotationApprovalRoutes = require('./routes/supplierQuotationApprovalRoutes');
const salesQuotationRoutes = require('./routes/salesQuotationRoutes');
const salesQuotationParcelRoutes = require('./routes/salesQuotationParcelRoutes');
const salesQuotationApprovalRoutes = require('./routes/salesQuotationApprovalRoutes');
const sentPurchaseRFQToSuppliersRoutes = require('./routes/sentPurchaseRFQToSuppliersRoutes');
const formRoutes = require('./routes/formRoutes');
const taxChargesTypeRoutes = require('./routes/taxChargesTypeRoutes');
const collectionRateRoutes = require('./routes/collectionRateRoutes');
const salesOrderRoutes = require('./routes/salesOrderRoutes');
const salesOrderParcelRoutes = require('./routes/salesOrderParcelRoutes');
const salesOrderApprovalRoutes = require('./routes/salesOrderApprovalRoutes');
const sendSalesQuotationRoutes = require('./routes/sendSalesQuotationRoutes');
const poRoutes = require('./routes/poRoutes');
const poParcelRoutes = require('./routes/poParcelRoutes');
const poApprovalRoutes = require('./routes/poApprovalRoutes');
const sendPurchaseOrderRoutes = require('./routes/sendPurchaseOrderRoutes');
const pendingApprovalsRoutes = require('./routes/pendingApprovalsRoutes');
const lowestItemPriceRoutes = require('./routes/lowestItemPriceRoutes');
const tableAccessRoutes = require('./routes/tableAccessRoutes');
const pInvoiceRoutes = require('./routes/pInvoiceRoutes');
const pInvoiceParcelRoutes = require('./routes/pInvoiceParcelRoutes');
const pInvoiceApprovalRoutes = require('./routes/pInvoiceApprovalRoutes');
const salesInvoiceRoutes = require('./routes/salesInvoiceRoutes');
const salesInvoiceApprovalRoutes = require('./routes/salesInvoiceApprovalRoutes');
const salesInvoiceParcelRoutes = require('./routes/salesInvoiceParcelRoutes');
const purchaseRFQToSupplierRoutes = require('./routes/purchaseRFQToSupplierRoutes');
const inquiryTrackingRoutes = require('./routes/inquiryTrackingRoutes');
const commentsRoutes = require('./routes/commentsRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN,
    "http://localhost:3000",
    "http://localhost:5173",
    "http://fleetmonkey.dngdemo.in"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
}));

// WebSocket setup
const http = require('http');
const WebSocket = require('ws');
const SalesRFQModel = require('./models/salesRFQModel');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Map();

wss.on('connection', (ws, req) => {
  const urlParams = new URLSearchParams(req.url.split('?')[1]);
  const salesRFQId = urlParams.get('salesRFQId');
  const userId = urlParams.get('userId');

  if (salesRFQId && userId) {
    clients.set(ws, { salesRFQId, userId });
    ws.send(JSON.stringify({ message: `Connected to SalesRFQ ${salesRFQId} updates` }));
  } else {
    ws.close(1008, 'Missing salesRFQId or userId');
  }

  ws.on('close', () => {
    clients.delete(ws);
  });
});

async function broadcastApprovalUpdate(salesRFQId) {
  try {
    const result = await SalesRFQModel.getSalesRFQApprovalStatus(salesRFQId);
    clients.forEach((client, ws) => {
      if (client.salesRFQId === salesRFQId.toString() && ws.isAlive !== false) {
        ws.send(JSON.stringify({
          type: 'APPROVAL_UPDATE',
          data: result.data
        }));
      }
    });
  } catch (error) {
    console.error('Error broadcasting approval update:', error);
  }
}

SalesRFQModel.onApprovalUpdate = broadcastApprovalUpdate;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, timestamp: new Date().toISOString() });
});

// Initialize server
async function startServer() {
  try {
    // Wait for database connection
    const pool = await poolPromise;
    console.log('Database pool initialized successfully');

    // Mount routes with validation
    const routes = [
      ['/api/customers', customerRoutes],
      ['/api/companies', companyRoutes],
      ['/api/suppliers', supplierRoutes],
      ['/api/service-types', serviceTypeRoutes],
      ['/api/addresses', addressRoutes],
      ['/api/mailing-priorities', mailingPriorityRoutes],
      ['/api/currencies', currencyRoutes],
      ['/api/persons', personRoutes],
      ['/api/person-types', personTypeRoutes],
      ['/api/items', itemRoutes],
      ['/api/uoms', uomRoutes],
      ['/api/auth', authRoutes],
      ['/api/city', cityRoutes],
      ['/api/country-of-origin', countryOfOriginRoutes],
      ['/api/address-types', addressTypeRoutes],
      ['/api/warehouses', warehouseRoutes],
      ['/api/vehicles', vehicleRoutes],
      ['/api/bank-accounts', bankAccountRoutes],
      ['/api/certifications', certificationRoutes],
      ['/api/roles', RolesRoutes],
      ['/api/permissions', permissionRoutes],
      ['/api/rolepermissions', rolePermissionRoutes],
      ['/api/forms', formRoutes],
      ['/api/formRole', formRoleRoutes],
      ['/api/formRoleApprover', formRoleApproverRoutes],
      ['/api/taxChargesType', taxChargesTypeRoutes],
      ['/api/collectionRate', collectionRateRoutes],
      ['/api/subscriptionPlan', subscriptionPlanRoutes],
      ['/api/sales-rfq', salesRFQRoutes],
      ['/api/sales-rfq-parcels', salesRFQParcelRoutes],
      ['/api/sales-rfq-approvals', salesRFQApprovalRoutes],
      ['/api/purchase-rfq', purchaseRFQRoutes],
      ['/api/purchase-rfq-parcels', purchaseRFQParcelRoutes],
      ['/api/purchase-rfq-approvals', purchaseRFQApprovalRoutes],
      ['/api/rfqsent', sentPurchaseRFQToSuppliersRoutes],
      ['/api/supplier-Quotation', supplierQuotationRoutes],
      ['/api/supplier-Quotation-Parcel', supplierQuotationParcelRoutes],
      ['/api/supplier-quotation-approvals', supplierQuotationApprovalRoutes],
      ['/api/sales-Quotation', salesQuotationRoutes],
      ['/api/sales-Quotation-Parcel', salesQuotationParcelRoutes],
      ['/api/sales-Quotation-Approvals', salesQuotationApprovalRoutes],
      ['/api/send-sales-quotation', sendSalesQuotationRoutes],
      ['/api/sales-Order', salesOrderRoutes],
      ['/api/sales-Order-Parcel', salesOrderParcelRoutes],
      ['/api/sales-Order-Approval', salesOrderApprovalRoutes],
      ['/api/purchase-Order', poRoutes],
      ['/api/po-Parcel', poParcelRoutes],
      ['/api/po-Approval', poApprovalRoutes],
      ['/api/sendPurchaseOrder', sendPurchaseOrderRoutes],
      ['/api/pendingApprovals', pendingApprovalsRoutes],
      ['/api/purchase-Invoice', pInvoiceRoutes],
      ['/api/pInvoiceParcel', pInvoiceParcelRoutes],
      ['/api/pInvoiceApproval', pInvoiceApprovalRoutes],
      ['/api/salesInvoice', salesInvoiceRoutes],
      ['/api/salesInvoiceApproval', salesInvoiceApprovalRoutes],
      ['/api/salesInvoiceParcel', salesInvoiceParcelRoutes],
      ['/api/lowestItemPrice', lowestItemPriceRoutes],
      ['/api/tableAccess', tableAccessRoutes],
      ['/api/purchaseRFQToSupplier', purchaseRFQToSupplierRoutes],
      ['/api/inquiryTracking', inquiryTrackingRoutes],
      ['/api/comments', commentsRoutes]
    ];

    routes.forEach(([path, route]) => {
      if (!route) {
        throw new Error(`Route module not properly imported for ${path}`);
      }
      app.use(path, route);
      console.log(`Mounted route: ${path}`);
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Application Error:', err.stack);
      res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    // dummy
    const PORT = process.env.PORT || 7000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`Received ${signal}. Shutting down...`);
      try {
        server.close(() => {
          console.log('HTTP server closed');
        });

        if (pool) {
          await pool.end();
          console.log('Database pool closed');
        }

        process.exit(0);
      } catch (err) {
        console.error('Shutdown error:', err);
        process.exit(1);
      }
    };

    // Handle process signals
    ['SIGINT', 'SIGTERM'].forEach(signal => {
      process.on(signal, () => shutdown(signal));
    });

    // Handle uncaught errors
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });

    return pool;
  } catch (err) {
    console.error('Server initialization failed:', err);
    process.exit(1);
  }
}

// Start the server
startServer()
  .then(() => console.log('Server initialization complete'))
  .catch(err => {
    console.error('Fatal error during server startup:', err);
    process.exit(1);
  });

// Export pool getter
module.exports = {
  getPool: async () => {
    try {
      return await poolPromise;
    } catch (err) {
      throw new Error(`Failed to get database pool: ${err.message}`);
    }
  }
};
