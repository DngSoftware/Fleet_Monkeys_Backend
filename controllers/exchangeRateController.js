const ExchangeRateModel = require('../models/exchangeRateModel');
const ExchangeRateService = require('../services/exchangeRateService');

class ExchangeRateController {
  async getRates(req, res) {
    try {
      const rates = await ExchangeRateModel.getRates();
      res.status(200).json({
        success: true,
        message: 'Exchange rates retrieved successfully',
        data: rates
      });
    } catch (error) {
      console.error('getRates controller error:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null
      });
    }
  }

  // Manual update endpoint
  async updateRates(req, res) {
    try {
      const result = await ExchangeRateService.triggerManualUpdate();
      res.status(200).json({
        success: true,
        message: 'Exchange rates updated successfully',
        data: result
      });
    } catch (error) {
      console.error('updateRates controller error:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({
        success: false,
        message: `Failed to update exchange rates: ${error.message}`,
        data: null
      });
    }
  }

  // Get scheduler status
  async getSchedulerStatus(req, res) {
    try {
      const status = ExchangeRateService.getSchedulerStatus();
      res.status(200).json({
        success: true,
        message: 'Scheduler status retrieved successfully',
        data: status
      });
    } catch (error) {
      console.error('getSchedulerStatus controller error:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null
      });
    }
  }

  // Start scheduler endpoint (admin only)
  async startScheduler(req, res) {
    try {
      ExchangeRateService.startScheduler();
      res.status(200).json({
        success: true,
        message: 'Exchange rate scheduler started successfully',
        data: ExchangeRateService.getSchedulerStatus()
      });
    } catch (error) {
      console.error('startScheduler controller error:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({
        success: false,
        message: `Failed to start scheduler: ${error.message}`,
        data: null
      });
    }
  }

  // Stop scheduler endpoint (admin only)
  async stopScheduler(req, res) {
    try {
      ExchangeRateService.stopScheduler();
      res.status(200).json({
        success: true,
        message: 'Exchange rate scheduler stopped successfully',
        data: ExchangeRateService.getSchedulerStatus()
      });
    } catch (error) {
      console.error('stopScheduler controller error:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({
        success: false,
        message: `Failed to stop scheduler: ${error.message}`,
        data: null
      });
    }
  }
}

module.exports = new ExchangeRateController();