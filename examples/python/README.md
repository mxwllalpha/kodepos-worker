# 🐍 Python Integration Examples

**Complete Python Examples for Kodepos API Integration**

This directory contains comprehensive Python integration examples for the Kodepos API, covering Flask, FastAPI, Django frameworks, async/await support, caching strategies, error handling, and production-ready patterns.

## 📁 Example Structure

```
python/
├── README.md              # This file
├── requirements.txt       # Python dependencies
├── basic/                 # Simple, beginner-friendly examples
│   ├── simple_search.py
│   ├── location_detect.py
│   ├── complete_example.py
│   └── interactive_cli.py
├── advanced/              # Advanced features and patterns
│   ├── async_client.py
│   ├── rate_limited_client.py
│   ├── cached_client.py
│   └── error_handling.py
├── production/            # Production-ready implementations
│   ├── kodepos_client.py
│   ├── django_integration/
│   ├── flask_integration/
│   └── fastapi_integration/
├── tests/                 # Test suites
│   ├── test_client.py
│   ├── test_integration.py
│   └── test_performance.py
└── demo/                  # Complete demo application
    ├── app.py
    ├── templates/
    ├── static/
    └── requirements.txt
```

## 🚀 Quick Start

### Installation

Install the required dependencies:

```bash
# Basic requirements
pip install requests

# For advanced examples
pip install requests aiohttp asyncio-cache

# For web framework examples
pip install flask django fastapi uvicorn

# For testing
pip install pytest pytest-asyncio pytest-cov

# For development
pip install black flake8 mypy
```

### Basic Usage

```python
import requests

API_BASE_URL = 'https://your-api.workers.dev'

def search_postal_codes(query):
    """Simple search function"""
    response = requests.get(f"{API_BASE_URL}/search", params={'q': query})
    response.raise_for_status()
    return response.json()

# Example usage
if __name__ == "__main__":
    results = search_postal_codes("Jakarta")
    print(f"Found {len(results['data'])} results")
    for item in results['data'][:3]:  # Show first 3 results
        print(f"{item['village']} - {item['code']}")
```

### Run the Examples

```bash
# Basic examples
python basic/simple_search.py
python basic/location_detect.py
python basic/interactive_cli.py

# Advanced examples
python advanced/async_client.py
python advanced/cached_client.py

# Production examples
python production/kodepos_client.py

# Demo application
cd demo && python app.py

# Run tests
python -m pytest tests/
```

## 📚 Example Details

### Basic Examples (`basic/`)

#### 1. Simple Search (`simple_search.py`)
```python
import requests

def search_postal_codes(query):
    """Search postal codes by query"""
    url = f"https://your-api.workers.dev/search"
    params = {'q': query}

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return {"error": str(e), "data": []}

# Usage
results = search_postal_codes("Jakarta")
print(f"Results: {len(results.get('data', []))}")
```

#### 2. Location Detection (`location_detect.py`)
```python
import requests

def detect_location(latitude, longitude):
    """Detect postal code by coordinates"""
    url = f"https://your-api.workers.dev/detect"
    params = {'latitude': latitude, 'longitude': longitude}

    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()

# Example
location = detect_location(-6.2088, 106.8456)
print(f"Postal code: {location['data']['code']}")
```

#### 3. Complete Example (`complete_example.py`)
A full-featured example with error handling and multiple functions.

#### 4. Interactive CLI (`interactive_cli.py`)
Command-line interface for exploring the API.

### Advanced Examples (`advanced/`)

#### 1. Async Client (`async_client.py`)
```python
import aiohttp
import asyncio

class AsyncKodeposClient:
    def __init__(self, base_url="https://your-api.workers.dev"):
        self.base_url = base_url
        self.session = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def search(self, query):
        """Async search method"""
        if not self.session:
            raise RuntimeError("Client not initialized. Use async with.")

        params = {'q': query}
        async with self.session.get(f"{self.base_url}/search", params=params) as response:
            response.raise_for_status()
            return await response.json()

# Usage
async def main():
    async with AsyncKodeposClient() as client:
        results = await client.search("Jakarta")
        print(f"Found {len(results['data'])} results")

asyncio.run(main())
```

#### 2. Rate Limited Client (`rate_limited_client.py`)
```python
import time
from collections import deque
import requests

class RateLimitedClient:
    def __init__(self, base_url, max_requests=100, window_seconds=60):
        self.base_url = base_url
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.request_times = deque()

    def wait_if_needed(self):
        """Wait if rate limit would be exceeded"""
        now = time.time()
        # Remove old requests
        while self.request_times and self.request_times[0] <= now - self.window_seconds:
            self.request_times.popleft()

        # Wait if at limit
        if len(self.request_times) >= self.max_requests:
            sleep_time = self.window_seconds - (now - self.request_times[0])
            if sleep_time > 0:
                time.sleep(sleep_time)
                self.request_times.popleft()

    def make_request(self, endpoint, params=None):
        """Make rate-limited request"""
        self.wait_if_needed()
        self.request_times.append(time.time())

        response = requests.get(f"{self.base_url}{endpoint}", params=params)
        response.raise_for_status()
        return response.json()

# Usage
client = RateLimitedClient("https://your-api.workers.dev", max_requests=50)
results = client.make_request("/search", {'q': 'Jakarta'})
```

#### 3. Cached Client (`cached_client.py`)
```python
import time
import requests
from typing import Dict, Any, Optional

class CachedKodeposClient:
    def __init__(self, base_url, cache_ttl=300):  # 5 minutes cache
        self.base_url = base_url
        self.cache_ttl = cache_ttl
        self.cache: Dict[str, tuple] = {}

    def _get_cache_key(self, endpoint: str, params: Dict = None) -> str:
        """Generate cache key"""
        param_str = str(sorted(params.items())) if params else ""
        return f"{endpoint}:{param_str}"

    def _is_cache_valid(self, timestamp: float) -> bool:
        """Check if cache entry is still valid"""
        return time.time() - timestamp < self.cache_ttl

    def _get_from_cache(self, key: str) -> Optional[Any]:
        """Get value from cache if valid"""
        if key in self.cache:
            data, timestamp = self.cache[key]
            if self._is_cache_valid(timestamp):
                return data
            else:
                del self.cache[key]
        return None

    def _set_cache(self, key: str, data: Any) -> None:
        """Set value in cache"""
        self.cache[key] = (data, time.time())

    def make_request(self, endpoint: str, params: Dict = None) -> Any:
        """Make request with caching"""
        cache_key = self._get_cache_key(endpoint, params)

        # Try cache first
        cached_data = self._get_from_cache(cache_key)
        if cached_data is not None:
            return cached_data

        # Make actual request
        response = requests.get(f"{self.base_url}{endpoint}", params=params)
        response.raise_for_status()
        data = response.json()

        # Cache the result
        self._set_cache(cache_key, data)
        return data

    def clear_cache(self):
        """Clear all cached data"""
        self.cache.clear()

# Usage
client = CachedKodeposClient("https://your-api.workers.dev")
results1 = client.make_request("/search", {'q': 'Jakarta'})  # API call
results2 = client.make_request("/search", {'q': 'Jakarta'})  # From cache
```

### Production Examples (`production/`)

#### 1. Complete Client (`kodepos_client.py`)
Production-ready client with all features:
- Async support
- Rate limiting
- Caching
- Error handling
- Retry logic
- Logging
- Type hints

#### 2. Django Integration (`django_integration/`)
Django app with model, views, and templates for postal code lookup.

#### 3. Flask Integration (`flask_integration/`)
Flask web application with postal code search functionality.

#### 4. FastAPI Integration (`fastapi_integration/`)
FastAPI application with async endpoints and validation.

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
python -m pytest tests/ -v

# Run with coverage
python -m pytest tests/ --cov=. --cov-report=html

# Run specific test file
python -m pytest tests/test_client.py -v
```

### Integration Tests
```bash
# Run integration tests (requires API access)
python -m pytest tests/test_integration.py -v

# Run with custom API URL
KODEPOS_API_URL=https://your-api.workers.dev python -m pytest tests/test_integration.py -v
```

## 🔧 Configuration

### Environment Variables
```bash
# .env file
KODEPOS_API_URL=https://your-api.workers.dev
KODEPOS_API_TIMEOUT=30
KODEPOS_API_RETRIES=3
KODEPOS_CACHE_TTL=300
```

### Configuration File
```python
# config.py
import os
from typing import Optional

class Config:
    API_URL: str = os.getenv('KODEPOS_API_URL', 'https://your-api.workers.dev')
    API_TIMEOUT: int = int(os.getenv('KODEPOS_API_TIMEOUT', '30'))
    API_RETRIES: int = int(os.getenv('KODEPOS_API_RETRIES', '3'))
    CACHE_TTL: int = int(os.getenv('KODEPOS_CACHE_TTL', '300'))
    MAX_REQUESTS: int = int(os.getenv('KODEPOS_MAX_REQUESTS', '100'))
    WINDOW_SECONDS: int = int(os.getenv('KODEPOS_WINDOW_SECONDS', '60'))

class DevelopmentConfig(Config):
    API_URL: str = 'http://localhost:8787'

class ProductionConfig(Config):
    API_TIMEOUT: int = 60
    API_RETRIES: int = 5

def get_config() -> Config:
    env = os.getenv('ENVIRONMENT', 'development')
    return ProductionConfig() if env == 'production' else Config()
```

## 🎯 Best Practices

### 1. Error Handling
```python
def safe_api_call(func):
    """Decorator for safe API calls"""
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except requests.Timeout:
            return {"error": "Request timeout", "data": []}
        except requests.ConnectionError:
            return {"error": "Connection error", "data": []}
        except requests.HTTPError as e:
            return {"error": f"HTTP error: {e.response.status_code}", "data": []}
        except Exception as e:
            return {"error": f"Unexpected error: {str(e)}", "data": []}
    return wrapper
```

### 2. Logging
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def search_with_logging(query):
    logger.info(f"Searching for: {query}")
    try:
        results = search_postal_codes(query)
        logger.info(f"Found {len(results.get('data', []))} results")
        return results
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise
```

### 3. Type Hints
```python
from typing import Dict, List, Optional, Union
from dataclasses import dataclass

@dataclass
class PostalCode:
    code: int
    village: str
    district: str
    regency: str
    province: str
    latitude: float
    longitude: float
    elevation: Optional[int] = None
    timezone: str = "WIB"

def search_postal_codes(query: str) -> Dict[str, Union[int, str, List[PostalCode]]]:
    """Search postal codes with type hints"""
    pass
```

## 📖 Advanced Topics

### Async Processing
```python
import asyncio
import aiohttp

async def batch_search(queries: List[str]) -> List[Dict]:
    """Search multiple queries concurrently"""
    async with aiohttp.ClientSession() as session:
        tasks = [search_async(session, query) for query in queries]
        return await asyncio.gather(*tasks)
```

### Database Integration
```python
import sqlite3
from contextlib import contextmanager

@contextmanager
def get_db_connection():
    conn = sqlite3.connect('kodepos.db')
    try:
        yield conn
    finally:
        conn.close()

def cache_results(data):
    """Cache API results in local database"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        # Insert or update logic here
        conn.commit()
```

## 🔗 Related Examples

- **[JavaScript Examples](../javascript/README.md)** - Frontend integration
- **[React Examples](../react/README.md)** - React components
- **[Python Django Integration](./production/django_integration/)** - Full Django app
- **[API Documentation](../../docs/API.md)** - Complete API reference

## 📞 Support

Need help with Python integration?
1. Check the examples in this directory
2. Review the [Troubleshooting Guide](../../docs/TROUBLESHOOTING.md)
3. Open an issue on GitHub
4. Email: mxwllalpha@gmail.com

---

**Happy Python coding!** 🐍

*Last Updated: November 26, 2025*
*Python Examples Version: 1.0.0*