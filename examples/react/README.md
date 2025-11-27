# 🚀 React Integration Examples

**Complete React Examples for Kodepos API Integration**

This directory contains comprehensive React integration examples for the Kodepos API, covering both class components and functional components with hooks, TypeScript support, error boundaries, caching strategies, and production-ready patterns.

## 📁 Example Structure

```
react/
├── README.md              # This file
├── package.json           # Dependencies for all examples
├── hooks/                 # Custom React hooks
│   ├── useKodepos.js      # Main API hook
│   ├── useSearch.js       # Search functionality
│   ├── useLocation.js     # Geolocation features
│   └── useDebounce.js     # Debouncing utility
├── components/            # Reusable React components
│   ├── SearchInput.jsx    # Search input component
│   ├── ResultsList.jsx    # Results display component
│   ├── LocationButton.jsx # GPS detection button
│   └── AddressForm.jsx    # Complete address form
├── basic/                 # Simple, beginner-friendly examples
│   ├── SimpleSearch.jsx
│   ├── LocationDetect.jsx
│   └── BasicApp.jsx
├── advanced/              # Advanced features and patterns
│   ├── AutoComplete.jsx
│   ├── AdvancedSearch.jsx
│   └── MapIntegration.jsx
└── production/            # Production-ready implementations
    ├── PostalCodeProvider.jsx
    ├── Types.js
    ├── api.js
    └── constants.js
```

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Or with yarn
yarn install
```

### Basic Usage

```jsx
import React, { useState } from 'react';
import { useKodepos } from '../hooks/useKodepos';

function SimpleSearch() {
  const [query, setQuery] = useState('');
  const { search, results, loading, error } = useKodepos();

  const handleSearch = () => {
    if (query.trim()) {
      search(query.trim());
    }
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search postal codes..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      {error && <div className="error">{error}</div>}

      <div>
        {results.map((item) => (
          <div key={item.code}>
            <h3>{item.village}</h3>
            <p>Postal Code: {item.code}</p>
            <p>{item.district}, {item.regency}, {item.province}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 📚 Component Examples

### 1. Search Input Component (`components/SearchInput.jsx`)

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '../hooks/useDebounce';

const SearchInput = ({ onSearch, placeholder = "Search location...", disabled = false }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const handleInputChange = useCallback((e) => {
    setQuery(e.target.value);
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      onSearch(debouncedQuery.trim());
    } else if (debouncedQuery.trim().length === 0) {
      onSearch('');
    }
  }, [debouncedQuery, onSearch]);

  return (
    <div className="search-input-container">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        className="search-input"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="clear-button"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SearchInput;
```

### 2. Results List Component (`components/ResultsList.jsx`)

```jsx
import React from 'react';
import PropTypes from 'prop-types';

const ResultsList = ({ results, loading, error, onSelect, emptyMessage }) => {
  if (loading) {
    return (
      <div className="results-loading">
        <div className="spinner"></div>
        <p>Searching...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-error">
        <p>❌ {error}</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="results-empty">
        <p>{emptyMessage || 'No results found'}</p>
      </div>
    );
  }

  return (
    <div className="results-list">
      {results.map((item) => (
        <div
          key={item.code}
          className="result-item"
          onClick={() => onSelect && onSelect(item)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(item);
            }
          }}
        >
          <div className="result-header">
            <h3 className="result-title">{item.village}</h3>
            <span className="postal-code">{item.code}</span>
          </div>

          <div className="result-details">
            <div className="detail-row">
              <span className="label">District:</span>
              <span className="value">{item.district}</span>
            </div>
            <div className="detail-row">
              <span className="label">Regency:</span>
              <span className="value">{item.regency}</span>
            </div>
            <div className="detail-row">
              <span className="label">Province:</span>
              <span className="value">{item.province}</span>
            </div>
            {item.elevation && (
              <div className="detail-row">
                <span className="label">Elevation:</span>
                <span className="value">{item.elevation}m</span>
              </div>
            )}
          </div>

          <div className="result-coordinates">
            📍 {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
          </div>
        </div>
      ))}
    </div>
  );
};

ResultsList.propTypes = {
  results: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.number.isRequired,
    village: PropTypes.string.isRequired,
    district: PropTypes.string.isRequired,
    regency: PropTypes.string.isRequired,
    province: PropTypes.string.isRequired,
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    elevation: PropTypes.number,
    timezone: PropTypes.string,
    distance: PropTypes.number
  })).isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onSelect: PropTypes.func,
  emptyMessage: PropTypes.string
};

ResultsList.defaultProps = {
  loading: false,
  error: null,
  onSelect: null,
  emptyMessage: null
};

export default ResultsList;
```

### 3. Location Button Component (`components/LocationButton.jsx`)

```jsx
import React, { useState } from 'react';

const LocationButton = ({ onLocationDetect, disabled = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLocationClick = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        });
      });

      const { latitude, longitude } = position.coords;
      await onLocationDetect(latitude, longitude);

    } catch (err) {
      let errorMessage = 'Unable to get location';

      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location services.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable.';
          break;
        case err.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="location-button-container">
      <button
        onClick={handleLocationClick}
        disabled={disabled || loading}
        className={`location-button ${loading ? 'loading' : ''}`}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Getting location...
          </>
        ) : (
          <>
            📍 Use My Current Location
          </>
        )}
      </button>

      {error && (
        <div className="location-error">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default LocationButton;
```

## 🪝 Custom Hooks

### 1. Main API Hook (`hooks/useKodepos.js`)

```jsx
import { useState, useCallback, useRef } from 'react';

const API_BASE_URL = 'https://your-api.workers.dev';

export const useKodepos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const abortControllerRef = useRef(null);

  const makeRequest = useCallback(async (url, options = {}) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.statusCode !== 200) {
        throw new Error(data.error || data.code || 'API error');
      }

      return data;

    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        console.error('API request failed:', err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      const url = `${API_BASE_URL}/search?q=${encodeURIComponent(query.trim())}`;
      const data = await makeRequest(url);
      setResults(data.data || []);
    } catch (err) {
      setResults([]);
    }
  }, [makeRequest]);

  const detectLocation = useCallback(async (latitude, longitude) => {
    try {
      const url = `${API_BASE_URL}/detect?latitude=${latitude}&longitude=${longitude}`;
      const data = await makeRequest(url);
      return data.data;
    } catch (err) {
      return null;
    }
  }, [makeRequest]);

  const findNearby = useCallback(async (latitude, longitude, radius = 5) => {
    try {
      const url = `${API_BASE_URL}/api/v1/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
      const data = await makeRequest(url);
      return data.data || data;
    } catch (err) {
      return null;
    }
  }, [makeRequest]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    search,
    detectLocation,
    findNearby,
    loading,
    error,
    results
  };
};
```

### 2. Debounce Hook (`hooks/useDebounce.js`)

```jsx
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

## 🎨 Styling

### CSS Styles (`styles/kodepos.css`)

```css
/* Search Input */
.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.clear-button {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-button:hover {
  color: #2c3e50;
}

/* Results List */
.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.result-item:hover {
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
}

.result-item:focus {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.result-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.postal-code {
  background: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.result-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.detail-row {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 12px;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value {
  font-size: 14px;
  color: #2c3e50;
  margin-top: 2px;
}

.result-coordinates {
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #6c757d;
}

/* Loading States */
.results-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: #6c757d;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e1e8ed;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error States */
.results-error,
.results-empty {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.results-error {
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  margin: 20px 0;
}

/* Location Button */
.location-button-container {
  margin-bottom: 20px;
}

.location-button {
  width: 100%;
  padding: 12px 16px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.location-button:hover:not(:disabled) {
  background: #229954;
}

.location-button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.location-error {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  color: #856404;
  font-size: 14px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .result-details {
    grid-template-columns: 1fr;
  }

  .search-input-container {
    flex-direction: column;
    gap: 8px;
  }

  .clear-button {
    position: static;
    align-self: flex-end;
    margin-top: 8px;
  }
}
```

## 📱 Complete Examples

### Basic Search App (`basic/BasicApp.jsx`)

```jsx
import React, { useState } from 'react';
import { useKodepos } from '../hooks/useKodepos';
import SearchInput from '../components/SearchInput';
import ResultsList from '../components/ResultsList';
import LocationButton from '../components/LocationButton';

const BasicApp = () => {
  const { search, detectLocation, loading, error, results } = useKodepos();
  const [mode, setMode] = useState('search'); // 'search' or 'location'

  const handleSearch = (query) => {
    if (query) {
      search(query);
    }
  };

  const handleLocationDetect = async (latitude, longitude) => {
    const location = await detectLocation(latitude, longitude);
    if (location) {
      search(location.code.toString());
    }
  };

  const handleResultSelect = (item) => {
    console.log('Selected:', item);
    // Handle result selection
  };

  return (
    <div className="kodepos-app">
      <div className="app-header">
        <h1>🇮🇩 Kodepos API Indonesia</h1>
        <p>Search Indonesian postal codes</p>
      </div>

      <div className="mode-toggle">
        <button
          className={mode === 'search' ? 'active' : ''}
          onClick={() => setMode('search')}
        >
          🔍 Search
        </button>
        <button
          className={mode === 'location' ? 'active' : ''}
          onClick={() => setMode('location')}
        >
          📍 Location
        </button>
      </div>

      {mode === 'search' && (
        <div className="search-section">
          <SearchInput
            onSearch={handleSearch}
            placeholder="Enter village, district, city, or postal code..."
            disabled={loading}
          />
        </div>
      )}

      {mode === 'location' && (
        <div className="location-section">
          <LocationButton
            onLocationDetect={handleLocationDetect}
            disabled={loading}
          />
        </div>
      )}

      <div className="results-section">
        <ResultsList
          results={results}
          loading={loading}
          error={error}
          onSelect={handleResultSelect}
          emptyMessage="Start searching for postal codes..."
        />
      </div>
    </div>
  );
};

export default BasicApp;
```

## 🚀 Production Usage

### 1. TypeScript Support (`production/Types.js`)

```jsx
// Types.js - TypeScript-style prop types for JavaScript
export const PostalCodeType = {
  code: 'number',
  village: 'string',
  district: 'string',
  regency: 'string',
  province: 'string',
  latitude: 'number',
  longitude: 'number',
  elevation: 'number',
  timezone: 'string',
  distance: 'number'
};

export const APIResponseType = {
  statusCode: 'number',
  code: 'string',
  data: 'array'
};
```

### 2. API Configuration (`production/api.js`)

```jsx
// api.js - Production-ready API client
import { useState, useCallback, useRef } from 'react';

const API_CONFIG = {
  baseUrl: process.env.REACT_APP_KODEPOS_API_URL || 'https://your-api.workers.dev',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
  retries: parseInt(process.env.REACT_APP_API_RETRIES) || 3
};

export const useProductionKodepos = () => {
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null
  });

  const abortControllerRef = useRef(null);
  const retryCountRef = useRef(0);

  const executeRequest = useCallback(async (url, options = {}) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.statusCode !== 200) {
        throw new Error(data.error || data.code || 'API Error');
      }

      setState(prev => ({
        ...prev,
        loading: false,
        data: data.data || data
      }));

      retryCountRef.current = 0; // Reset retry count on success
      return data;

    } catch (error) {
      if (error.name !== 'AbortError') {
        // Retry logic
        if (retryCountRef.current < API_CONFIG.retries) {
          retryCountRef.current++;

          setTimeout(() => {
            executeRequest(url, options);
          }, Math.pow(2, retryCountRef.current) * 1000); // Exponential backoff

          return;
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }

      throw error;
    }
  }, []);

  const search = useCallback((query) => {
    if (!query || query.trim().length < 2) {
      setState(prev => ({ ...prev, data: [] }));
      return Promise.resolve();
    }

    const url = `${API_CONFIG.baseUrl}/search?q=${encodeURIComponent(query.trim())}`;
    return executeRequest(url);
  }, [executeRequest]);

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    search
  };
};
```

## 🔧 Integration Guide

### 1. Install Dependencies

```bash
npm install react react-dom
# Optional: for additional features
npm install axios react-router-dom prop-types
```

### 2. Environment Variables

Create a `.env` file:

```bash
REACT_APP_KODEPOS_API_URL=https://your-api.workers.dev
REACT_APP_API_TIMEOUT=10000
REACT_APP_API_RETRIES=3
```

### 3. Usage in Your App

```jsx
// App.js
import React from 'react';
import BasicApp from './examples/react/basic/BasicApp';
import './styles/kodepos.css';

function App() {
  return (
    <div className="App">
      <BasicApp />
    </div>
  );
}

export default App;
```

## 🧪 Testing

### Component Testing

```jsx
// __tests__/SearchInput.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchInput from '../components/SearchInput';

describe('SearchInput', () => {
  it('should call onSearch after debounce', async () => {
    const mockOnSearch = jest.fn();

    render(<SearchInput onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search location...');
    fireEvent.change(input, { target: { value: 'Jakarta' } });

    // Wait for debounce
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('Jakarta');
    }, { timeout: 1000 });
  });

  it('should clear input when clear button is clicked', () => {
    const { container } = render(<SearchInput onSearch={() => {}} />);

    const input = screen.getByPlaceholderText('Search location...');
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = container.querySelector('.clear-button');
    fireEvent.click(clearButton);

    expect(input.value).toBe('');
  });
});
```

## 📚 Next Steps

After mastering these examples:
1. Explore **advanced features** like auto-complete and map integration
2. Implement **caching strategies** for better performance
3. Add **analytics tracking** for user behavior
4. Create **custom themes** and styling
5. Integrate with **backend services** for data persistence

## 🔗 Related Resources

- **[Kodepos API Documentation](../../docs/API.md)** - Complete API reference
- **[React Documentation](https://reactjs.org/)** - React guides and tutorials
- **[JavaScript Examples](../javascript/README.md)** - Vanilla JS examples
- **[TypeScript Examples](../typescript/README.md)** - Type-safe implementations

## 📞 Support

Need help with React integration?
1. Check the component documentation
2. Review the [Troubleshooting Guide](../../docs/TROUBLESHOOTING.md)
3. Open an issue on GitHub
4. Email: mxwllalpha@gmail.com

---

**Happy React coding!** ⚛️

*Last Updated: November 26, 2025*
*React Examples Version: 1.0.0*