const poolPromise = require('../config/db.config');

   class PInvoiceModel {
     static async getAllPInvoices({
       pageNumber = 1,
       pageSize = 10,
       fromDate = null,
       toDate = null
     }) {
       try {
         const pool = await poolPromise;

         if (!Number.isInteger(pageNumber) || pageNumber < 1) {
           return {
             success: false,
             message: 'Invalid pageNumber: must be a positive integer',
             data: null,
             pagination: null
           };
         }
         if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
           return {
             success: false,
             message: 'Invalid pageSize: must be between 1 and 100',
             data: null,
             pagination: null
           };
         }
         let formattedFromDate = null, formattedToDate = null;
         if (fromDate) {
           formattedFromDate = new Date(fromDate);
           if (isNaN(formattedFromDate)) {
             return {
               success: false,
               message: 'Invalid fromDate',
               data: null,
               pagination: null
             };
           }
         }
         if (toDate) {
           formattedToDate = new Date(toDate);
           if (isNaN(formattedToDate)) {
             return {
               success: false,
               message: 'Invalid toDate',
               data: null,
               pagination: null
             };
           }
         }
         if (formattedFromDate && formattedToDate && formattedFromDate > formattedToDate) {
           return {
             success: false,
             message: 'fromDate cannot be later than toDate',
             data: null,
             pagination: null
           };
         }

         const queryParams = [
           pageNumber,
           pageSize,
           formattedFromDate || null,
           formattedToDate || null
         ];

         const [results] = await pool.query(
           'CALL SP_GetAllPInvoice(?, ?, ?, ?, @p_Result, @p_Message)',
           queryParams
         );

         const [[outParams]] = await pool.query(
           'SELECT @p_Result AS result, @p_Message AS message'
         );

         if (!Array.isArray(results) || results.length < 2) {
           throw new Error('Unexpected result structure from SP_GetAllPInvoice');
         }

         const invoices = results[0] || [];
         const totalRecords = results[1][0]?.TotalRecords || 0;
         const totalPages = Math.ceil(totalRecords / pageSize);

         return {
           success: outParams.result === 1,
           message: outParams.message || (outParams.result === 1 ? 'Purchase Invoices retrieved successfully' : 'Operation failed'),
           data: invoices,
           pagination: {
             totalRecords,
             currentPage: pageNumber,
             pageSize,
             totalPages
           }
         };
       } catch (err) {
         console.error('Error in getAllPInvoices:', err);
         return {
           success: false,
           message: `Server error: ${err.message}`,
           data: null,
           pagination: null
         };
       }
     }

     static async getPInvoiceById(id) {
       try {
         const pool = await poolPromise;

         const queryParams = [
           'SELECT',
           id,
           null, // p_POID
           null, // p_UserID
           null, // p_Series
           null, // p_PostingDate
           null, // p_RequiredByDate
           null, // p_DeliveryDate
           null, // p_DateReceived
           null, // p_Terms
           null, // p_PackagingRequiredYN
           null, // p_CollectFromSupplierYN
           null, // p_ExternalRefNo
           null, // p_ExternalSupplierID
           null, // p_IsPaid
           null, // p_FormCompletedYN
           null, // p_FileName
           null, // p_FileContent
           null, // p_CopyTaxesFromPO
           null, // p_TaxChargesTypeID
           null, // p_TaxRate
           null, // p_TaxTotal
           null, // p_OriginWarehouseID
           null, // p_DestinationWarehouseID
           null, // p_DeferralAccount
           null, // p_BilledBy
           null, // p_BilledTo
           null  // p_Status
         ];

         const [results] = await pool.query(
           'CALL SP_ManagePInvoice(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_ErrorMessage)',
           queryParams
         );

         const [[outParams]] = await pool.query(
           'SELECT @p_ErrorMessage AS errorMessage'
         );

         if (outParams.errorMessage) {
           throw new Error(outParams.errorMessage);
         }

         if (!results[0][0]) {
           return {
             success: false,
             message: 'Purchase Invoice not found',
             data: null,
             pInvoiceId: id
           };
         }

         return {
           success: true,
           message: 'Purchase Invoice retrieved successfully',
           data: {
             invoice: results[0][0],
             parcels: results[1] || [],
             taxes: results[2] || []
           },
           pInvoiceId: id
         };
       } catch (err) {
         console.error('Error in getPInvoiceById:', err);
         return {
           success: false,
           message: `Server error: ${err.message}`,
           data: null,
           pInvoiceId: id
         };
       }
     }

     static async createPInvoice(data, userId) {
       try {
         const pool = await poolPromise;

         const requiredFields = ['poid'];
         const missingFields = requiredFields.filter(field => !data[field]);
         if (missingFields.length > 0) {
           return {
             success: false,
             message: `${missingFields.join(', ')} are required`,
             data: null,
             pInvoiceId: null
           };
         }

         const queryParams = [
           'INSERT',
           null, // p_PInvoiceID
           data.poid ? parseInt(data.poid) : null,
           userId,
           data.series || null,
           data.postingDate || null,
           data.requiredByDate || null,
           data.deliveryDate || null,
           data.dateReceived || null,
           data.terms || null,
           data.packagingRequiredYN !== undefined ? data.packagingRequiredYN : null,
           data.collectFromSupplierYN !== undefined ? data.collectFromSupplierYN : null,
           data.externalRefNo || null,
           data.externalSupplierId ? parseInt(data.externalSupplierId) : null,
           data.isPaid !== undefined ? data.isPaid : null,
           data.formCompletedYN !== undefined ? data.formCompletedYN : null,
           data.fileName || null,
           data.fileContent || null,
           data.copyTaxesFromPO !== undefined ? data.copyTaxesFromPO : null,
           data.taxChargesTypeId ? parseInt(data.taxChargesTypeId) : null,
           data.taxRate ? parseFloat(data.taxRate) : null,
           data.taxTotal ? parseFloat(data.taxTotal) : null,
           data.originWarehouseID ? parseInt(data.originWarehouseID) : null,
           data.destinationWarehouseID ? parseInt(data.destinationWarehouseID) : null,
           data.deferralAccount || null,
           data.billedBy ? parseInt(data.billedBy) : null,
           data.billedTo ? parseInt(data.billedTo) : null,
           data.status || null
         ];

         const [results] = await pool.query(
           'CALL SP_ManagePInvoice(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_ErrorMessage)',
           queryParams
         );

         const [[outParams]] = await pool.query(
           'SELECT @p_ErrorMessage AS errorMessage'
         );

         if (outParams.errorMessage) {
           return {
             success: false,
             message: outParams.errorMessage,
             data: null,
             pInvoiceId: null
           };
         }

         const pInvoiceId = results[0] && results[0][0] ? results[0][0].PInvoiceID : null;
         if (!pInvoiceId) {
           return {
             success: false,
             message: 'Failed to retrieve new PInvoiceID',
             data: null,
             pInvoiceId: null
           };
         }

         return {
           success: true,
           message: results[0][0].Message || 'Purchase Invoice created successfully',
           data: null,
           pInvoiceId
         };
       } catch (err) {
         console.error('Error in createPInvoice:', err);
         return {
           success: false,
           message: `Server error: ${err.message}`,
           data: null,
           pInvoiceId: null
         };
       }
     }

     static async updatePInvoice(id, data, userId) {
       try {
         const pool = await poolPromise;

         const queryParams = [
           'UPDATE',
           id,
           data.poid ? parseInt(data.poid) : null,
           userId,
           data.series || null,
           data.postingDate || null,
           data.requiredByDate || null,
           data.deliveryDate || null,
           data.dateReceived || null,
           data.terms || null,
           data.packagingRequiredYN !== undefined ? data.packagingRequiredYN : null,
           data.collectFromSupplierYN !== undefined ? data.collectFromSupplierYN : null,
           data.externalRefNo || null,
           data.externalSupplierId ? parseInt(data.externalSupplierId) : null,
           data.isPaid !== undefined ? data.isPaid : null,
           data.formCompletedYN !== undefined ? data.formCompletedYN : null,
           data.fileName || null,
           data.fileContent || null,
           data.copyTaxesFromPO !== undefined ? data.copyTaxesFromPO : null,
           data.taxChargesTypeId ? parseInt(data.taxChargesTypeId) : null,
           data.taxRate ? parseFloat(data.taxRate) : null,
           data.taxTotal ? parseFloat(data.taxTotal) : null,
           data.originWarehouseID ? parseInt(data.originWarehouseID) : null,
           data.destinationWarehouseID ? parseInt(data.destinationWarehouseID) : null,
           data.deferralAccount || null,
           data.billedBy ? parseInt(data.billedBy) : null,
           data.billedTo ? parseInt(data.billedTo) : null,
           data.status || null
         ];

         const [results] = await pool.query(
           'CALL SP_ManagePInvoice(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_ErrorMessage)',
           queryParams
         );

         const [[outParams]] = await pool.query(
           'SELECT @p_ErrorMessage AS errorMessage'
         );

         if (outParams.errorMessage) {
           return {
             success: false,
             message: outParams.errorMessage,
             data: null,
             pInvoiceId: id
           };
         }

         return {
           success: true,
           message: results[0][0]?.Message || 'Purchase Invoice updated successfully',
           data: null,
           pInvoiceId: id
         };
       } catch (err) {
         console.error('Error in updatePInvoice:', err);
         return {
           success: false,
           message: `Server error: ${err.message}`,
           data: null,
           pInvoiceId: id
         };
       }
     }

     static async deletePInvoice(id, userId) {
       try {
         const pool = await poolPromise;

         const queryParams = [
           'DELETE',
           id,
           null, // p_POID
           userId,
           null, // p_Series
           null, // p_PostingDate
           null, // p_RequiredByDate
           null, // p_DeliveryDate
           null, // p_DateReceived
           null, // p_Terms
           null, // p_PackagingRequiredYN
           null, // p_CollectFromSupplierYN
           null, // p_ExternalRefNo
           null, // p_ExternalSupplierID
           null, // p_IsPaid
           null, // p_FormCompletedYN
           null, // p_FileName
           null, // p_FileContent
           null, // p_CopyTaxesFromPO
           null, // p_TaxChargesTypeID
           null, // p_TaxRate
           null, // p_TaxTotal
           null, // p_OriginWarehouseID
           null, // p_DestinationWarehouseID
           null, // p_DeferralAccount
           null, // p_BilledBy
           null, // p_BilledTo
           null  // p_Status
         ];

         const [results] = await pool.query(
           'CALL SP_ManagePInvoice(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_ErrorMessage)',
           queryParams
         );

         const [[outParams]] = await pool.query(
           'SELECT @p_ErrorMessage AS errorMessage'
         );

         if (outParams.errorMessage) {
           return {
             success: false,
             message: outParams.errorMessage,
             data: null,
             pInvoiceId: id
           };
         }

         return {
           success: true,
           message: results[0][0]?.Message || 'Purchase Invoice deleted successfully',
           data: null,
           pInvoiceId: id
         };
       } catch (err) {
         console.error('Error in deletePInvoice:', err);
         return {
           success: false,
           message: `Server error: ${err.message}`,
           data: null,
           pInvoiceId: id
         };
       }
     }

     static async #checkFormRoleApproverPermission(approverID, formName) {
       try {
         const pool = await poolPromise;
         const query = `
           SELECT fra.UserID
           FROM dbo_tblformroleapprover fra
           JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID
           JOIN dbo_tblform f ON fr.FormID = f.FormID
           WHERE fra.UserID = ?
             AND f.FormName = ?
             AND fra.ActiveYN = 1
             AND f.IsDeleted = 0;
         `;
         const [result] = await pool.query(query, [parseInt(approverID), formName]);
         return result.length > 0;
       } catch (error) {
         throw new Error(`Error checking form role approver permission: ${error.message}`);
       }
     }

     static async #checkPInvoiceStatus(PInvoiceID) {
       try {
         const pool = await poolPromise;
         const query = `
           SELECT Status
           FROM dbo_tblpinvoice
           WHERE PInvoiceID = ? AND IsDeleted = 0;
         `;
         const [result] = await pool.query(query, [parseInt(PInvoiceID)]);
         if (result.length === 0) {
           return { exists: false, status: null };
         }
         return { exists: true, status: result[0].Status };
       } catch (error) {
         throw new Error(`Error checking PInvoice status: ${error.message}`);
       }
     }

     static async #insertPInvoiceApproval(connection, approvalData) {
       try {
         const query = `
           INSERT INTO dbo_tblpinvoiceapproval (
            PInvoiceID, ApproverID, ApprovedYN, ApproverDateTime, CreatedByID, CreatedDateTime, IsDeleted
           ) VALUES (
             ?, ?, ?, NOW(), ?, NOW(), 0
           );
         `;
         const [result] = await connection.query(query, [
           parseInt(approvalData.PInvoiceID),
           parseInt(approvalData.ApproverID),
           1,
           parseInt(approvalData.ApproverID)
         ]);
         console.log(`Insert Debug: PInvoiceID=${approvalData.PInvoiceID}, ApproverID=${approvalData.ApproverID}, InsertedID=${result.insertId}`);
         return { success: true, message: 'Approval record inserted successfully.', insertId: result.insertId };
       } catch (error) {
         throw new Error(`Error inserting Purchase Invoice approval: ${error.message}`);
       }
     }

     static async approvePInvoice(approvalData) {
       let connection;
       try {
         const pool = await poolPromise;
         connection = await pool.getConnection();
         await connection.beginTransaction();

         const requiredFields = ['PInvoiceID', 'ApproverID'];
         const missingFields = requiredFields.filter(field => !approvalData[field]);
         if (missingFields.length > 0) {
           throw new Error(`${missingFields.join(', ')} are required`);
         }

         const PInvoiceID = parseInt(approvalData.PInvoiceID);
         const approverID = parseInt(approvalData.ApproverID);
         if (isNaN(PInvoiceID) || isNaN(approverID)) {
           throw new Error('Invalid PInvoiceID or ApproverID');
         }

         const formName = 'Purchase Invoice';
         const hasPermission = await this.#checkFormRoleApproverPermission(approverID, formName);
         if (!hasPermission) {
           throw new Error('Approver does not have permission to approve this form');
         }

         const { exists, status } = await this.#checkPInvoiceStatus(PInvoiceID);
         if (!exists) {
           throw new Error('Purchase Invoice does not exist or has been deleted');
         }
         if (status !== 'Pending') {
           throw new Error(`Purchase Invoice status must be Pending to approve, current status: ${status}`);
         }

         const [existingApproval] = await connection.query(
           'SELECT 1 FROM dbo_tblpinvoiceapproval WHERE PInvoiceID = ? AND ApproverID = ? AND IsDeleted = 0',
           [PInvoiceID, approverID]
         );
         if (existingApproval.length > 0) {
           throw new Error('Approver has already approved this Purchase Invoice');
         }

         const approvalInsertResult = await this.#insertPInvoiceApproval(connection, { PInvoiceID, ApproverID: approverID });
         if (!approvalInsertResult.success) {
           throw new Error(`Failed to insert approval record: ${approvalInsertResult.message}`);
         }

         const [form] = await connection.query(
           'SELECT FormID FROM dbo_tblform WHERE FormName = ? AND IsDeleted = 0',
           [formName]
         );
         if (!form.length) {
           throw new Error('Invalid FormID for Purchase Invoice');
         }
         const formID = form[0].FormID;

         const [requiredApproversList] = await connection.query(
           `SELECT DISTINCT fra.UserID, p.FirstName
            FROM dbo_tblformroleapprover fra
            JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID
            JOIN dbo_tblperson p ON fra.UserID = p.PersonID
            WHERE fr.FormID = ? AND fra.ActiveYN = 1`,
           [formID]
         );
         const requiredCount = requiredApproversList.length;

         const [approvedList] = await connection.query(
           `SELECT s.ApproverID, s.ApprovedYN
            FROM dbo_tblpinvoiceapproval s
            WHERE s.PInvoiceID = ? AND s.IsDeleted = 0
              AND s.ApproverID IN (
                SELECT DISTINCT fra.UserID
                FROM dbo_tblformroleapprover fra
                JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID
                WHERE fr.FormID = ? AND fra.ActiveYN = 1
              )`,
           [PInvoiceID, formID]
         );
         const approved = approvedList.filter(a => a.ApprovedYN === 1).length;

         const [allApprovals] = await connection.query(
           'SELECT ApproverID FROM dbo_tblpinvoiceapproval WHERE PInvoiceID = ? AND IsDeleted = 0',
           [PInvoiceID]
         );
         const requiredUserIDs = requiredApproversList.map(a => a.UserID);
         const mismatchedApprovals = allApprovals.filter(a => !requiredUserIDs.includes(a.ApproverID));

         console.log(`Approval Debug: PInvoiceID=${PInvoiceID}, FormID=${formID}, RequiredApprovers=${requiredCount}, Approvers=${JSON.stringify(requiredApproversList)}, CompletedApprovals=${approved}, ApprovedList=${JSON.stringify(approvedList)}, CurrentApproverID=${approverID}, MismatchedApprovals=${JSON.stringify(mismatchedApprovals)}`);

         let message;
         let isFullyApproved = false;

         if (approved >= requiredCount) {
           await connection.query(
             'UPDATE dbo_tblpinvoice SET Status = ? WHERE PInvoiceID = ?',
             ['Approved', PInvoiceID]
           );
           message = 'Purchase Invoice fully approved.';
           isFullyApproved = true;
         } else {
           const remaining = requiredCount - approved;
           message = `Approval recorded. Awaiting ${remaining} more approval(s).`;
         }

         await connection.commit();

         return {
           success: true,
           message,
           data: null,
           PInvoiceID: PInvoiceID.toString(),
           newPInvoiceID: null,
           isFullyApproved
         };
       } catch (error) {
         if (connection) {
           await connection.rollback();
         }
         console.error('Database error in approvePInvoice:', error);
         return {
           success: false,
           message: `Approval failed: ${error.message || 'Unknown error'}`,
           data: null,
           PInvoiceID: approvalData.PInvoiceID.toString(),
           newPInvoiceID: null
         };
       } finally {
         if (connection) {
           connection.release();
         }
       }
     }

     static async getPInvoiceApprovalStatus(PInvoiceID) {
       try {
         const pool = await poolPromise;
         const formName = 'Purchase Invoice';

         const [form] = await pool.query(
           'SELECT FormID FROM dbo_tblform WHERE FormName = ? AND IsDeleted = 0',
           [formName]
         );
         if (!form.length) {
           throw new Error('Invalid FormID for Purchase Invoice');
         }
         const formID = form[0].FormID;

         const [requiredApprovers] = await pool.query(
           `SELECT DISTINCT fra.UserID, p.FirstName, p.LastName
            FROM dbo_tblformroleapprover fra
            JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID
            JOIN dbo_tblperson p ON fra.UserID = p.PersonID
            WHERE fr.FormID = ? AND fra.ActiveYN = 1 AND p.IsDeleted = 0`,
           [formID]
         );

         const [completedApprovals] = await pool.query(
           `SELECT s.ApproverID, p.FirstName, p.LastName, s.ApproverDateTime
            FROM dbo_tblpinvoiceapproval s
            JOIN dbo_tblperson p ON s.ApproverID = p.PersonID
            WHERE s.PInvoiceID = ? AND s.IsDeleted = 0 AND s.ApprovedYN = 1
            AND s.ApproverID IN (
              SELECT DISTINCT fra.UserID 
              FROM dbo_tblformroleapprover fra 
              JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID 
              WHERE fr.FormID = ? AND fra.ActiveYN = 1
            )`,
           [parseInt(PInvoiceID), formID]
         );

         const approvalStatus = requiredApprovers.map(approver => ({
           UserID: approver.UserID,
           FirstName: approver.FirstName,
           LastName: approver.LastName,
           Approved: completedApprovals.some(a => a.ApproverID === approver.UserID),
           ApproverDateTime: completedApprovals.find(a => a.ApproverID === approver.UserID)?.ApproverDateTime || null
         }));

         return {
           success: true,
           message: 'Approval status retrieved successfully',
           data: {
             PInvoiceID,
             requiredApprovers: requiredApprovers.length,
             completedApprovals: completedApprovals.length,
             approvalStatus
           },
           PInvoiceID: PInvoiceID.toString(),
           newPInvoiceID: null
         };
       } catch (error) {
         console.error('Error in getPInvoiceApprovalStatus:', error);
         return {
           success: false,
           message: `Server error: ${error.message}`,
           data: null,
           PInvoiceID: PInvoiceID.toString(),
           newPInvoiceID: null
         };
       }
     }
   }

   module.exports = PInvoiceModel;