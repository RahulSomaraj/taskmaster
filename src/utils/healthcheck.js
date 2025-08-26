const mongoose = require('mongoose');
const http = require('http');

/**
 * Health check utility for Docker containers
 * Checks database connectivity and application status
 */

class HealthCheck {
  constructor() {
    this.checks = [];
    this.status = {
      healthy: true,
      timestamp: new Date().toISOString(),
      checks: {}
    };
  }

  /**
   * Add a health check function
   * @param {string} name - Name of the check
   * @param {Function} checkFn - Function that returns a promise
   * @param {number} timeout - Timeout in milliseconds (default: 5000)
   */
  addCheck(name, checkFn, timeout = 5000) {
    this.checks.push({ name, checkFn, timeout });
  }

  /**
   * Check database connectivity
   */
  async checkDatabase() {
    try {
      const state = mongoose.connection.readyState;
      
      switch (state) {
        case 0: // disconnected
          throw new Error('Database disconnected');
        case 1: // connected
          // Test with a simple query
          await mongoose.connection.db.admin().ping();
          return { status: 'healthy', message: 'Database connected and responsive' };
        case 2: // connecting
          throw new Error('Database connecting');
        case 3: // disconnecting
          throw new Error('Database disconnecting');
        default:
          throw new Error(`Unknown database state: ${state}`);
      }
    } catch (error) {
      throw new Error(`Database health check failed: ${error.message}`);
    }
  }

  /**
   * Check application memory usage
   */
  async checkMemory() {
    const memUsage = process.memoryUsage();
    const maxHeapSize = 512 * 1024 * 1024; // 512MB limit
    
    if (memUsage.heapUsed > maxHeapSize) {
      throw new Error(`Memory usage too high: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
    }
    
    return {
      status: 'healthy',
      message: 'Memory usage within limits',
      data: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024)
      }
    };
  }

  /**
   * Check application uptime
   */
  async checkUptime() {
    const uptime = process.uptime();
    const maxUptime = 24 * 60 * 60; // 24 hours
    
    if (uptime > maxUptime) {
      throw new Error(`Application uptime too long: ${Math.round(uptime / 60 / 60)} hours`);
    }
    
    return {
      status: 'healthy',
      message: 'Application uptime normal',
      data: {
        uptime: Math.round(uptime),
        uptimeHours: Math.round(uptime / 60 / 60)
      }
    };
  }

  /**
   * Check if application can handle HTTP requests
   */
  async checkHttpEndpoint(port = process.env.PORT || 3000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('HTTP health check timeout'));
      }, 5000);

      const req = http.get(`http://localhost:${port}/health`, (res) => {
        clearTimeout(timeout);
        
        if (res.statusCode === 200) {
          resolve({
            status: 'healthy',
            message: 'HTTP endpoint responding',
            data: { statusCode: res.statusCode }
          });
        } else {
          reject(new Error(`HTTP endpoint returned status ${res.statusCode}`));
        }
      });

      req.on('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`HTTP health check failed: ${error.message}`));
      });
    });
  }

  /**
   * Run all health checks
   */
  async runChecks() {
    this.status.timestamp = new Date().toISOString();
    this.status.healthy = true;
    this.status.checks = {};

    const checkPromises = this.checks.map(async ({ name, checkFn, timeout }) => {
      try {
        const result = await Promise.race([
          checkFn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Check timeout')), timeout)
          )
        ]);

        this.status.checks[name] = {
          status: 'healthy',
          message: result.message || 'Check passed',
          data: result.data || {},
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        this.status.healthy = false;
        this.status.checks[name] = {
          status: 'unhealthy',
          message: error.message,
          error: error.stack,
          timestamp: new Date().toISOString()
        };
      }
    });

    await Promise.all(checkPromises);
    return this.status;
  }

  /**
   * Get current health status
   */
  getStatus() {
    return this.status;
  }

  /**
   * Create a health check middleware for Express
   */
  createMiddleware() {
    return async (req, res) => {
      try {
        const status = await this.runChecks();
        
        if (status.healthy) {
          res.status(200).json(status);
        } else {
          res.status(503).json(status);
        }
      } catch (error) {
        res.status(500).json({
          healthy: false,
          message: 'Health check failed',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    };
  }
}

/**
 * Create a default health check instance with common checks
 */
function createDefaultHealthCheck() {
  const healthCheck = new HealthCheck();
  
  // Add default checks
  healthCheck.addCheck('database', () => healthCheck.checkDatabase());
  healthCheck.addCheck('memory', () => healthCheck.checkMemory());
  healthCheck.addCheck('uptime', () => healthCheck.checkUptime());
  
  // Add HTTP check if not in test environment
  if (process.env.NODE_ENV !== 'test') {
    healthCheck.addCheck('http', () => healthCheck.checkHttpEndpoint());
  }
  
  return healthCheck;
}

/**
 * Standalone health check function for Docker
 */
async function runHealthCheck() {
  const healthCheck = createDefaultHealthCheck();
  
  try {
    const status = await healthCheck.runChecks();
    
    if (status.healthy) {
      console.log('Health check passed');
      process.exit(0);
    } else {
      console.error('Health check failed:', JSON.stringify(status, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('Health check error:', error.message);
    process.exit(1);
  }
}

// Run health check if this file is executed directly
if (require.main === module) {
  runHealthCheck();
}

module.exports = {
  HealthCheck,
  createDefaultHealthCheck,
  runHealthCheck
};
