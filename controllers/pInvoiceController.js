const PInvoiceModel = require('../models/pInvoiceModel');

   class PInvoiceController {
     static async getAllPInvoices(req, res) {
       try {
         const { pageNumber, pageSize, fromDate, toDate } = req.query;

         if (pageNumber && isNaN(parseInt(pageNumber))) {
           return res.status(400).json({
             success: false,
             message: 'Invalid pageNumber',
             data: null,
             pagination: null
           });
         }
         if (pageSize && isNaN(parseInt(pageSize))) {
           return res.status(400).json({
             success: false,
             message: 'Invalid pageSize',
             data: null,
             pagination: null
           });
         }

         const result = await PInvoiceModel.getAllPInvoices({
           pageNumber: parseInt(pageNumber) || 1,
           pageSize: parseInt(pageSize) || 10,
           fromDate: fromDate || null,
           toDate: toDate || null
         });

         return res.status(result.success ? 200 : 400).json({
           success: result.success,
           message: result.message,
           data: result.data,
           pagination: result.pagination
         });
       } catch (err) {
         console.error('Error in getAllPInvoices:', err);
         return res.status(500).json({
           success: false,
           message: `Server error: ${err.message}`,
           data: null,
           pagination: null
         });
       }
     }

     static async getPInvoiceById(req, res) {
       try {
         const { id } = req.params;
         const pInvoiceId = parseInt(id);
         if (isNaN(pInvoiceId)) {
           return res.status(400).json({
             success: false,
             message: 'Invalid or missing PInvoiceID',
             data: null,
             pInvoiceId: null
           });
         }

         const result = await PInvoiceModel.getPInvoiceById(pInvoiceId);
         return res.status(result.success ? 200 : 404).json({
           success: result.success,
           message: result.message,
           data: result.data,
           pInvoiceId: result.pInvoiceId
         });
       } catch (err) {
         console.error('Error in getPInvoiceById:', err);
         return res.status(500).json({
           success: false,
           message: `Server error: ${err.message}`,
           data: null,
           pInvoiceId: null
         });
       }
     }

     static async createPInvoice(req, res) {
       try {
         const userId = req.user && req.user.personId ? parseInt(req.user.personId) : null;
         if (!userId) {
           return res.status(401).json({
             success: false,
             message: 'Unauthorized: User ID not found in authentication context',
             data: null,
             pInvoiceId: null
           });
         }

         const data = req.body;
         const requiredFields = ['poid'];
         const missingFields = requiredFields.filter(field => !data[field]);
         if (missingFields.length > 0) {
           return res.status(400).json({
             success: false,
             message: `${missingFields.join(', ')} are required`,
             data: null,
             pInvoiceId: null
           });
         }

         if (data.originWarehouseID && isNaN(parseInt(data.originWarehouseID))) {
           return res.status(400).json({
             success: false,
             message: 'Invalid originWarehouseID',
             data: null,
             pInvoiceId: null
           });
         }
         if (data.destinationWarehouseID && isNaN(parseInt(data.destinationWarehouseID))) {
           return res.status(400).json({
             success: false,
             message: 'Invalid destinationWarehouseID',
             data: null,
             pInvoiceId: null
           });
         }
         if (data.taxChargesTypeId && isNaN(parseInt(data.taxChargesTypeId))) {
           return res.status(400).json({
             success: false,
             message: 'Invalid taxChargesTypeId',
             data: null,
             pInvoiceId: null
           });
         }
         if (data.taxRate && isNaN(parseFloat(data.taxRate))) {
           return res.status(400).json({
             success: false,
             message: 'Invalid taxRate',
             data: null,
             pInvoiceId: null
           });
         }
         if (data.taxTotal && isNaN(parseFloat(data.taxTotal))) {
           return res.status(400).json({
             success: false,
             message: 'Invalid taxTotal',
             data: null,
             pInvoiceId: null
           });
         }
         if (data.billedBy && isNaN(parseInt(data.billedBy))) {
           return res.status(400).json({
             success: false,
             message: 'Invalid billedBy',
             data: null,
             pInvoiceId: null
           });
         }
         if (data.billedTo && isNaN(parseInt(data.billedTo))) {
           return res.status(400).json({
             success: false,
             message: 'Invalid billedTo',
             data: null,
             pInvoiceId: null
           });
         }
         if (data.deferralAccount && typeof data.deferralAccount !== 'string') {
           return res.status(400).json({
             success: false,
             message: 'Invalid deferralAccount',
             data: null,
             pInvoiceId: null
           });
         }

         const result = await PInvoiceModel.createPInvoice(data, userId);
         return res.status(result.success ? 201 : 400).json({
           success: result.success,
           message: result.message,
           data: result.data,
           pInvoiceId: result.pInvoiceId
         });
       } catch (err) {
         console.error('Error in createPInvoice:', err);
         return res.status(500).json({
           success: false,
           message: `Server error: ${err.message}`,
           data: null,
           pInvoiceId: null
         });
       }
     }

     static async updatePInvoice(req, res) {
       try {
         const { id } = req.params;
         const pInvoiceId = parseInt(id);
         if (isNaN(pInvoiceId)) {
           return res.status(400).json({
             success: false,
             message: 'Invalid or missing PInvoiceID',
             data: null,
             pInvoiceId: null
           });
         }

         const userId = req.user && req.user.personId ? parseInt(req.user.personId) : null;
         if (!userId) {
           return res.status(401).json({
             success: false,
             message: 'Unauthorized: User ID not found in authentication context',
             data: null,
             pInvoiceId: null
           });
         }

         const data = req.body;
         if (data.poid && isNaN(parseInt(data.poid))) {
           return res.status(400).json({
             success: false,
             message: 'Invalid poid',
             data: null,
             pInvoiceId: null
           });
         }
         if (data.originWarehouseID && isNaN(parseInt(data.originWarehouseID))) {
           return res.status(400).json({
             success: false,
             message: 'Invalid originWarehouseID',
             data: null,
             pInvoiceId: null
           });
         }
         if (data.destinationWarehouseID && isNaN(parseInt(data.destinationWarehouseID))) {
           return res.status(400).json({
             success: false,
             message: 'Invalid destinationWarehouseID',
             data: null,
             pInvoiceId: null
           });
         }
         if (data.taxChargesTypeId && isNaN(parseInt(data.taxChargesTypeId))) {
           return res.status(400).json({
             success: false,
             message: 'Invalid taxChargesTypeId',
             data: null,
             pInvoiceId: null
           });
         }
         if (data.taxRate && isNaN(parseFloat(data.taxRate))) {
           return res.status(400).json({
             success: false,
             message: 'Invalid taxRate',
             data: null,
             pInvoiceId: null
           });
         }
         if (data.taxTotal && isNaN(parseFloat(data.taxTotal))) {
           return res.status(400).json({
             success: false,
             message: 'Invalid taxTotal',
             data: null,
             pInvoiceId: null
           });
         }
         if (data.billedBy && isNaN(parseInt(data.billedBy))) {
           return res.status(400).json({
             success: false,
             message: 'Invalid billedBy',
             data: null,
             pInvoiceId: null
           });
         }
         if (data.billedTo && isNaN(parseInt(data.billedTo))) {
           return res.status(400).json({
             success: false,
             message: 'Invalid billedTo',
             data: null,
             pInvoiceId: null
           });
         }
         if (data.deferralAccount && typeof data.deferralAccount !== 'string') {
           return res.status(400).json({
             success: false,
             message: 'Invalid deferralAccount',
             data: null,
             pInvoiceId: null
           });
         }

         const result = await PInvoiceModel.updatePInvoice(pInvoiceId, data, userId);
         return res.status(result.success ? 200 : 400).json({
           success: result.success,
           message: result.message,
           data: result.data,
           pInvoiceId: result.pInvoiceId
         });
       } catch (err) {
         console.error('Error in updatePInvoice:', err);
         return res.status(500).json({
           success: false,
           message: `Server error: ${err.message}`,
           data: null,
           pInvoiceId: null
         });
       }
     }

     static async deletePInvoice(req, res) {
       try {
         const { id } = req.params;
         const pInvoiceId = parseInt(id);
         if (isNaN(pInvoiceId)) {
           return res.status(400).json({
             success: false,
             message: 'Invalid or missing PInvoiceID',
             data: null,
             pInvoiceId: null
           });
         }

         const userId = req.user && req.user.personId ? parseInt(req.user.personId) : null;
         if (!userId) {
           return res.status(401).json({
             success: false,
             message: 'Unauthorized: User ID not found in authentication context',
             data: null,
             pInvoiceId: null
           });
         }

         const result = await PInvoiceModel.deletePInvoice(pInvoiceId, userId);
         return res.status(result.success ? 200 : 400).json({
           success: result.success,
           message: result.message,
           data: result.data,
           pInvoiceId: result.pInvoiceId
         });
       } catch (err) {
         console.error('Error in deletePInvoice:', err);
         return res.status(500).json({
           success: false,
           message: `Server error: ${err.message}`,
           data: null,
           pInvoiceId: null
         });
       }
     }

     static async approvePInvoice(req, res) {
       try {
         const { PInvoiceID } = req.body;
         const approverID = req.user?.personId;

         if (!PInvoiceID) {
           return res.status(400).json({
             success: false,
             message: 'PInvoiceID is required',
             data: null,
             PInvoiceID: null,
             newPInvoiceID: null
           });
         }

         if (!req.user || !approverID) {
           return res.status(401).json({
             success: false,
             message: 'Authentication required',
             data: null,
             PInvoiceID: null,
             newPInvoiceID: null
           });
         }

         const approvalData = {
           PInvoiceID: parseInt(PInvoiceID),
           ApproverID: parseInt(approverID)
         };

         const result = await PInvoiceModel.approvePInvoice(approvalData);
         return res.status(result.success ? (result.isFullyApproved ? 200 : 202) : 403).json(result);
       } catch (err) {
         console.error('Approve Purchase Invoice error:', err);
         return res.status(500).json({
           success: false,
           message: `Server error: ${err.message}`,
           data: null,
           PInvoiceID: null,
           newPInvoiceID: null
         });
       }
     }

     static async getPInvoiceApprovalStatus(req, res) {
       try {
         const PInvoiceID = parseInt(req.params.id);
         if (isNaN(PInvoiceID)) {
           return res.status(400).json({
             success: false,
             message: 'Invalid or missing PInvoiceID',
             data: null,
             PInvoiceID: null,
             newPInvoiceID: null
           });
         }

         const result = await PInvoiceModel.getPInvoiceApprovalStatus(PInvoiceID);
         return res.status(result.success ? 200 : 400).json(result);
       } catch (err) {
         console.error('Get Purchase Invoice Approval Status error:', err);
         return res.status(500).json({
           success: false,
           message: `Server error: ${err.message}`,
           data: null,
           PInvoiceID: null,
           newPInvoiceID: null
         });
       }
     }
   }

   module.exports = PInvoiceController;