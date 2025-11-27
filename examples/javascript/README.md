# 🚀 JavaScript Integration Examples

**Complete JavaScript Examples for Kodepos API Integration**

This directory contains comprehensive JavaScript integration examples for the Kodepos API, covering vanilla JavaScript, Node.js server-side integration, and advanced patterns with error handling, caching, and performance optimization.

## 📁 Example Structure

```
javascript/
├── README.md              # This file
├── basic/                 # Simple, beginner-friendly examples
│   ├── simple-search.js
│   ├── location-detect.js
│   ├── complete-form.js
│   └── index.html
├── advanced/              # Advanced features and patterns
│   ├── rate-limited-client.js
│   ├── caching-client.js
│   ├── error-handling.js
│   └── performance-monitor.js
├── production/            # Production-ready implementations
│   ├── api-client.js
│   ├── react-components.jsx
│   ├── vue-components.js
│   └── worker.js
├── tests/                 # Test suites
│   ├── unit.test.js
│   ├── integration.test.js
│   └── performance.test.js
└── demo/                  # Complete demo application
    ├── index.html
    ├── app.js
    ├── styles.css
    └── package.json
```

## 🚀 Getting Started

### Quick Test
Copy this code into your browser console or create an HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Kodepos API Quick Test</title>
</head>
<body>
    <h1>Kodepos API Quick Test</h1>
    <div id="output"></div>

    <script>
        const API_BASE_URL = 'https://your-api.workers.dev';

        async function quickTest() {
            const output = document.getElementById('output');

            try {
                output.innerHTML = '<p>Testing API...</p>';

                // Test search
                const searchResponse = await fetch(`${API_BASE_URL}/search?q=Jakarta`);
                const searchData = await searchResponse.json();

                output.innerHTML += `
                    <h3>Search Results:</h3>
                    <pre>${JSON.stringify(searchData, null, 2)}</pre>
                `;

                // Test location detection
                const detectResponse = await fetch(`${API_BASE_URL}/detect?latitude=-6.2088&longitude=106.8456`);
                const detectData = await detectResponse.json();

                output.innerHTML += `
                    <h3>Location Detection:</h3>
                    <pre>${JSON.stringify(detectData, null, 2)}</pre>
                `;

            } catch (error) {
                output.innerHTML += `<p style="color: red;">Error: ${error.message}</p>`;
            }
        }

        quickTest();
    </script>
</body>
</html>
```

## 📚 Examples Overview

### Basic Examples (`basic/`)
Perfect for beginners and simple implementations:
- **Simple Search**: Basic postal code search
- **Location Detection**: GPS coordinate lookup
- **Complete Form**: Full address form with validation

### Advanced Examples (`advanced/`)
For developers needing advanced features:
- **Rate Limiting**: Automatic request throttling
- **Caching**: Client-side caching implementation
- **Error Handling**: Comprehensive error management
- **Performance Monitoring**: API performance tracking

### Production Examples (`production/`)
Ready for production use:
- **API Client**: Full-featured API client
- **React Components**: React integration components
- **Vue Components**: Vue.js integration components
- **Web Worker**: Background processing

### Test Suites (`tests/`)
Comprehensive testing examples:
- **Unit Tests**: Individual function testing
- **Integration Tests**: End-to-end testing
- **Performance Tests**: Load and stress testing

### Complete Demo (`demo/`)
Full working application:
- **User Interface**: Complete postal code search app
- **Real-time Search**: Live search with autocomplete
- **Location Services**: GPS integration
- **Error Handling**: Production-ready error management

## 🔧 Setup

### 1. Clone or Download
```bash
# If you have this repository
git clone https://github.com/mxwllalpha/kodepos-api.git

# Or download the examples folder
```

### 2. Configuration
Create a `config.js` file:

```javascript
export const API_CONFIG = {
  baseUrl: 'https://your-api.workers.dev',
  timeout: 10000,
  retries: 3,
  rateLimit: {
    requests: 100,
    window: 60000 // 1 minute
  }
};
```

### 3. Environment Variables
Create a `.env` file (optional):

```bash
KODEPOS_API_URL=https://your-api.workers.dev
KODEPOS_API_TIMEOUT=10000
KODEPOS_API_RETRIES=3
```

## 🧪 Running Examples

### Browser Examples
Simply open HTML files in your browser:

```bash
# Open basic example
open basic/index.html

# Open complete demo
open demo/index.html
```

### Node.js Examples
Run with Node.js:

```bash
# Basic examples
node basic/simple-search.js
node advanced/rate-limited-client.js

# Run tests
npm test
node tests/integration.test.js

# Run demo (if package.json exists)
cd demo && npm install && npm start
```

## 📖 Detailed Examples

### Basic Usage Pattern

```javascript
class SimpleKodeposClient {
  constructor(baseUrl = 'https://your-api.workers.dev') {
    this.baseUrl = baseUrl;
  }

  async search(query) {
    const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data;
  }

  async detectLocation(latitude, longitude) {
    const response = await fetch(
      `${this.baseUrl}/detect?latitude=${latitude}&longitude=${longitude}`
    );
    const data = await response.json();
    return data;
  }
}

// Usage
const client = new SimpleKodeposClient();

// Search
client.search('Jakarta').then(results => {
  console.log('Search results:', results.data);
});

// Location detection
client.detectLocation(-6.2088, 106.8456).then(location => {
  console.log('Location:', location.data);
});
```

### Advanced Usage Pattern

```javascript
class AdvancedKodeposClient {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'https://your-api.workers.dev';
    this.timeout = config.timeout || 10000;
    this.retries = config.retries || 3;
    this.cache = new Map();
    this.requestQueue = [];
  }

  async search(query, options = {}) {
    return this.makeRequest('/search', { q: query, ...options });
  }

  async detectLocation(latitude, longitude, options = {}) {
    return this.makeRequest('/detect', {
      latitude,
      longitude,
      ...options
    });
  }

  async makeRequest(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.keys(params).forEach(key =>
      url.searchParams.append(key, params[key])
    );

    // Check cache
    const cacheKey = url.toString();
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let lastError;
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await Promise.race([
          fetch(url),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), this.timeout)
          )
        ]);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Cache successful responses
        this.cache.set(cacheKey, data);

        return data;
      } catch (error) {
        lastError = error;

        if (attempt < this.retries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
}

// Usage with error handling
const client = new AdvancedKodeposClient({
  timeout: 8000,
  retries: 2
});

client.search('Jakarta')
  .then(results => console.log('Success:', results))
  .catch(error => console.error('Error:', error.message));
```

## 🎯 Best Practices

### 1. Error Handling
Always include proper error handling:

```javascript
async function safeSearch(query) {
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.statusCode !== 200) {
      throw new Error(`API error: ${data.code}`);
    }

    return data;
  } catch (error) {
    console.error('Search failed:', error);
    return { statusCode: 500, code: 'ERROR', data: [] };
  }
}
```

### 2. Rate Limiting
Respect API rate limits:

```javascript
class RateLimitedClient {
  constructor(baseUrl, maxRequests = 100, windowMs = 60000) {
    this.baseUrl = baseUrl;
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  async makeRequest(path, params = {}) {
    await this.waitForSlot();

    const url = new URL(`${this.baseUrl}${path}`);
    Object.keys(params).forEach(key =>
      url.searchParams.append(key, params[key])
    );

    this.requests.push(Date.now());
    return fetch(url);
  }

  async waitForSlot() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Remove old requests
    this.requests = this.requests.filter(time => time > windowStart);

    // Wait if at limit
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = oldestRequest + this.windowMs - now;

      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.waitForSlot();
      }
    }
  }
}
```

### 3. Caching
Implement client-side caching:

```javascript
class CachedClient {
  constructor(baseUrl, cacheTime = 300000) { // 5 minutes
    this.baseUrl = baseUrl;
    this.cacheTime = cacheTime;
    this.cache = new Map();
  }

  async search(query) {
    const cacheKey = `search:${query}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    this.setCache(cacheKey, data);
    return data;
  }

  getFromCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.cacheTime) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}
```

## 🔗 Next Steps

After mastering these examples:
1. Explore **framework-specific examples** (React, Vue, Angular)
2. Implement **backend integration** (Node.js, Python, PHP)
3. Set up **production monitoring** and error tracking
4. Contribute your own examples to the repository

## 📞 Support

Need help with JavaScript integration?
1. Check the [Troubleshooting Guide](../../docs/TROUBLESHOOTING.md)
2. Review [API Documentation](../../docs/API.md)
3. Open an issue on GitHub
4. Email: mxwllalpha@gmail.com

---

**Happy coding with Kodepos API!** 🚀

*Last Updated: November 26, 2025*
*JavaScript Examples Version: 1.0.0*