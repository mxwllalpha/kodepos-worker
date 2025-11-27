# 📊 Application Monitoring & Logging

**Comprehensive Monitoring Suite for Kodepos API Applications**

This directory provides a complete monitoring solution for tracking Kodepos API integration performance, errors, and application health in production environments.

## 📁 Monitoring Components

### 🎯 **Core Monitoring**
- **[Application Monitor](./application-monitor.js)** - Real-time application health monitoring
- **[API Performance Monitor](./api-monitor.js)** - API request tracking and performance metrics
- **[Error Tracker](./error-tracker.js)** - Comprehensive error logging and alerting
- **[Health Checker](./health-checker.js)** - System health status and dependencies

### 📈 **Analytics & Reporting**
- **[Metrics Collector](./metrics-collector.js)** - Collect and aggregate performance metrics
- **[Report Generator](./report-generator.js)** - Generate monitoring reports and dashboards
- **[Alert System](./alert-system.js)** - Configurable alerting and notifications
- **[Dashboard Server](./dashboard/)** - Real-time monitoring dashboard

### 🔧 **Logging & Observability**
- **[Structured Logger](./structured-logger.js)** - JSON-structured logging for easy parsing
- **[Log Aggregator](./log-aggregator.js)** - Centralized log collection and filtering
- **[Performance Logger](./performance-logger.js)** - Performance metrics logging
- **[Audit Logger](./audit-logger.js)** - Security and compliance logging

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Basic Setup
```javascript
const { ApplicationMonitor } = require('./application-monitor');
const { APIMonitor } = require('./api-monitor');
const { ErrorTracker } = require('./error-tracker');

// Initialize monitoring
const appMonitor = new ApplicationMonitor();
const apiMonitor = new APIMonitor();
const errorTracker = new ErrorTracker();

// Start monitoring
appMonitor.start();
apiMonitor.start();
errorTracker.start();
```

### Configuration
```bash
# .env file for monitoring
MONITORING_PORT=3001
MONITORING_INTERVAL=5000
MONITORING_LOG_LEVEL=info
MONITORING_ALERT_EMAIL=admin@yourapp.com
MONITORING_WEBHOOK_URL=https://your-webhook-url.com
```

## 📊 Monitoring Metrics

### Application Health Metrics
- **CPU Usage**: Process and system CPU utilization
- **Memory Usage**: Heap and memory usage statistics
- **Response Time**: API response time percentiles
- **Error Rate**: Error frequency and types
- **Uptime**: Application availability and downtime
- **Load Average**: System load and resource pressure

### API Performance Metrics
- **Request Count**: Total and concurrent requests
- **Response Times**: P50, P95, P99 response times
- **Cache Hit Rate**: Cache effectiveness metrics
- **Throughput**: Requests per second
- **Status Codes**: HTTP status code distribution
- **Endpoint Performance**: Individual endpoint metrics

### Error Tracking Metrics
- **Error Count**: Total errors by type and severity
- **Error Rate**: Errors per request/second
- **Error Trends**: Error frequency over time
- **Error Sources**: Origin and context of errors
- **Recovery Rate**: Error resolution and recovery

## 🎯 Core Monitoring Components

### 1. Application Monitor
```javascript
// application-monitor.js
class ApplicationMonitor {
  constructor(config = {}) {
    this.config = {
      interval: config.interval || 5000,
      metrics: config.metrics || ['cpu', 'memory', 'uptime'],
      alerts: config.alerts || {},
      ...config
    };

    this.metrics = {};
    this.alerts = new Map();
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.interval = setInterval(() => {
      this.collectMetrics();
      this.checkAlerts();
    }, this.config.interval);

    console.log('📊 Application Monitor started');
  }

  async collectMetrics() {
    const startTime = Date.now();

    // CPU Usage
    const cpuUsage = process.cpuUsage();
    this.metrics.cpu = {
      user: cpuUsage.user,
      system: cpuUsage.system,
      percentage: this.calculateCPUPercentage(cpuUsage)
    };

    // Memory Usage
    const memoryUsage = process.memoryUsage();
    this.metrics.memory = {
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external,
      rss: memoryUsage.rss
    };

    // Uptime
    this.metrics.uptime = {
      process: process.uptime(),
      system: os.uptime()
    };

    // Response Time (if API monitor is available)
    if (global.apiMonitor) {
      const apiMetrics = global.apiMonitor.getMetrics();
      this.metrics.api = apiMetrics;
    }

    const collectionTime = Date.now() - startTime;
    this.metrics.lastCollection = collectionTime;
  }

  calculateCPUPercentage(cpuUsage) {
    const total = cpuUsage.user + cpuUsage.system;
    return (total / 1000000) * 100; // Convert to percentage
  }

  checkAlerts() {
    const alerts = this.config.alerts;

    // CPU Alert
    if (this.metrics.cpu && this.metrics.cpu.percentage > alerts.cpuThreshold) {
      this.triggerAlert('high_cpu', `CPU usage is ${this.metrics.cpu.percentage.toFixed(2)}%`);
    }

    // Memory Alert
    if (this.metrics.memory && this.metrics.memory.heapUsed > alerts.memoryThreshold) {
      this.triggerAlert('high_memory', `Memory usage is ${(this.metrics.memory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  triggerAlert(type, message) {
    const alert = {
      type,
      message,
      timestamp: new Date().toISOString(),
      metrics: { ...this.metrics }
    };

    this.alerts.set(Date.now(), alert);

    // Log alert
    console.warn(`🚨 ${type.toUpperCase()}: ${message}`);

    // Send notification
    this.sendNotification(alert);
  }
}
```

### 2. API Performance Monitor
```javascript
// api-monitor.js
class APIMonitor {
  constructor(config = {}) {
    this.config = {
      sampleRate: config.sampleRate || 1.0, // Sample all requests
      maxSamples: config.maxSamples || 10000,
      percentiles: config.percentiles || [50, 95, 99],
      ...config
    };

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      statusCodes: {},
      endpoints: {},
      cacheHits: 0,
      cacheMisses: 0
    };

    this.startTime = Date.now();
  }

  start() {
    // Intercept API calls
    this.interceptAPI();
    console.log('📡 API Monitor started');
  }

  interceptAPI() {
    const originalFetch = global.fetch;

    global.fetch = async (url, options = {}) => {
      if (Math.random() > this.config.sampleRate) {
        return originalFetch(url, options);
      }

      const startTime = Date.now();
      const endpoint = this.extractEndpoint(url);
      const method = options.method || 'GET';

      try {
        const response = await originalFetch(url, options);
        const responseTime = Date.now() - startTime;

        this.recordRequest(endpoint, method, response, responseTime, false);
        return response;
      } catch (error) {
        const responseTime = Date.now() - startTime;
        this.recordRequest(endpoint, method, null, responseTime, true, error);
        throw error;
      }
    };
  }

  recordRequest(endpoint, method, response, responseTime, isError, error = null) {
    this.metrics.totalRequests++;

    if (isError) {
      this.metrics.failedRequests++;
    } else {
      this.metrics.successfulRequests++;
    }

    // Record response time
    this.metrics.responseTimes.push(responseTime);

    // Maintain response time array size
    if (this.metrics.responseTimes.length > this.config.maxSamples) {
      this.metrics.responseTimes.shift();
    }

    // Track by endpoint
    if (!this.metrics.endpoints[endpoint]) {
      this.metrics.endpoints[endpoint] = {
        requests: 0,
        responseTimes: [],
        statusCodes: {}
      };
    }

    const endpointMetrics = this.metrics.endpoints[endpoint];
    endpointMetrics.requests++;
    endpointMetrics.responseTimes.push(responseTime);

    if (endpointMetrics.responseTimes.length > this.config.maxSamples) {
      endpointMetrics.responseTimes.shift();
    }

    // Status codes
    if (response) {
      const statusCode = response.status;
      this.metrics.statusCodes[statusCode] = (this.metrics.statusCodes[statusCode] || 0) + 1;
      endpointMetrics.statusCodes[statusCode] = (endpointMetrics.statusCodes[statusCode] || 0) + 1;
    }

    // Cache headers
    if (response) {
      const cacheStatus = response.headers.get('x-cache-status');
      if (cacheStatus === 'HIT') {
        this.metrics.cacheHits++;
      } else if (cacheStatus === 'MISS') {
        this.metrics.cacheMisses++;
      }
    }
  }

  extractEndpoint(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch (e) {
      return url;
    }
  }

  getMetrics() {
    const responseTimeStats = this.calculatePercentiles(this.metrics.responseTimes);
    const uptime = (Date.now() - this.startTime) / 1000;

    return {
      totalRequests: this.metrics.totalRequests,
      successRate: this.metrics.totalRequests > 0
        ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
        : 100,
      errorRate: this.metrics.totalRequests > 0
        ? (this.metrics.failedRequests / this.metrics.totalRequests) * 100
        : 0,
      responseTime: responseTimeStats,
      cacheHitRate: this.metrics.cacheHits + this.metrics.cacheMisses > 0
        ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100
        : 0,
      statusCodes: this.metrics.statusCodes,
      endpoints: this.metrics.endpoints,
      uptime: uptime
    };
  }

  calculatePercentiles(values) {
    if (values.length === 0) return {};

    const sorted = [...values].sort((a, b) => a - b);
    const result = {};

    this.config.percentiles.forEach(percentile => {
      const index = Math.ceil((percentile / 100) * sorted.length) - 1;
      result[percentile] = sorted[index];
    });

    result.average = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    result.min = sorted[0];
    result.max = sorted[sorted.length - 1];

    return result;
  }
}
```

### 3. Error Tracker
```javascript
// error-tracker.js
class ErrorTracker {
  constructor(config = {}) {
    this.config = {
      maxErrors: config.maxErrors || 1000,
      alertThreshold: config.alertThreshold || 10,
      alertWindow: config.alertWindow || 60000, // 1 minute
      ...config
    };

    this.errors = [];
    this.errorCounts = new Map();
    this.recentErrors = new Map();
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Intercept global error handlers
    process.on('uncaughtException', this.handleUncaughtException.bind(this));
    process.on('unhandledRejection', this.handleUnhandledRejection.bind(this));

    console.log('🚨 Error Tracker started');
  }

  handleUncaughtException(error) {
    this.recordError({
      type: 'uncaughtException',
      error,
      timestamp: new Date(),
      stack: error.stack,
      message: error.message
    });
  }

  handleUnhandledRejection(reason, promise) {
    this.recordError({
      type: 'unhandledRejection',
      error: reason,
      promise,
      timestamp: new Date(),
      message: reason?.message || 'Unhandled rejection'
    });
  }

  recordError(errorData) {
    const error = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      ...errorData,
      context: this.getContext()
    };

    this.errors.push(error);

    // Maintain error array size
    if (this.errors.length > this.config.maxErrors) {
      this.errors.shift();
    }

    // Track error counts
    const errorKey = this.getErrorKey(error);
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

    // Track recent errors for alerting
    const recentKey = `${errorKey}-${Math.floor(error.timestamp.getTime() / this.config.alertWindow)}`;
    this.recentErrors.set(recentKey, (this.recentErrors.get(recentKey) || 0) + 1);

    // Check alert conditions
    this.checkAlerts();

    // Log error
    console.error('🚨 Error tracked:', {
      type: error.type,
      message: error.message,
      count: this.errorCounts.get(errorKey)
    });
  }

  getErrorKey(error) {
    return `${error.type}:${error.message}`;
  }

  getContext() {
    return {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      platform: process.platform,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    };
  }

  checkAlerts() {
    const now = Date.now();
    const alertWindow = this.config.alertWindow;
    const alertThreshold = this.config.alertThreshold;

    // Check recent error counts
    for (const [key, count] of this.recentErrors.entries()) {
      if (count >= alertThreshold) {
        const [errorType] = key.split('-');
        this.triggerAlert(errorType, count);
        this.recentErrors.delete(key);
      }
    }
  }

  triggerAlert(errorType, count) {
    const alert = {
      type: 'error_spike',
      errorType,
      count,
      timestamp: new Date(),
      message: `Error spike detected: ${count} ${errorType} errors`
    };

    console.warn('🚨 Error Alert:', alert.message);
    this.sendNotification(alert);
  }

  getErrorSummary() {
    const summary = {
      totalErrors: this.errors.length,
      errorTypes: {},
      recentErrors: [],
      topErrors: []
    };

    // Group by error type
    for (const [key, count] of this.errorCounts.entries()) {
      const [type, message] = key.split(':');
      summary.errorTypes[type] = {
        message,
        count,
        percentage: (count / this.errors.length) * 100
      };
    }

    // Get recent errors (last 10 minutes)
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    summary.recentErrors = this.errors
      .filter(error => error.timestamp.getTime() > tenMinutesAgo)
      .slice(-10);

    // Top errors
    summary.topErrors = Array.from(this.errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, count]) => ({ key, count }));

    return summary;
  }
}
```

## 📈 Monitoring Dashboard

### Dashboard Server
```javascript
// dashboard/server.js
const express = require('express');
const { ApplicationMonitor } = require('../application-monitor');
const { APIMonitor } = require('../api-monitor');
const { ErrorTracker } = require('../error-tracker');

const app = express();
const port = process.env.MONITORING_PORT || 3001;

// Initialize monitors
const appMonitor = new ApplicationMonitor();
const apiMonitor = new APIMonitor();
const errorTracker = new ErrorTracker();

// Start monitoring
appMonitor.start();
apiMonitor.start();
errorTracker.start();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.get('/api/metrics', (req, res) => {
  res.json({
    application: appMonitor.metrics,
    api: apiMonitor.getMetrics(),
    errors: errorTracker.getErrorSummary(),
    timestamp: new Date()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date()
  });
});

app.get('/api/errors', (req, res) => {
  res.json(errorTracker.getErrorSummary());
});

app.post('/api/alerts', (req, res) => {
  console.log('Received alert:', req.body);
  res.json({ status: 'received' });
});

// Start server
app.listen(port, () => {
  console.log(`📊 Monitoring Dashboard running on http://localhost:${port}`);
});
```

### Dashboard HTML
```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monitoring Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .chart { width: 100%; height: 300px; margin: 20px 0; }
        .status { display: inline-block; padding: 5px 10px; border-radius: 3px; }
        .status.healthy { background: #28a745; color: white; }
        .status.warning { background: #ffc107; color: black; }
        .status.error { background: #dc3545; color: white; }
    </style>
</head>
<body>
    <h1>📊 Kodepos API Monitoring Dashboard</h1>

    <div class="metric">
        <h3>System Health</h3>
        <div id="system-health">Loading...</div>
    </div>

    <div class="metric">
        <h3>API Performance</h3>
        <canvas id="api-chart" class="chart"></canvas>
    </div>

    <div class="metric">
        <h3>Response Times</h3>
        <canvas id="response-chart" class="chart"></canvas>
    </div>

    <div class="metric">
        <h3>Recent Errors</h3>
        <div id="recent-errors">Loading...</div>
    </div>

    <script>
        let apiChart, responseChart;

        async function loadMetrics() {
            try {
                const response = await fetch('/api/metrics');
                const data = await response.json();

                updateSystemHealth(data);
                updateAPIChart(data.api);
                updateResponseChart(data.api);
                updateErrors(data.errors);
            } catch (error) {
                console.error('Failed to load metrics:', error);
            }
        }

        function updateSystemHealth(data) {
            const healthDiv = document.getElementById('system-health');
            const cpuUsage = data.application?.cpu?.percentage || 0;
            const memoryUsage = data.application?.memory?.heapUsed || 0;

            healthDiv.innerHTML = `
                <p>CPU Usage: ${cpuUsage.toFixed(2)}%</p>
                <p>Memory Usage: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB</p>
                <p>Uptime: ${Math.floor(data.application?.uptime?.process / 60)} minutes</p>
                <p>API Requests: ${data.api?.totalRequests || 0}</p>
                <span class="status healthy">Healthy</span>
            `;
        }

        function updateAPIChart(apiData) {
            const ctx = document.getElementById('api-chart').getContext('2d');

            if (apiChart) {
                apiChart.destroy();
            }

            apiChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Array.from({length: 20}, (_, i) => i),
                    datasets: [{
                        label: 'Requests per Second',
                        data: Array.from({length: 20}, () => Math.random() * 10),
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        function updateResponseChart(apiData) {
            const ctx = document.getElementById('response-chart').getContext('2d');

            if (responseChart) {
                responseChart.destroy();
            }

            responseChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['P50', 'P95', 'P99', 'Average'],
                    datasets: [{
                        label: 'Response Time (ms)',
                        data: [
                            apiData.responseTime?.p50 || 0,
                            apiData.responseTime?.p95 || 0,
                            apiData.responseTime?.p99 || 0,
                            apiData.responseTime?.average || 0
                        ],
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(75, 192, 192, 0.2)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        function updateErrors(errors) {
            const errorsDiv = document.getElementById('recent-errors');

            if (errors.recentErrors.length === 0) {
                errorsDiv.innerHTML = '<p>No recent errors</p>';
                return;
            }

            errorsDiv.innerHTML = errors.recentErrors.slice(0, 5).map(error => `
                <div style="margin: 10px 0; padding: 10px; background: #fff3cd; border-radius: 3px;">
                    <strong>${error.type}:</strong> ${error.message}<br>
                    <small>${new Date(error.timestamp).toLocaleString()}</small>
                </div>
            `).join('');
        }

        // Auto-refresh
        setInterval(loadMetrics, 5000);
        loadMetrics(); // Initial load
    </script>
</body>
</html>
```

## 🚨 Alert System

### Alert Configuration
```javascript
// alert-system.js
class AlertSystem {
  constructor(config = {}) {
    this.config = {
      email: config.email,
      webhook: config.webhook,
      slack: config.slack,
      thresholds: config.thresholds || {},
      ...config
    };

    this.alerts = [];
    this.alertHistory = new Map();
  }

  async sendAlert(alert) {
    this.alerts.push(alert);

    // Send to configured channels
    const promises = [];

    if (this.config.email) {
      promises.push(this.sendEmail(alert));
    }

    if (this.config.webhook) {
      promises.push(this.sendWebhook(alert));
    }

    if (this.config.slack) {
      promises.push(this.sendSlack(alert));
    }

    await Promise.all(promises);
    this.logAlert(alert);
  }

  async sendEmail(alert) {
    // Implement email sending logic
    console.log(`📧 Sending email alert for: ${alert.message}`);
    // Use nodemailer or similar
  }

  async sendWebhook(alert) {
    try {
      await fetch(this.config.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });
      console.log(`🌐 Webhook alert sent: ${alert.message}`);
    } catch (error) {
      console.error('Webhook alert failed:', error);
    }
  }

  async sendSlack(alert) {
    // Implement Slack webhook
    const payload = {
      text: `🚨 ${alert.type.toUpperCase()}`,
      attachments: [{
        color: 'danger',
        text: alert.message,
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    await fetch(this.config.slack, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  logAlert(alert) {
    const alertKey = `${alert.type}-${alert.timestamp.toISOString()}`;
    this.alertHistory.set(alertKey, alert);

    // Keep only last 1000 alerts
    if (this.alertHistory.size > 1000) {
      const oldestKey = this.alertHistory.keys().next().value;
      this.alertHistory.delete(oldestKey);
    }
  }

  getAlertHistory(type = null) {
    if (!type) {
      return Array.from(this.alertHistory.values());
    }

    return Array.from(this.alertHistory.values())
      .filter(alert => alert.type === type);
  }
}
```

## 🔧 Integration Examples

### Express.js Integration
```javascript
// server.js
const express = require('express');
const { ApplicationMonitor } = require('./monitoring/application-monitor');
const { APIMonitor } = require('./monitoring/api-monitor');
const { ErrorTracker } = require('./monitoring/error-tracker');

const app = express();

// Initialize monitoring
const appMonitor = new ApplicationMonitor();
const apiMonitor = new APIMonitor();
const errorTracker = new ErrorTracker();

// Start monitoring
appMonitor.start();
apiMonitor.start();
errorTracker.start();

// Your API routes
app.use('/api/search', require('./routes/search'));
app.use('/api/detect', require('./routes/detect'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    monitors: {
      application: appMonitor.metrics ? 'running' : 'stopped',
      api: apiMonitor.metrics ? 'running' : 'stopped',
      errors: errorTracker.errors.length
    }
  });
});

// Monitoring endpoint
app.get('/monitoring/metrics', (req, res) => {
  res.json({
    application: appMonitor.metrics,
    api: apiMonitor.getMetrics(),
    errors: errorTracker.getErrorSummary()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`📊 Monitoring available at http://localhost:${PORT}/monitoring/metrics`);
});
```

## 📊 Best Practices

### Monitoring Setup
1. **Monitor early**: Start monitoring from development
2. **Set meaningful thresholds**: Define clear performance baselines
3. **Monitor dependencies**: Track external service health
4. **Use structured logging**: JSON format for easy parsing
5. **Implement alerts**: Proactive notification of issues

### Performance Monitoring
1. **Track key metrics**: Response times, error rates, throughput
2. **Monitor percentiles**: P95, P99 for performance insights
3. **Track memory usage**: Prevent memory leaks
4. **Monitor cache performance**: Optimize cache effectiveness
5. **Track database queries**: Identify slow queries

### Error Monitoring
1. **Categorize errors**: Group by type and severity
2. **Track error trends**: Identify recurring issues
3. **Monitor error rates**: Set thresholds for alerts
4. **Capture context**: Include request context in error logs
5. **Implement error recovery**: Automated recovery mechanisms

---

**Last Updated**: November 26, 2025
**Version**: 1.0.0
**License**: MIT