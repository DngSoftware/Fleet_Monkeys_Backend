const DashboardCountsModel = require('../models/DashboardCountsModel');

class DashboardCountsController {
    static async getDashboardCounts(req, res) {
        try {
            const result = await DashboardCountsModel.getDashboardCounts();
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } catch (err) {
            console.error('Error in getDashboardCounts:', err);
            res.status(500).json({
                success: false,
                message: `Server error: ${err.message}`,
                data: null
            });
        }
    }
}

module.exports = DashboardCountsController;
