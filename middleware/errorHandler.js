// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error('Error details:', err); // Log full error object
    console.error('Error stack:', err.stack); // Log stack trace
    res.status(500).json({
      error: 'Something went wrong!',
      details: err.message || 'No error message available',
      name: err.name || 'Unknown error type',
      sqlError: err.original ? err.original.message : 'No SQL error details',
    });
  };
  
  module.exports = errorHandler;