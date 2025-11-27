# 📊 Performance Testing & Benchmarking

**Performance Testing Suite for Kodepos API Integration**

This directory contains comprehensive performance testing tools and benchmarking scripts for evaluating Kodepos API integrations across different scenarios and load conditions.

## 📁 Performance Test Categories

### 🚀 **Quick Performance Tests**
- **[Basic Performance](./basic-performance.js)** - Single endpoint response time testing
- **[Load Testing](./load-test.js)** - Simulate concurrent users
- **[Stress Testing](./stress-test.js)** - Push to breaking point
- **[Cache Testing](./cache-test.js)** - Evaluate cache effectiveness

### 🔬 **Advanced Benchmarks**
- **[Endurance Testing](./endurance-test.js)** - Long-running stability tests
- **[Spike Testing](./spike-test.js)** - Sudden traffic surges
- **[Integration Testing](./integration-test.js)** - Full application testing
- **[Regression Testing](./regression-test.js)** - Performance regression detection

### 📈 **Analysis Tools**
- **[Performance Dashboard](./dashboard/)** - Real-time performance metrics
- **[Report Generator](./report-generator.js)** - Comprehensive performance reports
- **[Comparison Tool](./compare.js)** - Compare performance across different implementations

## 🎯 Quick Start

### Install Dependencies
```bash
npm install
```

### Run Basic Performance Test
```bash
# Test search endpoint response times
node basic-performance.js --endpoint=/search --iterations=100

# Test with specific parameters
node basic-performance.js --endpoint=/api/v1/search --params="provinsi=DKI Jakarta" --iterations=50
```

### Run Load Testing
```bash
# Simulate 10 concurrent users for 1 minute
node load-test.js --users=10 --duration=60 --endpoint=/search

# Test advanced search with authentication
node load-test.js --users=5 --duration=30 --endpoint=/api/v1/search --auth
```

### Generate Performance Report
```bash
# Generate HTML report from test results
node report-generator.js --input=results.json --output=performance-report.html

# Compare multiple test runs
node compare.js --baseline=baseline.json --current=current.json
```

## 📊 Test Configuration

### Environment Setup
```bash
# .env file for performance testing
KODEPOS_API_URL=https://your-api.workers.dev
KODEPOS_API_KEY=your_api_key_here
TEST_TIMEOUT=30000
TEST_CONCURRENT_LIMIT=50
TEST_CACHE_TTL=3600
```

### Test Scenarios
```javascript
// Common test scenarios
const scenarios = {
  search: {
    name: "Search Performance",
    endpoint: "/search",
    params: { q: "Jakarta" },
    iterations: 100,
    concurrent: 10
  },
  detect: {
    name: "Location Detection",
    endpoint: "/detect",
    params: { latitude: -6.2088, longitude: 106.8456 },
    iterations: 50,
    concurrent: 5
  },
  advancedSearch: {
    name: "Advanced Search",
    endpoint: "/api/v1/search",
    params: { provinsi: "DKI Jakarta", kota: "Jakarta Pusat" },
    iterations: 30,
    concurrent: 3,
    auth: true
  },
  nearby: {
    name: "Nearby Search",
    endpoint: "/api/v1/nearby",
    params: { latitude: -6.2088, longitude: 106.8456, radius: 5 },
    iterations: 20,
    concurrent: 2,
    auth: true
  }
};
```

## 🔧 Performance Metrics

### Key Metrics Tracked
- **Response Time**: Average, median, min, max, percentiles
- **Throughput**: Requests per second (RPS)
- **Error Rate**: Failed requests percentage
- **Resource Usage**: Memory, CPU, network usage
- **Cache Hit Rate**: Cache effectiveness
- **Success Rate**: Successful response percentage

### Performance Standards
```javascript
// Performance thresholds (in milliseconds)
const thresholds = {
  excellent: 50,
  good: 100,
  fair: 200,
  poor: 500,
  critical: 1000
};

// Success rate thresholds
const successThresholds = {
  excellent: 99.9,
  good: 99.0,
  fair: 95.0,
  poor: 90.0
};
```

## 📈 Test Results Analysis

### Sample Performance Report
```json
{
  "test": "Search Performance Test",
  "timestamp": "2025-11-26T10:00:00Z",
  "config": {
    "iterations": 100,
    "concurrent": 10,
    "endpoint": "/search"
  },
  "results": {
    "responseTime": {
      "average": 45.2,
      "median": 42.1,
      "min": 28.5,
      "max": 156.3,
      "p95": 78.9,
      "p99": 125.4
    },
    "throughput": {
      "rps": 221.8,
      "totalRequests": 100,
      "duration": 450.8
    },
    "successRate": {
      "percentage": 99.0,
      "successes": 99,
      "failures": 1
    },
    "cache": {
      "hitRate": 85.2,
      "cacheHits": 85,
      "cacheMisses": 15
    }
  },
  "grade": "A",
  "recommendations": [
    "Excellent performance achieved",
    "Consider increasing cache TTL for better hit rates",
    "Monitor for memory leaks during sustained loads"
  ]
}
```

## 🧪 Advanced Testing Scenarios

### Cache Performance Testing
```javascript
// Test cache effectiveness
async function testCachePerformance() {
  const results = {
    cacheHits: [],
    cacheMisses: [],
    hitRate: 0,
    totalRequests: 0
  };

  // Test with repeated identical requests
  for (let i = 0; i < 50; i++) {
    const response = await apiClient.get('/search?q=Jakarta');
    if (response.headers.get('x-cache-status') === 'HIT') {
      results.cacheHits.push(responseTime);
    } else {
      results.cacheMisses.push(responseTime);
    }
    results.totalRequests++;
  }

  results.hitRate = (results.cacheHits.length / results.totalRequests) * 100;

  return results;
}
```

### Endurance Testing
```javascript
// Long-running stability test
async function enduranceTest(durationMinutes = 60) {
  const startTime = Date.now();
  const endTime = startTime + (durationMinutes * 60 * 1000);
  const results = {
    totalRequests: 0,
    errors: 0,
    responseTimes: [],
    memoryUsage: []
  };

  while (Date.now() < endTime) {
    try {
      const responseTime = await measureResponseTime('/search');
      results.responseTimes.push(responseTime);
      results.totalRequests++;

      // Monitor memory usage
      if (results.totalRequests % 100 === 0) {
        const memory = process.memoryUsage();
        results.memoryUsage.push({
          requests: results.totalRequests,
          heapUsed: memory.heapUsed,
          heapTotal: memory.heapTotal
        });
      }
    } catch (error) {
      results.errors++;
    }

    // Wait before next request
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}
```

## 🚨 Performance Monitoring

### Real-time Dashboard
```bash
# Start real-time performance dashboard
node dashboard/server.js

# Access at http://localhost:3000
```

### Monitoring Features
- **Live Metrics**: Real-time response times and throughput
- **Historical Data**: Performance trends over time
- **Alerts**: Email/Slack notifications for performance degradation
- **Visualizations**: Interactive charts and graphs

### Alert Configuration
```javascript
// Performance alert thresholds
const alerts = {
  responseTime: {
    warning: 200,
    critical: 500
  },
  errorRate: {
    warning: 1.0,
    critical: 5.0
  },
  throughput: {
    warning: 50,
    critical: 20
  }
};

// Alert notification
function sendAlert(metric, value, threshold) {
  console.log(`🚨 Performance Alert: ${metric} is ${value}, threshold: ${threshold}`);
  // Implement email/Slack notification
}
```

## 📋 Test Scripts

### 1. Basic Performance Test
```javascript
// basic-performance.js
const { performance } = require('perf_hooks');
const axios = require('axios');

async function testEndpoint(endpoint, iterations = 100) {
  const results = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    try {
      await axios.get(endpoint);
      const end = performance.now();
      results.push(end - start);
    } catch (error) {
      console.error(`Request failed: ${error.message}`);
    }
  }

  return analyzeResults(results);
}

function analyzeResults(results) {
  const sorted = results.sort((a, b) => a - b);
  return {
    average: results.reduce((a, b) => a + b, 0) / results.length,
    median: sorted[Math.floor(sorted.length / 2)],
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
    total: results.length
  };
}
```

### 2. Load Testing
```javascript
// load-test.js
const axios = require('axios');
const { EventEmitter } = require('events');

class LoadTest extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.results = [];
    this.activeRequests = 0;
  }

  async run() {
    const { users, duration, endpoint } = this.config;
    const startTime = Date.now();
    const endTime = startTime + (duration * 1000);

    // Start concurrent users
    const userPromises = [];
    for (let i = 0; i < users; i++) {
      userPromises.push(this.startUser(endpoint, startTime, endTime));
    }

    await Promise.all(userPromises);
    return this.generateReport();
  }

  async startUser(endpoint, startTime, endTime) {
    while (Date.now() < endTime) {
      try {
        const responseTime = await this.measureRequest(endpoint);
        this.results.push(responseTime);
        this.activeRequests++;

        // Simulate user think time
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      } catch (error) {
        this.emit('error', error);
      }
    }
  }

  async measureRequest(endpoint) {
    const start = Date.now();
    await axios.get(endpoint);
    return Date.now() - start;
  }
}
```

### 3. Report Generator
```javascript
// report-generator.js
const fs = require('fs');
const path = require('path');

function generateReport(testResults) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { background: #f5f5f5; padding: 10px; margin: 5px 0; border-radius: 5px; }
        .chart { width: 100%; height: 300px; }
        .good { color: green; }
        .warning { color: orange; }
        .bad { color: red; }
    </style>
</head>
<body>
    <h1>Performance Test Report</h1>
    <p><strong>Test:</strong> ${testResults.test}</p>
    <p><strong>Date:</strong> ${new Date(testResults.timestamp).toLocaleString()}</p>

    <div class="metric">
        <h3>Response Times (ms)</h3>
        <p>Average: <span class="${getGrade(testResults.results.responseTime.average)}">${testResults.results.responseTime.average.toFixed(2)}</span></p>
        <p>Median: <span class="${getGrade(testResults.results.responseTime.median)}">${testResults.results.responseTime.median.toFixed(2)}</span></p>
        <p>P95: <span class="${getGrade(testResults.results.responseTime.p95)}">${testResults.results.responseTime.p95.toFixed(2)}</span></p>
        <p>P99: <span class="${getGrade(testResults.results.responseTime.p99)}">${testResults.results.responseTime.p99.toFixed(2)}</span></p>
    </div>

    <div class="metric">
        <h3>Throughput</h3>
        <p>RPS: ${testResults.results.throughput.rps.toFixed(2)}</p>
        <p>Total Requests: ${testResults.results.totalRequests}</p>
    </div>

    <div class="metric">
        <h3>Success Rate</h3>
        <p>Success Rate: <span class="${getGrade(testResults.results.successRate.percentage)}">${testResults.results.successRate.percentage.toFixed(1)}%</span></p>
        <p>Errors: ${testResults.results.successRate.failures}</p>
    </div>

    <div class="metric">
        <h3>Recommendations</h3>
        <ul>
            ${testResults.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>`;

  fs.writeFileSync('performance-report.html', html);
}

function getGrade(value) {
  if (value < 100) return 'good';
  if (value < 200) return 'warning';
  return 'bad';
}
```

## 🔍 Troubleshooting Performance Issues

### Common Performance Problems
1. **High Response Times**: Check network latency and server load
2. **Low Throughput**: Identify bottlenecks in API calls
3. **Memory Leaks**: Monitor memory usage during endurance tests
4. **Cache Inefficiency**: Analyze cache hit rates
5. **Connection Issues**: Test network connectivity and timeouts

### Debug Commands
```bash
# Check system resources during test
top -p $(pgrep -f load-test.js)

# Monitor network activity
iftop -i eth0

# Profile memory usage
node --inspect --inspect-brk load-test.js
```

## 📚 Best Practices

### Test Planning
- Test in production-like environments
- Use realistic data and parameters
- Monitor system resources during tests
- Test different user loads and scenarios

### Test Execution
- Run tests multiple times for statistical significance
- Monitor both application and system performance
- Document all test conditions and results
- Set up alerts for performance degradation

### Test Analysis
- Compare results with baseline performance
- Identify trends and patterns
- Document performance regressions
- Provide actionable recommendations

---

**Last Updated**: November 26, 2025
**Version**: 1.0.0
**License**: MIT