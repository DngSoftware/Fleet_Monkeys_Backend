const axios = require('axios');
const cron = require('node-cron');
const ExchangeRateModel = require('../models/exchangeRateModel');

// Define API key as a constant
const EXCHANGE_RATE_API_KEY = '77b2916030994a174c4e1a60'; // Replace with your actual API key

class ExchangeRateService {
  constructor() {
    this.isSchedulerRunning = false;
    this.lastUpdateTime = null;
    this.updateInterval = null;
  }

  async fetchAndUpdateRates() {
    try {
      if (!EXCHANGE_RATE_API_KEY) {
        throw new Error('EXCHANGE_RATE_API_KEY is not defined');
      }

      // Define the currencies we want to track
      const targetCurrencies = ['USD', 'ZAR', 'BWP'];

      console.log('Fetching exchange rates from API...');
      const response = await axios.get(`https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/USD`, {
        timeout: 10000 // 10 second timeout
      });
      
      if (!response.data || !response.data.conversion_rates) {
        throw new Error('Invalid API response: rates data is missing');
      }

      const allRates = response.data.conversion_rates;
      
      // Filter to only include our target currencies
      const filteredRates = {};
      targetCurrencies.forEach(currency => {
        if (allRates[currency]) {
          filteredRates[currency] = allRates[currency];
        }
      });
      
      const currencyCount = Object.keys(filteredRates).length;
      console.log(`Fetched ${currencyCount} exchange rates from API (${targetCurrencies.join(', ')})`);
      
      await ExchangeRateModel.updateRates(filteredRates, 'USD');
      this.lastUpdateTime = new Date();
      console.log(`Exchange rates updated successfully at ${this.lastUpdateTime.toISOString()}`);
      
      return {
        success: true,
        updatedAt: this.lastUpdateTime,
        currencies: targetCurrencies,
        rates: filteredRates
      };
    } catch (error) {
      console.error('fetchAndUpdateRates error:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : null,
        stack: error.stack
      });
      
      // Handle specific API errors
      if (error.response && error.response.status === 403) {
        console.error('API Key invalid or quota exceeded');
      } else if (error.response && error.response.status === 429) {
        console.error('Rate limit exceeded - will retry later');
      }
      
      throw new Error(`Failed to fetch or update exchange rates: ${error.message}`);
    }
  }

  // Start automated scheduler for exchange rate updates
  startScheduler() {
    if (this.isSchedulerRunning) {
      return;
    }

    // Schedule updates every 6 hours (free plan allows 1,500 requests/month)
    // This gives us ~12 requests per day = 360 requests per month (well within limit)
    this.updateInterval = cron.schedule('0 */6 * * *', async () => {
      try {
        await this.fetchAndUpdateRates();
      } catch (error) {
        console.error('Scheduled exchange rate update failed:', error.message);
      }
    }, {
      scheduled: false, // Don't start immediately
      timezone: "UTC"
    });

    // Start the cron job
    this.updateInterval.start();
    this.isSchedulerRunning = true;

    console.log('Exchange rate will update rates every 6 hours');

    // Initial update on startup (if not updated recently)
    this.performInitialUpdate();
  }

  // Stop the scheduler
  stopScheduler() {
    if (this.updateInterval) {
      this.updateInterval.stop();
      this.updateInterval.destroy();
      this.updateInterval = null;
    }
    this.isSchedulerRunning = false;
  }

  // Perform initial update if rates are stale
  async performInitialUpdate() {
    try {
      const currentRates = await ExchangeRateModel.getRates();
      
      // Check if we need initial update (no rates or rates older than 6 hours)
      let needsUpdate = currentRates.length === 0;
      
      if (!needsUpdate && currentRates.length > 0) {
        const latestUpdate = new Date(Math.max(...currentRates.map(rate => new Date(rate.updated_at))));
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        needsUpdate = latestUpdate < sixHoursAgo;
      }

      if (needsUpdate) {
        await this.fetchAndUpdateRates();
      } else {
        this.lastUpdateTime = new Date(Math.max(...currentRates.map(rate => new Date(rate.updated_at))));
      }
    } catch (error) {
      console.error('Initial exchange rate update failed:', error.message);
    }
  }

  // Manual trigger for updates (can be called via API endpoint)
  async triggerManualUpdate() {
    try {
      return await this.fetchAndUpdateRates();
    } catch (error) {
      console.error('Manual exchange rate update failed:', error.message);
      throw error;
    }
  }

  // Get scheduler status
  getSchedulerStatus() {
    return {
      isRunning: this.isSchedulerRunning,
      lastUpdateTime: this.lastUpdateTime,
      nextScheduledRun: this.updateInterval ? this.updateInterval.nextDates().toISOString() : null
    };
  }

  // Alternative method for high-frequency updates (if you upgrade to paid plan)
  startHighFrequencyScheduler() {
    if (this.isSchedulerRunning) {
      this.stopScheduler();
    }

    // Update every hour for paid plans
    this.updateInterval = cron.schedule('0 * * * *', async () => {
      try {
        await this.fetchAndUpdateRates();
      } catch (error) {
        console.error('High-frequency scheduled exchange rate update failed:', error.message);
      }
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    this.isSchedulerRunning = true;
  }

  // Graceful shutdown
  async shutdown() {
    this.stopScheduler();
  }
}

// Create singleton instance
const exchangeRateService = new ExchangeRateService();

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  await exchangeRateService.shutdown();
});

process.on('SIGTERM', async () => {
  await exchangeRateService.shutdown();
});

module.exports = exchangeRateService;