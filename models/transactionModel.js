const poolPromise = require('../config/db.config');

const executeTransactionSP = async (action, params) => {
    let pool;
    try {
        // Get the pool from the promise
        pool = await poolPromise;
        
        console.log('Executing SP with action:', action);
        console.log('Params:', params);
        
        // Ensure parameters are in the correct order and format
        const [results] = await pool.execute(
            `CALL SP_ManageTransactions(?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)`,
            [
                action,
                params.transactionId || null,
                params.salesRFQId || null,
                params.supplierId || null,
                params.transactionAmount || null,
                params.transactionDate || null,
                params.transactionTypeId || null,
                params.createdById || 1
            ]
        );

        // Fetch the output parameters
        const [output] = await pool.execute('SELECT @p_Result AS result, @p_Message AS message');
        const result = output[0];
        
        console.log('SP Result:', result);

        // Handle different actions
        if (action === 'SELECT' && result.result === 1) {
            return { 
                result: result.result, 
                message: result.message, 
                data: results[0] || [] 
            };
        } else if (action === 'INSERT' && result.result === 1) {
            let transactionId = null;
            if (result.message && result.message.includes('ID: ')) {
                const match = result.message.match(/ID: (\d+)/);
                if (match) {
                    transactionId = parseInt(match[1]);
                }
            }
            return { 
                result: result.result, 
                message: result.message, 
                transactionId 
            };
        } else {
            return { 
                result: result.result, 
                message: result.message 
            };
        }
    } catch (error) {
        console.error('Database error:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sql: error.sql
        });
        throw new Error(`Database operation failed: ${error.message}`);
    }
};

module.exports = { executeTransactionSP };