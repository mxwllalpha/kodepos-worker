# Troubleshooting Guide

**Kodepos API Indonesia - Common Issues and Solutions**

*Author: Maxwell Alpha (https://github.com/mxwllalpha) - mxwllalpha@gmail.com*
*Version: 1.0.0*

---

## 🔍 Quick Diagnosis

### Self-Service Health Check

Start by checking the API health status:

```bash
# Basic health check
curl "https://your-api.workers.dev/health"

# Detailed health check
curl "https://your-api.workers.dev/health/detailed"
```

**Expected Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-11-26T04:38:00.000Z",
  "database": "connected",
  "total_records": 83761,
  "cache_enabled": true
}
```

If health check fails, proceed to the appropriate section below.

---

## 🚨 Common Issues and Solutions

### 1. No Results Found

**Problem:** API returns empty results or "No results found"

**Possible Causes:**
- Invalid search query
- Misspelled location names
- Coordinates outside Indonesian bounds
- Database connectivity issues

**Solutions:**

#### Check Search Query Validity
```bash
# Test with simple, common location names
curl "https://your-api.workers.dev/search?q=Jakarta"
curl "https://your-api.workers.dev/search?q=Surabaya"
curl "https://your-api.workers.dev/search?q=Bali"
```

#### Validate Indonesian Coordinates
```bash
# Test with known Indonesian coordinates
curl "https://your-api.workers.dev/detect?latitude=-6.2088&longitude=106.8456"  # Jakarta
curl "https://your-api.workers.dev/detect?latitude=-7.2575&longitude=112.7521"  # Surabaya
curl "https://your-api.workers.dev/detect?latitude=-8.3405&longitude=115.0920"  # Bali
```

**Indonesian Coordinate Bounds:**
- **Latitude**: -11 to 6 degrees
- **Longitude**: 95 to 141 degrees

#### Debug Search Issues
```javascript
// JavaScript debugging function
async function debugSearch(query) {
  try {
    console.log(`Searching for: "${query}"`);

    const response = await fetch(`https://your-api.workers.dev/search?q=${encodeURIComponent(query)}`);
    console.log(`Response status: ${response.status}`);

    const data = await response.json();
    console.log('Response data:', data);

    if (data.statusCode === 404) {
      console.log('No results found. Try:');
      console.log('- Different spelling variations');
      console.log('- More general search terms');
      console.log('- Use administrative names (e.g., "Jakarta Pusat" instead of specific villages)');
    }

    return data;
  } catch (error) {
    console.error('Search error:', error);
    return null;
  }
}
```

### 2. Invalid Coordinates Error

**Problem:** API returns error for coordinates

**Common Issues:**
- Coordinates outside Indonesian bounds
- Invalid coordinate format
- Missing latitude/longitude parameters

**Solutions:**

#### Validate Coordinate Format
```bash
# Correct format (decimal degrees)
curl "https://your-api.workers.dev/detect?latitude=-6.2088&longitude=106.8456"

# Wrong format (should not use degrees, minutes, seconds)
# ❌ curl "https://your-api.workers.dev/detect?latitude=6°12'32"S&longitude=106°50'42"E"
```

#### Check Indonesian Bounds
```javascript
function validateIndonesianCoordinates(lat, lng) {
  const INDONESIA_BOUNDS = {
    minLat: -11,
    maxLat: 6,
    minLng: 95,
    maxLng: 141
  };

  const isValid = lat >= INDONESIA_BOUNDS.minLat &&
                 lat <= INDONESIA_BOUNDS.maxLat &&
                 lng >= INDONESIA_BOUNDS.minLng &&
                 lng <= INDONESIA_BOUNDS.maxLng;

  if (!isValid) {
    console.log(`Coordinates ${lat}, ${lng} are outside Indonesian bounds`);
    console.log(`Valid bounds: Lat ${INDONESIA_BOUNDS.minLat} to ${INDONESIA_BOUNDS.maxLat}`);
    console.log(`Valid bounds: Lng ${INDONESIA_BOUNDS.minLng} to ${INDONESIA_BOUNDS.maxLng}`);
  }

  return isValid;
}

// Test coordinates
console.log(validateIndonesianCoordinates(-6.2088, 106.8456)); // true (Jakarta)
console.log(validateIndonesianCoordinates(40.7128, -74.0060)); // false (New York)
```

### 3. Rate Limiting

**Problem:** Too many requests - HTTP 429 error

**Symptoms:**
- HTTP 429 Too Many Requests
- Slow response times
- Intermittent failures

**Solutions:**

#### Check Rate Limit Headers
```bash
# Make a request and check headers
curl -I "https://your-api.workers.dev/search?q=Jakarta"
```

**Look for these headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1638360000
```

#### Implement Request Throttling
```javascript
class RateLimitedAPIClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.requestQueue = [];
    this.isProcessing = false;
    this.maxRequestsPerMinute = 100;
    this.requestTimes = [];
  }

  async makeRequest(endpoint, params = {}) {
    // Check rate limit
    await this.waitForRateLimit();

    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    try {
      const response = await fetch(url);

      if (response.status === 429) {
        const resetTime = response.headers.get('X-RateLimit-Reset');
        const waitTime = resetTime ? (resetTime * 1000 - Date.now()) : 60000;

        console.log(`Rate limited. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));

        return this.makeRequest(endpoint, params);
      }

      return response;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  async waitForRateLimit() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove old request times
    this.requestTimes = this.requestTimes.filter(time => time > oneMinuteAgo);

    // Wait if at limit
    if (this.requestTimes.length >= this.maxRequestsPerMinute) {
      const oldestRequest = Math.min(...this.requestTimes);
      const waitTime = (oldestRequest + 60000) - now;

      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    this.requestTimes.push(now);
  }
}

// Usage
const api = new RateLimitedAPIClient('https://your-api.workers.dev');
const response = await api.makeRequest('/search', { q: 'Jakarta' });
```

### 4. Slow Response Times

**Problem:** API responses are slow (>500ms)

**Potential Causes:**
- Network connectivity issues
- High server load
- Cache misses
- Large result sets

**Solutions:**

#### Test API Performance
```bash
# Measure response time
curl -w "Time: %{time_total}s\n" "https://your-api.workers.dev/search?q=Jakarta"

# Test multiple requests
for i in {1..5}; do
  curl -w "Request $i: %{time_total}s\n" -o /dev/null "https://your-api.workers.dev/search?q=Jakarta"
done
```

#### Check Cache Status
```javascript
async function checkCachePerformance() {
  const testQuery = 'Jakarta';

  console.log('First request (cache miss):');
  const start1 = performance.now();
  const response1 = await fetch(`https://your-api.workers.dev/search?q=${testQuery}`);
  const time1 = performance.now() - start1;
  console.log(`Response time: ${time1}ms`);
  console.log(`Cache header: ${response1.headers.get('X-Cache')}`);

  console.log('\nSecond request (cache hit):');
  const start2 = performance.now();
  const response2 = await fetch(`https://your-api.workers.dev/search?q=${testQuery}`);
  const time2 = performance.now() - start2;
  console.log(`Response time: ${time2}ms`);
  console.log(`Cache header: ${response2.headers.get('X-Cache')}`);
}

checkCachePerformance();
```

#### Optimize Search Queries
```bash
# Less specific queries (faster)
curl "https://your-api.workers.dev/search?q=Jakarta"

# More specific queries (slower, more precise)
curl "https://your-api.workers.dev/search?q=Gambir"

# Use modern API with specific filters (faster for known data)
curl "https://your-api.workers.dev/api/v1/search?provinsi=DKI Jakarta&kota=Jakarta Pusat"
```

### 5. CORS Issues

**Problem:** Cross-origin requests blocked

**Symptoms:**
- Browser console CORS errors
- Requests blocked from web applications
- Failed API calls from frontend

**Solutions:**

#### Check CORS Headers
```bash
# Check CORS headers
curl -H "Origin: https://your-website.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     "https://your-api.workers.dev/search?q=test"
```

**Expected CORS Headers:**
```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

#### Fix Frontend CORS Issues
```javascript
// If you control the API, ensure CORS is properly configured
// If you don't control the API, use a proxy server

// Example proxy setup for development
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

app.use('/api', createProxyMiddleware({
  target: 'https://your-api.workers.dev',
  changeOrigin: true,
  pathRewrite: {
    '^/api': ''
  }
}));

app.listen(3001, () => {
  console.log('Proxy server running on port 3001');
});

// Then use from frontend: fetch('/api/search?q=Jakarta')
```

### 6. JSON Parsing Errors

**Problem:** Cannot parse API response

**Symptoms:**
- JSON parsing errors in client code
- Malformed response data
- Unexpected response format

**Solutions:**

#### Validate Response Format
```javascript
async function safeAPICall(endpoint) {
  try {
    const response = await fetch(`https://your-api.workers.dev${endpoint}`);

    // Check if response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON, got ${contentType}. Response: ${text.substring(0, 200)}`);
    }

    // Parse JSON safely
    const data = await response.json();
    return data;

  } catch (error) {
    console.error('API call failed:', error);

    // Return error-safe response
    return {
      statusCode: 500,
      code: 'ERROR',
      data: [],
      error: error.message
    };
  }
}

// Usage
const result = await safeAPICall('/search?q=Jakarta');
```

#### Debug Raw Response
```bash
# Get raw response to debug issues
curl "https://your-api.workers.dev/search?q=Jakarta" -v

# Check response headers
curl -I "https://your-api.workers.dev/search?q=Jakarta"

# Save response to file for inspection
curl "https://your-api.workers.dev/search?q=Jakarta" > response.json
```

---

## 🛠️ Development Environment Issues

### Local Development Setup

**Problem:** Issues running local development server

**Solutions:**

#### Check Prerequisites
```bash
# Check Node.js version (needs 18+)
node --version

# Check npm version
npm --version

# Check Wrangler CLI
npx wrangler --version
```

#### Fix Common Setup Issues
```bash
# Install dependencies
npm install

# Clean node_modules if issues persist
rm -rf node_modules package-lock.json
npm install

# Login to Cloudflare
npx wrangler auth login

# Verify authentication
npx wrangler whoami
```

#### Database Connection Issues
```bash
# Check database configuration
cat wrangler.toml | grep -A 5 "d1_databases"

# Test database connection
npx wrangler d1 info kodepos-db

# Apply migrations if needed
npx wrangler d1 migrations apply kodepos-db --remote
```

### Import Data Issues

**Problem:** Data import fails or incomplete

**Solutions:**

#### Check Data File
```bash
# Verify data file exists and is readable
ls -la data/kodepos.json
head -20 data/kodepos.json
wc -l data/kodepos.json

# Validate JSON format
python3 -m json.tool data/kodepos.json > /dev/null && echo "JSON is valid" || echo "JSON is invalid"
```

#### Debug Import Process
```bash
# Run import with verbose output
node scripts/import-data.js --verbose

# Check database after import
npx wrangler d1 execute kodepos-db --command="SELECT COUNT(*) as total FROM postal_codes" --remote
```

---

## 🔧 Advanced Troubleshooting

### Performance Analysis

#### Measure API Performance
```javascript
class PerformanceAnalyzer {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.metrics = [];
  }

  async measureRequest(endpoint, params = {}) {
    const url = new URL(`${this.apiUrl}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const startTime = performance.now();
    const startMemory = performance.memory?.usedJSHeapSize || 0;

    try {
      const response = await fetch(url);
      const endTime = performance.now();
      const endMemory = performance.memory?.usedJSHeapSize || 0;

      const metric = {
        endpoint,
        params,
        responseTime: endTime - startTime,
        memoryUsed: endMemory - startMemory,
        status: response.status,
        success: response.ok,
        timestamp: new Date().toISOString(),
        cacheHit: response.headers.get('X-Cache') === 'HIT'
      };

      this.metrics.push(metric);
      console.log('Request metric:', metric);

      return { response, metric };
    } catch (error) {
      const endTime = performance.now();
      const metric = {
        endpoint,
        params,
        responseTime: endTime - startTime,
        status: 'ERROR',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.metrics.push(metric);
      throw error;
    }
  }

  getAverageResponseTime() {
    const successfulRequests = this.metrics.filter(m => m.success);
    if (successfulRequests.length === 0) return 0;

    const total = successfulRequests.reduce((sum, m) => sum + m.responseTime, 0);
    return total / successfulRequests.length;
  }

  getCacheHitRate() {
    if (this.metrics.length === 0) return 0;
    const hits = this.metrics.filter(m => m.cacheHit).length;
    return (hits / this.metrics.length) * 100;
  }

  generateReport() {
    return {
      totalRequests: this.metrics.length,
      successRate: (this.metrics.filter(m => m.success).length / this.metrics.length) * 100,
      averageResponseTime: this.getAverageResponseTime(),
      cacheHitRate: this.getCacheHitRate(),
      errors: this.metrics.filter(m => !m.success),
      slowestRequests: this.metrics.sort((a, b) => b.responseTime - a.responseTime).slice(0, 5)
    };
  }
}

// Usage
const analyzer = new PerformanceAnalyzer('https://your-api.workers.dev');

// Measure multiple requests
await analyzer.measureRequest('/search', { q: 'Jakarta' });
await analyzer.measureRequest('/search', { q: 'Surabaya' });
await analyzer.measureRequest('/detect', { latitude: -6.2088, longitude: 106.8456 });

// Generate report
const report = analyzer.generateReport();
console.log('Performance Report:', report);
```

### Database Issues

#### Check Database Health
```javascript
async function checkDatabaseHealth() {
  try {
    // Test basic query
    const response = await fetch('https://your-api.workers.dev/health/detailed');
    const health = await response.json();

    console.log('Database Status:', health.database);
    console.log('Total Records:', health.total_records);
    console.log('Cache Enabled:', health.cache_enabled);

    // Test query performance
    const searchStart = performance.now();
    const searchResponse = await fetch('https://your-api.workers.dev/search?q=Jakarta');
    const searchEnd = performance.now();

    console.log('Search Response Time:', searchEnd - searchStart, 'ms');

    return health;
  } catch (error) {
    console.error('Database health check failed:', error);
    return null;
  }
}
```

### Network Connectivity Issues

#### Test Network Connectivity
```bash
# Test basic connectivity
ping your-api.workers.dev

# Test DNS resolution
nslookup your-api.workers.dev

# Test HTTP connectivity
curl -v https://your-api.workers.dev/health

# Test from different locations
curl https://your-api.workers.dev/health
curl https://your-api.workers.dev/health --resolve your-api.workers.dev:443:$(dig +short your-api.workers.dev)
```

#### Diagnose Network Issues
```javascript
async function diagnoseNetworkIssues() {
  const testUrls = [
    'https://your-api.workers.dev/health',
    'https://www.google.com',
    'https://httpbin.org/get'
  ];

  for (const url of testUrls) {
    console.log(`\nTesting ${url}:`);

    try {
      const startTime = performance.now();
      const response = await fetch(url);
      const endTime = performance.now();

      console.log(`✅ Status: ${response.status}`);
      console.log(`⏱️ Response time: ${endTime - startTime}ms`);
      console.log(`🌐 Server: ${response.headers.get('server')}`);

    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}
```

---

## 📞 Getting Help

### When to Contact Support

Contact support if you encounter:

- **Persistent API downtime** (health check fails)
- **Data accuracy issues** (incorrect postal codes)
- **Performance degradation** (consistently slow responses)
- **Security concerns** (suspected API abuse)
- **Feature requests** (new functionality needed)

### How to Report Issues

**Include in your report:**

1. **API Endpoint**: Which endpoint is causing issues
2. **Request Details**: Full request URL and parameters
3. **Response**: Complete error response or status
4. **Timestamp**: When the issue occurred
5. **Environment**: Browser, framework, or tool being used
6. **Reproduction Steps**: How to reproduce the issue

**Example Issue Report:**
```
API Endpoint: /search
Request: https://your-api.workers.dev/search?q=Jakarta%20Pusat
Response: 404 Not Found
Timestamp: 2025-11-26T10:30:00Z
Environment: Chrome 119, React 18
Reproduction: Search for "Jakarta Pusat" returns no results
Expected: Should return postal codes in Jakarta Pusat area
```

### Support Channels

- **GitHub Issues**: https://github.com/mxwllalpha/kodepos-api/issues
- **Email**: mxwllalpha@gmail.com
- **Documentation**: Check [API Documentation](./API.md) first

### Self-Service Resources

- **[API Documentation](./API.md)**: Complete API reference
- **[Migration Guide](./MIGRATION.md)**: Migration help and examples
- **[User Guide](./USER_GUIDE.md)**: Usage examples and best practices
- **[Development Guide](./DEVELOPMENT.md)**: Development and setup help

---

## 🔮 Preventive Measures

### Monitor API Health

```javascript
class APIHealthMonitor {
  constructor(apiUrl, checkInterval = 60000) { // 1 minute
    this.apiUrl = apiUrl;
    this.checkInterval = checkInterval;
    this.isMonitoring = false;
    this.alertCallbacks = [];
  }

  addAlertCallback(callback) {
    this.alertCallbacks.push(callback);
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.apiUrl}/health`);
      const isHealthy = response.ok;

      if (!isHealthy) {
        this.alertCallbacks.forEach(callback => {
          callback({
            type: 'health_check_failed',
            status: response.status,
            timestamp: new Date().toISOString()
          });
        });
      }

      return isHealthy;
    } catch (error) {
      this.alertCallbacks.forEach(callback => {
        callback({
          type: 'health_check_error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      });

      return false;
    }
  }

  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitorInterval = setInterval(() => {
      this.checkHealth();
    }, this.checkInterval);

    console.log('Health monitoring started');
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }

    console.log('Health monitoring stopped');
  }
}

// Usage
const monitor = new APIHealthMonitor('https://your-api.workers.dev');

// Add alert callback
monitor.addAlertCallback((alert) => {
  console.error('API Alert:', alert);
  // Send to monitoring service, log to file, etc.
});

// Start monitoring
monitor.startMonitoring();
```

### Implement Retry Logic

```javascript
class ResilientAPIClient {
  constructor(baseUrl, maxRetries = 3, retryDelay = 1000) {
    this.baseUrl = baseUrl;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  async makeRequest(endpoint, options = {}) {
    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, options);

        if (response.ok) {
          return response;
        }

        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Client error: ${response.status}`);
        }

        // Retry on server errors (5xx)
        throw new Error(`Server error: ${response.status}`);

      } catch (error) {
        lastError = error;

        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt); // Exponential backoff
          console.log(`Request failed, retrying in ${delay}ms... (attempt ${attempt + 1}/${this.maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
}

// Usage
const client = new ResilientAPIClient('https://your-api.workers.dev');

try {
  const response = await client.makeRequest('/search?q=Jakarta');
  const data = await response.json();
  console.log('Success:', data);
} catch (error) {
  console.error('All retries failed:', error);
}
```

---

*Last Updated: November 26, 2025*
*Troubleshooting Guide Version: 1.0.0*
*Author: Maxwell Alpha (https://github.com/mxwllalpha)*