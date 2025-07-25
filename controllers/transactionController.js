const transactionModel = require('../models/transactionModel');

// Helper function for validation within the controller
const validateTransaction = (params, action) => {
    console.log('Validating transaction:', { params, action });
    
    if (action === 'INSERT' || action === 'UPDATE') {
        // Check if transactionAmount exists and is valid
        if (params.transactionAmount == null || params.transactionAmount === undefined || params.transactionAmount === '') {
            return { valid: false, message: 'Transaction amount is required and cannot be empty.' };
        }
        
        // Convert to number if it's a string
        const amount = typeof params.transactionAmount === 'string' 
            ? parseFloat(params.transactionAmount) 
            : params.transactionAmount;
            
        console.log('Amount validation - Original:', params.transactionAmount, 'Converted:', amount);
        
        // Check if it's a valid number and greater than 0
        if (isNaN(amount) || amount <= 0) {
            return { valid: false, message: 'Transaction amount must be a valid number greater than zero.' };
        }
        
        // Update the params with the converted number
        params.transactionAmount = amount;
        
        // Validate optional foreign keys if provided
        if (params.salesRFQId != null && (isNaN(params.salesRFQId) || params.salesRFQId <= 0)) {
            return { valid: false, message: 'SalesRFQID must be a valid positive number if provided.' };
        }
        
        if (params.supplierId != null && (isNaN(params.supplierId) || params.supplierId <= 0)) {
            return { valid: false, message: 'SupplierID must be a valid positive number if provided.' };
        }
        
        if (params.transactionTypeId != null && (isNaN(params.transactionTypeId) || params.transactionTypeId <= 0)) {
            return { valid: false, message: 'TransactionTypeID must be a valid positive number if provided.' };
        }
    }

    if (action === 'INSERT') {
        if (params.createdById == null || params.createdById === '' || isNaN(params.createdById) || params.createdById <= 0) {
            return { valid: false, message: 'CreatedByID is required and must be a valid positive number for INSERT operation.' };
        }
    }

    if (action === 'UPDATE' || action === 'DELETE') {
        if (params.transactionId == null || isNaN(params.transactionId) || params.transactionId <= 0) {
            return { valid: false, message: 'TransactionID is required and must be a valid positive number.' };
        }
    }

    return { valid: true, message: 'Validation passed' };
};

const getTransaction = async (req, res) => {
    try {
        const transactionId = parseInt(req.params.transactionId);
        const validation = validateTransaction({ transactionId }, 'SELECT');
        if (!validation.valid) {
            return res.status(400).json({ result: 0, message: validation.message });
        }

        const result = await transactionModel.executeTransactionSP('SELECT', {
            transactionId,
            salesRFQId: null,
            supplierId: null,
            transactionAmount: null,
            transactionDate: null,
            transactionTypeId: null,
            createdById: null
        });

        if (result.result === 1) {
            res.status(200).json({ 
                result: result.result, 
                message: result.message, 
                data: result.data[0] || null 
            });
        } else {
            res.status(404).json({ result: result.result, message: result.message });
        }
    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({ result: 0, message: `Server error: ${error.message}` });
    }
};

const createTransaction = async (req, res) => {
    try {
        console.log('=== CREATE TRANSACTION REQUEST ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        let { salesRFQId, supplierId, transactionAmount, transactionDate, transactionTypeId, createdById } = req.body;
        
        // Prepare validation object
        const validationParams = {
            salesRFQId, 
            supplierId, 
            transactionAmount,
            transactionDate, 
            transactionTypeId, 
            createdById
        };
        
        // Validate input
        const validation = validateTransaction(validationParams, 'INSERT');
        if (!validation.valid) {
            console.log('Validation failed:', validation.message);
            return res.status(400).json({ result: 2, message: validation.message });
        }
        
        console.log('Validation passed, proceeding with SP call...');
        
        // Call stored procedure with validated data
        const result = await transactionModel.executeTransactionSP('INSERT', {
            transactionId: null,
            salesRFQId: salesRFQId || null,
            supplierId: supplierId || null,
            transactionAmount: validationParams.transactionAmount,
            transactionDate: transactionDate || null,
            transactionTypeId: transactionTypeId || null,
            createdById: validationParams.createdById
        });

        console.log('SP Result:', result);
        
        res.status(result.result === 1 ? 201 : 400).json({ 
            result: result.result, 
            message: result.message,
            transactionId: result.transactionId 
        });
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ result: 0, message: `Server error: ${error.message}` });
    }
};

const updateTransaction = async (req, res) => {
    try {
        console.log('=== UPDATE TRANSACTION REQUEST ===');
        console.log('Request params:', req.params);
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        const transactionId = parseInt(req.params.transactionId);
        let { salesRFQId, supplierId, transactionAmount, transactionDate, transactionTypeId, createdById } = req.body;

        // Prepare validation object
        const validationParams = {
            transactionId,
            salesRFQId, 
            supplierId, 
            transactionAmount,
            transactionDate, 
            transactionTypeId, 
            createdById: createdById || 1
        };

        // Validate input
        const validation = validateTransaction(validationParams, 'UPDATE');
        if (!validation.valid) {
            console.log('Validation failed:', validation.message);
            return res.status(400).json({ result: 2, message: validation.message });
        }

        console.log('Validation passed, proceeding with SP call...');

        // Call stored procedure with validated data
        const result = await transactionModel.executeTransactionSP('UPDATE', {
            transactionId,
            salesRFQId: salesRFQId || null,
            supplierId: supplierId || null,
            transactionAmount: validationParams.transactionAmount,
            transactionDate: transactionDate || null,
            transactionTypeId: transactionTypeId || null,
            createdById: validationParams.createdById
        });

        console.log('SP Result:', result);

        res.status(result.result === 1 ? 200 : 400).json({ 
            result: result.result, 
            message: result.message 
        });
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ result: 0, message: `Server error: ${error.message}` });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const transactionId = parseInt(req.params.transactionId);
        const validation = validateTransaction({ transactionId }, 'DELETE');
        if (!validation.valid) {
            return res.status(400).json({ result: 0, message: validation.message });
        }

        const result = await transactionModel.executeTransactionSP('DELETE', {
            transactionId,
            salesRFQId: null,
            supplierId: null,
            transactionAmount: null,
            transactionDate: null,
            transactionTypeId: null,
            createdById: 1
        });

        res.status(result.result === 1 ? 200 : 400).json({ 
            result: result.result, 
            message: result.message 
        });
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ result: 0, message: `Server error: ${error.message}` });
    }
};

module.exports = {
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction
};