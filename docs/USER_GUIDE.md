# Comprehensive User Guide

**Kodepos API Indonesia - Complete Usage Guide & Tutorials**

*Author: Maxwell Alpha (https://github.com/mxwllalpha) - mxwllalpha@gmail.com*
*Version: 1.0.0*

---

## 🎯 Table of Contents

1. [Getting Started](#-getting-started)
   - What is Kodepos API Indonesia?
   - Quick Test
   - Base URLs
   - API Authentication

2. [Step-by-Step Tutorials](#-step-by-step-tutorials)
   - Tutorial 1: Basic Postal Code Search
   - Tutorial 2: Location Detection
   - Tutorial 3: Building a Complete Address Form
   - Tutorial 4: Advanced Geolocation Features
   - Tutorial 5: Real-time Address Autocomplete

3. [API Usage Examples](#-api-usage-examples)
   - Legacy API vs Modern API
   - Basic Usage Patterns
   - Advanced Search Features
   - Location-Based Services

4. [Framework Integration](#-framework-integration)
   - React Integration
   - Vue.js Integration
   - Angular Integration
   - Mobile App Integration

5. [Real-World Use Cases](#-real-world-use-cases)
   - E-commerce Applications
   - Logistics and Delivery
   - Real Estate Platforms
   - Government Services

6. [Performance Optimization](#-performance-optimization)
   - Caching Strategies
   - Rate Limiting
   - Best Practices

7. [Error Handling](#-error-handling)
   - Common Error Responses
   - Debugging Procedures
   - Troubleshooting

8. [Advanced Features](#-advanced-features)
   - Batch Operations
   - Custom Integrations
   - Monitoring and Analytics

---

## 🚀 Getting Started

### What is Kodepos API Indonesia?

**Kodepos API Indonesia** is a high-performance postal code API that provides:
- **83,761 Complete Records**: All Indonesian postal codes with coordinates
- **100% Backward Compatibility**: Drop-in replacement for kodepos.vercel.app
- **Global Distribution**: Sub-100ms response times worldwide
- **Dual API Architecture**: Legacy endpoints + modern enhanced features

### Quick Test

Try the API right now in your browser or with curl:

```bash
# Test basic search
curl "https://your-api.workers.dev/search?q=Jakarta"

# Test location detection
curl "https://your-api.workers.dev/detect?latitude=-6.2088&longitude=106.8456"

# Test health check
curl "https://your-api.workers.dev/health"
```

### Base URLs

```
Production: https://your-api.workers.dev
Development: http://localhost:8787
```

---

## 📚 Step-by-Step Tutorials

### Tutorial 1: Basic Postal Code Search (5 minutes)

**Objective**: Learn how to search for postal codes using the API.

#### Step 1: Understanding the API Response Format

```json
{
  "statusCode": 200,
  "code": "OK",
  "data": [
    {
      "code": 10110,
      "village": "Gambir",
      "district": "Gambir",
      "regency": "Administrasi Jakarta Pusat",
      "province": "DKI Jakarta",
      "latitude": -6.1762629,
      "longitude": 106.8293243,
      "elevation": 0,
      "timezone": "WIB"
    }
  ]
}
```

#### Step 2: Making Your First API Call

**Using cURL**:
```bash
# Search for "Jakarta"
curl "https://your-api.workers.dev/search?q=Jakarta"
```

**Using JavaScript**:
```javascript
// Simple search function
async function searchPostalCode(query) {
  try {
    const response = await fetch(
      `https://your-api.workers.dev/search?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();

    if (data.statusCode === 200) {
      console.log(`Found ${data.data.length} results`);
      return data.data;
    } else {
      console.error('Search failed:', data);
      return [];
    }
  } catch (error) {
    console.error('Network error:', error);
    return [];
  }
}

// Test the function
searchPostalCode('Jakarta').then(results => {
  results.forEach(item => {
    console.log(`${item.village}, ${item.district} - ${item.code}`);
  });
});
```

#### Step 3: Building a Simple Search Interface

**HTML**:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Kodepos Search</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .search-box { margin: 20px 0; }
        .search-input { width: 300px; padding: 10px; font-size: 16px; }
        .search-button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
        .results { margin-top: 20px; }
        .result-item { padding: 10px; border: 1px solid #ddd; margin: 5px 0; border-radius: 5px; }
        .loading { color: #666; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>Indonesian Postal Code Search</h1>

    <div class="search-box">
        <input type="text" id="searchInput" class="search-input" placeholder="Enter location name...">
        <button onclick="performSearch()" class="search-button">Search</button>
    </div>

    <div id="status" class="loading"></div>
    <div id="results" class="results"></div>

    <script>
        async function performSearch() {
            const query = document.getElementById('searchInput').value;
            const statusDiv = document.getElementById('status');
            const resultsDiv = document.getElementById('results');

            if (!query.trim()) {
                statusDiv.textContent = 'Please enter a search term';
                return;
            }

            statusDiv.textContent = 'Searching...';
            resultsDiv.innerHTML = '';

            try {
                const response = await fetch(
                    `https://your-api.workers.dev/search?q=${encodeURIComponent(query)}`
                );
                const data = await response.json();

                if (data.statusCode === 200 && data.data.length > 0) {
                    statusDiv.textContent = `Found ${data.data.length} results`;
                    displayResults(data.data);
                } else {
                    statusDiv.textContent = 'No results found';
                }
            } catch (error) {
                statusDiv.textContent = 'Error: ' + error.message;
            }
        }

        function displayResults(results) {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = results.map(item => `
                <div class="result-item">
                    <strong>${item.village}</strong>, ${item.district}<br>
                    <em>${item.regency}, ${item.province}</em><br>
                    <strong>Kode Pos: ${item.code}</strong>
                </div>
            `).join('');
        }

        // Allow Enter key to trigger search
        document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    </script>
</body>
</html>
```

### Tutorial 2: Location Detection (10 minutes)

**Objective**: Find postal codes using GPS coordinates.

#### Step 1: Understanding Coordinate-based Search

The API can detect postal codes based on latitude and longitude coordinates:

```bash
# Test with Jakarta coordinates
curl "https://your-api.workers.dev/detect?latitude=-6.2088&longitude=106.8456"
```

#### Step 2: Building a Location Detection App

**Complete HTML with Geolocation**:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Location Detection</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .location-button { padding: 15px 30px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 10px 0; }
        .location-button:disabled { background: #ccc; cursor: not-allowed; }
        .coordinates { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .result { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .error { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>📍 Postal Code Location Detection</h1>
    <p>Find postal codes using your device's GPS coordinates or manual input.</p>

    <button onclick="detectCurrentLocation()" class="location-button" id="locationBtn">
        📍 Use My Current Location
    </button>

    <div style="margin: 20px 0;">
        <h3>Or Enter Coordinates Manually:</h3>
        <input type="number" id="latitude" placeholder="Latitude (e.g., -6.2088)" step="0.0001" style="width: 200px; margin-right: 10px; padding: 8px;">
        <input type="number" id="longitude" placeholder="Longitude (e.g., 106.8456)" step="0.0001" style="width: 200px; margin-right: 10px; padding: 8px;">
        <button onclick="detectManualLocation()" class="location-button">Detect</button>
    </div>

    <div id="status"></div>
    <div id="result"></div>

    <script>
        async function detectCurrentLocation() {
            const btn = document.getElementById('locationBtn');
            const statusDiv = document.getElementById('status');

            if (!navigator.geolocation) {
                statusDiv.innerHTML = '<div class="error">Geolocation is not supported by your browser</div>';
                return;
            }

            btn.disabled = true;
            btn.textContent = '🔄 Getting location...';
            statusDiv.innerHTML = '<div class="coordinates">Requesting location access...</div>';

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    document.getElementById('latitude').value = lat;
                    document.getElementById('longitude').value = lng;

                    statusDiv.innerHTML = `<div class="coordinates">
                        📍 Your coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}
                    </div>`;

                    await detectPostalCode(lat, lng);
                    btn.disabled = false;
                    btn.textContent = '📍 Use My Current Location';
                },
                (error) => {
                    let errorMessage = 'Unable to get location';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied. Please allow location access.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out.';
                            break;
                    }

                    statusDiv.innerHTML = `<div class="error">${errorMessage}</div>`;
                    btn.disabled = false;
                    btn.textContent = '📍 Use My Current Location';
                }
            );
        }

        async function detectManualLocation() {
            const lat = parseFloat(document.getElementById('latitude').value);
            const lng = parseFloat(document.getElementById('longitude').value);

            if (isNaN(lat) || isNaN(lng)) {
                document.getElementById('status').innerHTML = '<div class="error">Please enter valid latitude and longitude values</div>';
                return;
            }

            await detectPostalCode(lat, lng);
        }

        async function detectPostalCode(latitude, longitude) {
            const resultDiv = document.getElementById('result');
            const statusDiv = document.getElementById('status');

            resultDiv.innerHTML = '<div class="coordinates">🔍 Detecting postal code...</div>';

            try {
                const response = await fetch(
                    `https://your-api.workers.dev/detect?latitude=${latitude}&longitude=${longitude}`
                );
                const data = await response.json();

                if (data.statusCode === 200 && data.data) {
                    const location = data.data;
                    resultDiv.innerHTML = `
                        <div class="result">
                            <h3>🏠 Location Found!</h3>
                            <p><strong>Postal Code:</strong> ${location.code}</p>
                            <p><strong>Village:</strong> ${location.village}</p>
                            <p><strong>District:</strong> ${location.district}</p>
                            <p><strong>Regency:</strong> ${location.regency}</p>
                            <p><strong>Province:</strong> ${location.province}</p>
                            <p><strong>Coordinates:</strong> ${location.latitude}, ${location.longitude}</p>
                            <p><strong>Distance:</strong> ${location.distance ? location.distance.toFixed(2) + ' km' : 'N/A'}</p>
                        </div>
                    `;

                    statusDiv.innerHTML = `<div class="coordinates">✅ Postal code detected successfully!</div>`;
                } else {
                    resultDiv.innerHTML = '<div class="error">No postal code found for these coordinates</div>';
                }
            } catch (error) {
                resultDiv.innerHTML = `<div class="error">Error detecting postal code: ${error.message}</div>`;
            }
        }
    </script>
</body>
</html>
```

### Tutorial 3: Complete Address Form (15 minutes)

**Objective**: Build a comprehensive address form with postal code validation.

**Complete Address Form Component**:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Complete Address Form</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        .row { display: flex; gap: 15px; }
        .col { flex: 1; }
        button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #0056b3; }
        .error { color: #dc3545; font-size: 14px; margin-top: 5px; }
        .success { color: #28a745; font-size: 14px; margin-top: 5px; }
        .postal-suggestions { border: 1px solid #ddd; border-top: none; max-height: 200px; overflow-y: auto; }
        .suggestion-item { padding: 10px; cursor: pointer; border-bottom: 1px solid #eee; }
        .suggestion-item:hover { background: #f8f9fa; }
        .address-preview { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-top: 20px; }
    </style>
</head>
<body>
    <h1>🏠 Complete Address Form</h1>
    <form id="addressForm">
        <div class="row">
            <div class="col">
                <div class="form-group">
                    <label for="postalCode">Postal Code *</label>
                    <input type="number" id="postalCode" name="postalCode" required placeholder="e.g., 12345">
                    <div id="postalError" class="error"></div>
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="province">Province *</label>
                    <select id="province" name="province" required>
                        <option value="">Select Province</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="form-group">
            <label for="addressSearch">Search Address</label>
            <input type="text" id="addressSearch" placeholder="Search village, district, or city...">
            <div id="postalSuggestions" class="postal-suggestions" style="display: none;"></div>
        </div>

        <div class="row">
            <div class="col">
                <div class="form-group">
                    <label for="regency">Regency/City *</label>
                    <input type="text" id="regency" name="regency" required readonly placeholder="Auto-filled">
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="district">District *</label>
                    <input type="text" id="district" name="district" required readonly placeholder="Auto-filled">
                </div>
            </div>
        </div>

        <div class="form-group">
            <label for="village">Village *</label>
            <input type="text" id="village" name="village" required readonly placeholder="Auto-filled">
        </div>

        <div class="form-group">
            <label for="streetAddress">Street Address *</label>
            <input type="text" id="streetAddress" name="streetAddress" required placeholder="Jalan...">
        </div>

        <div class="row">
            <div class="col">
                <div class="form-group">
                    <label for="coordinates">Coordinates (Optional)</label>
                    <input type="text" id="coordinates" readonly placeholder="Auto-detected">
                </div>
            </div>
        </div>

        <button type="submit">Save Address</button>
    </form>

    <div id="addressPreview" class="address-preview" style="display: none;">
        <h3>📋 Address Preview</h3>
        <div id="previewContent"></div>
    </div>

    <script>
        // Global variables
        let postalCodeData = null;
        let searchTimeout = null;

        // Initialize the form
        document.addEventListener('DOMContentLoaded', function() {
            loadProvinces();
            setupEventListeners();
        });

        function setupEventListeners() {
            // Postal code validation
            document.getElementById('postalCode').addEventListener('blur', validatePostalCode);

            // Address search with debouncing
            document.getElementById('addressSearch').addEventListener('input', function(e) {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => searchAddress(e.target.value), 300);
            });

            // Hide suggestions when clicking outside
            document.addEventListener('click', function(e) {
                if (!e.target.closest('#addressSearch') && !e.target.closest('#postalSuggestions')) {
                    document.getElementById('postalSuggestions').style.display = 'none';
                }
            });

            // Form submission
            document.getElementById('addressForm').addEventListener('submit', handleFormSubmit);
        }

        async function loadProvinces() {
            try {
                const response = await fetch('https://your-api.workers.dev/api/v1/provinces');
                const data = await response.json();

                if (data.success && data.data) {
                    const provinceSelect = document.getElementById('province');
                    data.data.forEach(province => {
                        const option = document.createElement('option');
                        option.value = province;
                        option.textContent = province;
                        provinceSelect.appendChild(option);
                    });
                }
            } catch (error) {
                console.error('Failed to load provinces:', error);
            }
        }

        async function validatePostalCode() {
            const postalCode = document.getElementById('postalCode').value;
            const errorDiv = document.getElementById('postalError');

            if (!postalCode) {
                errorDiv.textContent = '';
                return;
            }

            try {
                const response = await fetch(`https://your-api.workers.dev/search?q=${postalCode}`);
                const data = await response.json();

                if (data.statusCode === 200 && data.data.length > 0) {
                    // Find exact match
                    const exactMatch = data.data.find(item => item.code === parseInt(postalCode));

                    if (exactMatch) {
                        postalCodeData = exactMatch;
                        populateAddressFields(exactMatch);
                        errorDiv.textContent = '';
                        document.getElementById('postalCode').style.borderColor = '#28a745';
                    } else {
                        errorDiv.textContent = 'Postal code not found';
                        document.getElementById('postalCode').style.borderColor = '#dc3545';
                    }
                } else {
                    errorDiv.textContent = 'Invalid postal code';
                    document.getElementById('postalCode').style.borderColor = '#dc3545';
                }
            } catch (error) {
                errorDiv.textContent = 'Error validating postal code';
                document.getElementById('postalCode').style.borderColor = '#dc3545';
            }
        }

        async function searchAddress(query) {
            const suggestionsDiv = document.getElementById('postalSuggestions');

            if (!query.trim()) {
                suggestionsDiv.style.display = 'none';
                return;
            }

            try {
                const response = await fetch(`https://your-api.workers.dev/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();

                if (data.statusCode === 200 && data.data.length > 0) {
                    displaySuggestions(data.data.slice(0, 10)); // Limit to 10 suggestions
                } else {
                    suggestionsDiv.style.display = 'none';
                }
            } catch (error) {
                console.error('Search error:', error);
                suggestionsDiv.style.display = 'none';
            }
        }

        function displaySuggestions(suggestions) {
            const suggestionsDiv = document.getElementById('postalSuggestions');

            suggestionsDiv.innerHTML = suggestions.map(item => `
                <div class="suggestion-item" onclick="selectSuggestion(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                    <strong>${item.code}</strong> - ${item.village}, ${item.district}, ${item.regency}, ${item.province}
                </div>
            `).join('');

            suggestionsDiv.style.display = 'block';
        }

        function selectSuggestion(item) {
            postalCodeData = item;
            populateAddressFields(item);
            document.getElementById('postalSuggestions').style.display = 'none';
            document.getElementById('addressSearch').value = '';
        }

        function populateAddressFields(item) {
            document.getElementById('postalCode').value = item.code;
            document.getElementById('province').value = item.province;
            document.getElementById('regency').value = item.regency;
            document.getElementById('district').value = item.district;
            document.getElementById('village').value = item.village;
            document.getElementById('coordinates').value = `${item.latitude}, ${item.longitude}`;

            updateAddressPreview();
        }

        function updateAddressPreview() {
            const formData = new FormData(document.getElementById('addressForm'));
            const preview = document.getElementById('addressPreview');
            const content = document.getElementById('previewContent');

            const fullAddress = [
                formData.get('streetAddress'),
                formData.get('village'),
                formData.get('district'),
                formData.get('regency'),
                formData.get('province'),
                formData.get('postalCode')
            ].filter(Boolean).join(', ');

            content.innerHTML = `<p><strong>Complete Address:</strong> ${fullAddress}</p>`;
            preview.style.display = 'block';
        }

        function handleFormSubmit(e) {
            e.preventDefault();

            const formData = new FormData(e.target);
            const address = {
                postalCode: formData.get('postalCode'),
                province: formData.get('province'),
                regency: formData.get('regency'),
                district: formData.get('district'),
                village: formData.get('village'),
                streetAddress: formData.get('streetAddress'),
                coordinates: document.getElementById('coordinates').value
            };

            console.log('Address submitted:', address);
            alert('Address saved successfully!');
        }
    </script>
</body>
</html>
```

---

## 🔍 Basic Usage

### Search Postal Codes

**Legacy API (Compatible with existing applications):**

```bash
curl "https://your-api.workers.dev/search?q=Jakarta"
```

**Response:**
```json
{
  "statusCode": 200,
  "code": "OK",
  "data": [
    {
      "code": 10110,
      "village": "Gambir",
      "district": "Gambir",
      "regency": "Administrasi Jakarta Pusat",
      "province": "DKI Jakarta",
      "latitude": -6.1762629,
      "longitude": 106.8293243,
      "elevation": 0,
      "timezone": "WIB"
    }
  ]
}
```

**Modern API (Enhanced features):**

```bash
curl "https://your-api.workers.dev/api/v1/search?provinsi=DKI Jakarta&kota=Jakarta Pusat"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "kodepos": 10110,
      "kelurahan": "Menteng",
      "kecamatan": "Menteng",
      "kota": "Jakarta Pusat",
      "provinsi": "DKI Jakarta",
      "latitude": -6.1944,
      "longitude": 106.8229,
      "elevation": 12,
      "timezone": "WIB"
    }
  ],
  "total": 25,
  "query_time_ms": 45,
  "cached": false,
  "message": "Search completed successfully",
  "timestamp": "2025-11-26T04:38:00.000Z",
  "version": "1.0.0"
}
```

### Location Detection

Find postal code information by coordinates:

```bash
# Legacy format
curl "https://your-api.workers.dev/detect?latitude=-6.2088&longitude=106.8456"

# Modern format with radius
curl "https://your-api.workers.dev/api/v1/detect?latitude=-6.2088&longitude=106.8456&radius=2.0"
```

**Response includes distance from query point:**
```json
{
  "statusCode": 200,
  "code": "OK",
  "data": {
    "code": 12970,
    "village": "Pasar Manggis",
    "district": "Setiabudi",
    "regency": "Administrasi Jakarta Selatan",
    "province": "DKI Jakarta",
    "latitude": -6.2107695,
    "longitude": 106.841572,
    "elevation": 15,
    "timezone": "WIB",
    "distance": 0.4962069729781341
  }
}
```

---

## 🎯 Advanced Features

### 1. Advanced Search with Multiple Filters

**Search by multiple criteria:**

```bash
curl "https://your-api.workers.dev/api/v1/search?provinsi=DKI Jakarta&kota=Jakarta Pusat&kecamatan=Menteng"
```

**Available search parameters:**
- `search` - General search (searches all fields)
- `kodepos` - Specific postal code
- `provinsi` - Province name
- `kota` - City/regency name
- `kecamatan` - District name
- `kelurahan` - Village name

**Examples:**
```bash
# Search by postal code
curl "https://your-api.workers.dev/api/v1/search?kodepos=10110"

# Search by village
curl "https://your-api.workers.dev/api/v1/search?kelurahan=Menteng"

# Combined search
curl "https://your-api.workers.dev/api/v1/search?provinsi=DKI Jakarta&kecamatan=Menteng"
```

### 2. Find Nearby Postal Codes

**Find all postal codes within radius of coordinates:**

```bash
curl "https://your-api.workers.dev/api/v1/nearby?latitude=-6.2088&longitude=106.8456&radius=5.0"
```

**Parameters:**
- `latitude` - Center latitude (required)
- `longitude` - Center longitude (required)
- `radius` - Search radius in kilometers (default: 5.0)

**Use Cases:**
- **Retail Locations**: Find postal codes for delivery areas
- **Service Areas**: Define geographic service boundaries
- **Local Businesses**: Find nearby neighborhoods

### 3. Administrative Data

**List all provinces:**
```bash
curl "https://your-api.workers.dev/api/v1/provinces"
```

**List cities in a province:**
```bash
curl "https://your-api.workers.dev/api/v1/cities/DKI Jakarta"
```

**Get database statistics:**
```bash
curl "https://your-api.workers.dev/api/v1/stats"
```

---

## 🎯 Framework Integration

### React Integration

#### React Hook for Kodepos API

```jsx
// hooks/useKodepos.js
import { useState, useEffect, useCallback } from 'react';

export const useKodepos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  const API_BASE_URL = 'https://your-api.workers.dev';

  const search = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.statusCode === 200) {
        setResults(data.data);
      } else {
        setResults([]);
        setError('No results found');
      }
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const detectLocation = useCallback(async (latitude, longitude) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/detect?latitude=${latitude}&longitude=${longitude}`
      );
      const data = await response.json();

      if (data.statusCode === 200 && data.data) {
        setCurrentLocation(data.data);
        return data.data;
      } else {
        setError('Location not found');
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProvinces = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/provinces`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  return {
    search,
    detectLocation,
    getProvinces,
    loading,
    error,
    results,
    currentLocation
  };
};
```

#### Complete React Component

```jsx
// components/PostalCodeSearch.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useKodepos } from '../hooks/useKodepos';

const PostalCodeSearch = ({ onLocationSelect }) => {
  const { search, detectLocation, getProvinces, loading, error, results } = useKodepos();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      search(debouncedQuery);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedQuery, search]);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setShowSuggestions(false);
    setQuery(`${location.village}, ${location.district} - ${location.code}`);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = await detectLocation(
            position.coords.latitude,
            position.coords.longitude
          );
          if (location) {
            handleLocationSelect(location);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  return (
    <div className="postal-code-search">
      <div className="search-container">
        <div className="input-group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(debouncedQuery.trim().length >= 2)}
            placeholder="Search for postal codes, villages, districts..."
            className="search-input"
          />
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            className="location-btn"
            title="Use current location"
          >
            📍
          </button>
        </div>

        {loading && <div className="loading">Searching...</div>}
        {error && <div className="error">{error}</div>}

        {showSuggestions && results.length > 0 && (
          <div className="suggestions">
            {results.map((item) => (
              <div
                key={item.code}
                className="suggestion-item"
                onClick={() => handleLocationSelect(item)}
              >
                <div className="suggestion-main">
                  <strong>{item.village}</strong>
                  <span className="postal-code">{item.code}</span>
                </div>
                <div className="suggestion-details">
                  {item.district}, {item.regency}, {item.province}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedLocation && (
        <div className="selected-location">
          <h3>Selected Location</h3>
          <div className="location-details">
            <p><strong>Postal Code:</strong> {selectedLocation.code}</p>
            <p><strong>Village:</strong> {selectedLocation.village}</p>
            <p><strong>District:</strong> {selectedLocation.district}</p>
            <p><strong>Regency:</strong> {selectedLocation.regency}</p>
            <p><strong>Province:</strong> {selectedLocation.province}</p>
            <p><strong>Coordinates:</strong> {selectedLocation.latitude}, {selectedLocation.longitude}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostalCodeSearch;
```

#### CSS Styles

```css
/* components/PostalCodeSearch.css */
.postal-code-search {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.search-container {
  position: relative;
}

.input-group {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  font-size: 16px;
  outline: none;
}

.location-btn {
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.location-btn:hover {
  background: #0056b3;
}

.loading {
  padding: 12px;
  color: #666;
  text-align: center;
}

.error {
  padding: 12px;
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-top: 8px;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.suggestion-item:hover {
  background: #f8f9fa;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.postal-code {
  font-weight: bold;
  color: #007bff;
}

.suggestion-details {
  font-size: 14px;
  color: #666;
}

.selected-location {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.selected-location h3 {
  margin: 0 0 12px 0;
  color: #333;
}

.location-details p {
  margin: 4px 0;
  color: #666;
}
```

### Vue.js Integration

#### Vue 3 Composition API Hook

```vue
<!-- composables/useKodepos.js -->
import { ref, reactive } from 'vue';

export function useKodepos() {
  const API_BASE_URL = 'https://your-api.workers.dev';

  const loading = ref(false);
  const error = ref(null);
  const results = ref([]);
  const currentLocation = ref(null);

  const search = async (query) => {
    if (!query || query.trim().length < 2) {
      results.value = [];
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.statusCode === 200) {
        results.value = data.data;
      } else {
        results.value = [];
        error.value = 'No results found';
      }
    } catch (err) {
      error.value = err.message;
      results.value = [];
    } finally {
      loading.value = false;
    }
  };

  const detectLocation = async (latitude, longitude) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/detect?latitude=${latitude}&longitude=${longitude}`
      );
      const data = await response.json();

      if (data.statusCode === 200 && data.data) {
        currentLocation.value = data.data;
        return data.data;
      } else {
        error.value = 'Location not found';
        return null;
      }
    } catch (err) {
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const getProvinces = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/provinces`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (err) {
      error.value = err.message;
      return [];
    }
  };

  return {
    search,
    detectLocation,
    getProvinces,
    loading,
    error,
    results,
    currentLocation
  };
}
```

#### Vue Component

```vue
<!-- components/PostalCodeSearch.vue -->
<template>
  <div class="postal-code-search">
    <div class="search-container">
      <div class="input-group">
        <input
          v-model="query"
          @input="handleSearch"
          @focus="showSuggestions = debouncedQuery.trim().length >= 2"
          type="text"
          placeholder="Search for postal codes, villages, districts..."
          class="search-input"
        />
        <button
          @click="getCurrentLocation"
          type="button"
          class="location-btn"
          title="Use current location"
        >
          📍
        </button>
      </div>

      <div v-if="loading" class="loading">Searching...</div>
      <div v-if="error" class="error">{{ error }}</div>

      <div
        v-if="showSuggestions && results.length > 0"
        class="suggestions"
      >
        <div
          v-for="item in results"
          :key="item.code"
          @click="selectLocation(item)"
          class="suggestion-item"
        >
          <div class="suggestion-main">
            <strong>{{ item.village }}</strong>
            <span class="postal-code">{{ item.code }}</span>
          </div>
          <div class="suggestion-details">
            {{ item.district }}, {{ item.regency }}, {{ item.province }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedLocation" class="selected-location">
      <h3>Selected Location</h3>
      <div class="location-details">
        <p><strong>Postal Code:</strong> {{ selectedLocation.code }}</p>
        <p><strong>Village:</strong> {{ selectedLocation.village }}</p>
        <p><strong>District:</strong> {{ selectedLocation.district }}</p>
        <p><strong>Regency:</strong> {{ selectedLocation.regency }}</p>
        <p><strong>Province:</strong> {{ selectedLocation.province }}</p>
        <p><strong>Coordinates:</strong> {{ selectedLocation.latitude }}, {{ selectedLocation.longitude }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { useKodepos } from '../composables/useKodepos';

export default {
  name: 'PostalCodeSearch',
  props: {
    onLocationSelect: {
      type: Function,
      default: null
    }
  },
  setup(props) {
    const { search, detectLocation, loading, error, results } = useKodepos();

    const query = ref('');
    const debouncedQuery = ref('');
    const showSuggestions = ref(false);
    const selectedLocation = ref(null);
    const searchTimeout = ref(null);

    // Debounce search
    const handleSearch = () => {
      clearTimeout(searchTimeout.value);
      searchTimeout.value = setTimeout(() => {
        debouncedQuery.value = query.value;
        if (debouncedQuery.value.trim().length >= 2) {
          search(debouncedQuery.value);
          showSuggestions.value = true;
        } else {
          showSuggestions.value = false;
        }
      }, 300);
    };

    const selectLocation = (location) => {
      selectedLocation.value = location;
      showSuggestions.value = false;
      query.value = `${location.village}, ${location.district} - ${location.code}`;

      if (props.onLocationSelect) {
        props.onLocationSelect(location);
      }
    };

    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const location = await detectLocation(
              position.coords.latitude,
              position.coords.longitude
            );
            if (location) {
              selectLocation(location);
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
          }
        );
      }
    };

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.postal-code-search')) {
        showSuggestions.value = false;
      }
    });

    return {
      query,
      loading,
      error,
      results,
      showSuggestions,
      selectedLocation,
      handleSearch,
      selectLocation,
      getCurrentLocation
    };
  }
};
</script>

<style scoped>
.postal-code-search {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.search-container {
  position: relative;
}

.input-group {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  font-size: 16px;
  outline: none;
}

.location-btn {
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.location-btn:hover {
  background: #0056b3;
}

.loading {
  padding: 12px;
  color: #666;
  text-align: center;
}

.error {
  padding: 12px;
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-top: 8px;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.suggestion-item:hover {
  background: #f8f9fa;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.postal-code {
  font-weight: bold;
  color: #007bff;
}

.suggestion-details {
  font-size: 14px;
  color: #666;
}

.selected-location {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.selected-location h3 {
  margin: 0 0 12px 0;
  color: #333;
}

.location-details p {
  margin: 4px 0;
  color: #666;
}
</style>
```

### Angular Integration

#### Service for Kodepos API

```typescript
// services/kodepos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface PostalCode {
  code: number;
  village: string;
  district: string;
  regency: string;
  province: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  code: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class KodeposService {
  private readonly API_BASE_URL = 'https://your-api.workers.dev';

  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  search(query: string): Observable<PostalCode[]> {
    this.setLoading(true);
    this.setError(null);

    return this.http.get<ApiResponse<PostalCode[]>>(
      `${this.API_BASE_URL}/search?q=${encodeURIComponent(query)}`
    ).pipe(
      map(response => {
        this.setLoading(false);
        if (response.statusCode === 200) {
          return response.data;
        } else {
          return [];
        }
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Search failed. Please try again.');
        return throwError(() => error);
      })
    );
  }

  detectLocation(latitude: number, longitude: number): Observable<PostalCode | null> {
    this.setLoading(true);
    this.setError(null);

    return this.http.get<ApiResponse<PostalCode>>(
      `${this.API_BASE_URL}/detect?latitude=${latitude}&longitude=${longitude}`
    ).pipe(
      map(response => {
        this.setLoading(false);
        if (response.statusCode === 200 && response.data) {
          return response.data;
        } else {
          this.setError('Location not found');
          return null;
        }
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Location detection failed');
        return throwError(() => error);
      })
    );
  }

  getProvinces(): Observable<string[]> {
    return this.http.get<{success: boolean, data: string[]}>(
      `${this.API_BASE_URL}/api/v1/provinces`
    ).pipe(
      map(response => response.success ? response.data : []),
      catchError(error => {
        this.setError('Failed to fetch provinces');
        return throwError(() => error);
      })
    );
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private setError(error: string | null): void {
    this.errorSubject.next(error);
  }
}
```

#### Angular Component

```typescript
// components/postal-code-search/postal-code-search.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { KodeposService, PostalCode } from '../../services/kodepos.service';

@Component({
  selector: 'app-postal-code-search',
  templateUrl: './postal-code-search.component.html',
  styleUrls: ['./postal-code-search.component.css']
})
export class PostalCodeSearchComponent implements OnInit, OnDestroy {
  query: string = '';
  results: PostalCode[] = [];
  selectedLocation: PostalCode | null = null;
  showSuggestions: boolean = false;

  loading$ = this.kodeposService.loading$;
  error$ = this.kodeposService.error$;

  private searchTerms = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private kodeposService: KodeposService) {}

  ngOnInit(): void {
    // Setup debounced search
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      if (term && term.trim().length >= 2) {
        this.performSearch(term);
        this.showSuggestions = true;
      } else {
        this.results = [];
        this.showSuggestions = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(): void {
    this.searchTerms.next(this.query);
  }

  onFocus(): void {
    if (this.query.trim().length >= 2) {
      this.showSuggestions = true;
    }
  }

  selectLocation(location: PostalCode): void {
    this.selectedLocation = location;
    this.showSuggestions = false;
    this.query = `${location.village}, ${location.district} - ${location.code}`;
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = await this.kodeposService.detectLocation(
            position.coords.latitude,
            position.coords.longitude
          ).toPromise();

          if (location) {
            this.selectLocation(location);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }

  hideSuggestions(): void {
    // Delay hiding to allow click events on suggestions
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  private performSearch(query: string): void {
    this.kodeposService.search(query).subscribe(
      (results) => {
        this.results = results;
      },
      (error) => {
        console.error('Search error:', error);
        this.results = [];
      }
    );
  }
}
```

#### Angular Template

```html
<!-- components/postal-code-search/postal-code-search.component.html -->
<div class="postal-code-search" (clickOutside)="hideSuggestions()">
  <div class="search-container">
    <div class="input-group">
      <input
        [(ngModel)]="query"
        (ngModelChange)="onSearchInput()"
        (focus)="onFocus()"
        type="text"
        placeholder="Search for postal codes, villages, districts..."
        class="search-input"
      />
      <button
        (click)="getCurrentLocation()"
        type="button"
        class="location-btn"
        title="Use current location"
      >
        📍
      </button>
    </div>

    <div *ngIf="loading$ | async" class="loading">Searching...</div>
    <div *ngIf="error$ | async as error" class="error">{{ error }}</div>

    <div
      *ngIf="showSuggestions && results.length > 0"
      class="suggestions"
    >
      <div
        *ngFor="let item of results"
        (click)="selectLocation(item)"
        class="suggestion-item"
      >
        <div class="suggestion-main">
          <strong>{{ item.village }}</strong>
          <span class="postal-code">{{ item.code }}</span>
        </div>
        <div class="suggestion-details">
          {{ item.district }}, {{ item.regency }}, {{ item.province }}
        </div>
      </div>
    </div>
  </div>

  <div *ngIf="selectedLocation" class="selected-location">
    <h3>Selected Location</h3>
    <div class="location-details">
      <p><strong>Postal Code:</strong> {{ selectedLocation.code }}</p>
      <p><strong>Village:</strong> {{ selectedLocation.village }}</p>
      <p><strong>District:</strong> {{ selectedLocation.district }}</p>
      <p><strong>Regency:</strong> {{ selectedLocation.regency }}</p>
      <p><strong>Province:</strong> {{ selectedLocation.province }}</p>
      <p><strong>Coordinates:</strong> {{ selectedLocation.latitude }}, {{ selectedLocation.longitude }}</p>
    </div>
  </div>
</div>
```

---

## 💻 Integration Examples

### JavaScript/TypeScript

**Basic integration with legacy endpoints:**

```javascript
class KodeposAPI {
  constructor(baseUrl = 'https://your-api.workers.dev') {
    this.baseUrl = baseUrl;
  }

  async search(query) {
    const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data;
  }

  async detect(latitude, longitude) {
    const response = await fetch(
      `${this.baseUrl}/detect?latitude=${latitude}&longitude=${longitude}`
    );
    const data = await response.json();
    return data;
  }

  async findNearby(latitude, longitude, radiusKm = 5) {
    const response = await fetch(
      `${this.baseUrl}/api/v1/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radiusKm}`
    );
    const data = await response.json();
    return data;
  }
}

// Usage
const api = new KodeposAPI();

// Search for Jakarta
const jakartaResults = await api.search('Jakarta');
console.log(`Found ${jakartaResults.data.length} results`);

// Detect location
const location = await api.detect(-6.2088, 106.8456);
console.log(`Postal code: ${location.data.code}`);

// Find nearby locations
const nearby = await api.findNearby(-6.2088, 106.8456, 3);
console.log(`Found ${nearby.data.length} nearby locations`);
```

**Advanced integration with modern endpoints:**

```javascript
class AdvancedKodeposAPI {
  constructor(baseUrl = 'https://your-api.workers.dev') {
    this.baseUrl = baseUrl;
  }

  async advancedSearch(filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const response = await fetch(`${this.baseUrl}/api/v1/search?${params}`);
    return response.json();
  }

  async getProvinces() {
    const response = await fetch(`${this.baseUrl}/api/v1/provinces`);
    return response.json();
  }

  async getCitiesByProvince(province) {
    const response = await fetch(`${this.baseUrl}/api/v1/cities/${encodeURIComponent(province)}`);
    return response.json();
  }

  async getStatistics() {
    const response = await fetch(`${this.baseUrl}/api/v1/stats`);
    return response.json();
  }
}

// Usage example
const advancedApi = new AdvancedKodeposAPI();

// Advanced search with multiple filters
const searchResults = await advancedApi.advancedSearch({
  provinsi: 'DKI Jakarta',
  kota: 'Jakarta Pusat',
  kecamatan: 'Menteng'
});

// Get all provinces
const provinces = await advancedApi.getProvinces();
console.log('Available provinces:', provinces.data);

// Get cities in DKI Jakarta
const jakartaCities = await advancedApi.getCitiesByProvince('DKI Jakarta');
console.log('Jakarta cities:', jakartaCities.data);
```

### Python Integration

**Basic Python client:**

```python
import requests
from typing import Optional, Dict, Any

class KodeposAPI:
    def __init__(self, base_url: str = "https://your-api.workers.dev"):
        self.base_url = base_url.rstrip('/')

    def search(self, query: str) -> Dict[str, Any]:
        """Search postal codes by location name"""
        response = requests.get(f"{self.base_url}/search", params={'q': query})
        response.raise_for_status()
        return response.json()

    def detect(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """Detect postal code by coordinates"""
        params = {'latitude': latitude, 'longitude': longitude}
        response = requests.get(f"{self.base_url}/detect", params=params)
        response.raise_for_status()
        return response.json()

    def find_nearby(self, latitude: float, longitude: float, radius_km: float = 5.0) -> Dict[str, Any]:
        """Find nearby postal codes"""
        params = {'latitude': latitude, 'longitude': longitude, 'radius': radius_km}
        response = requests.get(f"{self.base_url}/api/v1/nearby", params=params)
        response.raise_for_status()
        return response.json()

    def advanced_search(self, **filters) -> Dict[str, Any]:
        """Advanced search with multiple filters"""
        response = requests.get(f"{self.base_url}/api/v1/search", params=filters)
        response.raise_for_status()
        return response.json()

# Usage examples
api = KodeposAPI()

# Basic search
results = api.search("Jakarta")
print(f"Found {len(results['data'])} results")

# Location detection
location = api.detect(-6.2088, 106.8456)
print(f"Postal code: {location['data']['code']}")

# Nearby search
nearby = api.find_nearby(-6.2088, 106.8456, radius_km=3)
print(f"Found {nearby['data']['total']} nearby locations")

# Advanced search
filtered_results = api.advanced_search(
    provinsi="DKI Jakarta",
    kota="Jakarta Pusat"
)
print(f"Found {filtered_results['total']} filtered results")
```

### React Integration

**React component with hooks:**

```jsx
import React, { useState, useEffect } from 'react';

function PostalCodeSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchPostalCodes = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://your-api.workers.dev/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.statusCode === 200) {
        setResults(data.data);
      } else {
        setError('No results found');
      }
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        searchPostalCodes(query);
      }
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="postal-code-search">
      <h2>Indonesian Postal Code Search</h2>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter location name..."
        className="search-input"
      />

      {loading && <div className="loading">Searching...</div>}
      {error && <div className="error">{error}</div>}

      <div className="results">
        {results.map((item) => (
          <div key={item.code} className="result-item">
            <h3>{item.village}, {item.district}</h3>
            <p><strong>Postal Code:</strong> {item.code}</p>
            <p><strong>City:</strong> {item.regency}</p>
            <p><strong>Province:</strong> {item.province}</p>
            <p><strong>Coordinates:</strong> {item.latitude}, {item.longitude}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PostalCodeSearch;
```

---

## 🌍 Use Cases and Examples

### 1. E-commerce Application

**Address validation and autocomplete:**

```javascript
class AddressValidator {
  async validatePostalCode(postalCode, city, province) {
    const api = new KodeposAPI();

    // Search by postal code
    const results = await api.search(postalCode);

    if (results.statusCode !== 200) {
      return { valid: false, message: 'Invalid postal code' };
    }

    const match = results.data.find(item =>
      item.code === parseInt(postalCode) &&
      item.regency.toLowerCase().includes(city.toLowerCase()) &&
      item.province.toLowerCase().includes(province.toLowerCase())
    );

    return {
      valid: !!match,
      data: match,
      message: match ? 'Address is valid' : 'Postal code does not match city/province'
    };
  }

  async autocompleteAddress(query) {
    const api = new KodeposAPI();
    return await api.search(query);
  }
}

// Usage in checkout form
const validator = new AddressValidator();

// Validate user input
const result = await validator.validatePostalCode('10110', 'Jakarta Pusat', 'DKI Jakarta');
if (!result.valid) {
  alert(result.message);
}
```

### 2. Logistics and Delivery

**Calculate delivery areas and optimize routes:**

```javascript
class DeliveryService {
  constructor() {
    this.api = new KodeposAPI();
  }

  async getDeliveryArea(centerLat, centerLng, radiusKm) {
    const nearby = await this.api.findNearby(centerLat, centerLng, radiusKm);

    return {
      totalPostalCodes: nearby.data.data.length,
      postalCodes: nearby.data.data.map(item => ({
        code: item.code,
        village: item.village,
        district: item.district,
        distance: item.distance_km
      })),
      coverage: this.calculateCoverage(nearby.data.data)
    };
  }

  calculateCoverage(locations) {
    // Calculate coverage metrics
    const totalPostalCodes = locations.length;
    const coveredDistricts = new Set(locations.map(item => item.district)).size;
    const coveredCities = new Set(locations.map(item => item.regency)).size;

    return {
      totalPostalCodes,
      uniqueDistricts: coveredDistricts,
      uniqueCities: coveredCities
    };
  }

  async optimizeDeliveryRoute(waypoints) {
    // Get location details for each waypoint
    const locationDetails = await Promise.all(
      waypoints.map(async (point) => {
        const location = await this.api.detect(point.latitude, point.longitude);
        return {
          ...point,
          postalCode: location.data.code,
          address: `${location.data.village}, ${location.data.district}, ${location.data.regency}`
        };
      })
    );

    return locationDetails;
  }
}

// Example usage
const delivery = new DeliveryService();
const deliveryArea = await delivery.getDeliveryArea(-6.2088, 106.8456, 10);
console.log(`Delivery covers ${deliveryArea.totalPostalCodes} postal codes`);
```

### 3. Real Estate Application

**Property location services:**

```javascript
class RealEstateService {
  constructor() {
    this.api = new KodeposAPI();
  }

  async getPropertiesByArea(searchQuery) {
    const locations = await this.api.search(searchQuery);

    return locations.data.map(location => ({
      postalCode: location.code,
      village: location.village,
      district: location.district,
      city: location.regency,
      province: location.province,
      coordinates: {
        lat: location.latitude,
        lng: location.longitude
      }
    }));
  }

  async findNearbyAmenities(propertyLat, propertyLng, radiusKm = 2) {
    const nearby = await this.api.findNearby(propertyLat, propertyLng, radiusKm);

    // Group by district for better analysis
    const districts = {};
    nearby.data.data.forEach(location => {
      if (!districts[location.district]) {
        districts[location.district] = {
          district: location.district,
          villages: [],
          postalCodes: []
        };
      }
      districts[location.district].villages.push(location.village);
      districts[location.district].postalCodes.push(location.code);
    });

    return Object.values(districts);
  }

  async analyzeNeighborhood(latitude, longitude) {
    const location = await this.api.detect(latitude, longitude);
    const nearbyAreas = await this.findNearbyAmenities(latitude, longitude, 3);

    return {
      primaryLocation: location.data,
      nearbyAreas,
      analysis: {
        totalDistricts: nearbyAreas.length,
        totalVillages: nearbyAreas.reduce((sum, area) => sum + area.villages.length, 0)
      }
    };
  }
}

// Usage in property listing
const realEstate = new RealEstateService();
const neighborhood = await realEstate.analyzeNeighborhood(-6.2088, 106.8456);
console.log(`Property located in ${neighborhood.primaryLocation.village}`);
```

---

## 📱 Mobile App Integration

### React Native Example

```jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import * as Location from 'expo-location';

function PostalCodeFinder() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const searchPostalCodes = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://your-api.workers.dev/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.statusCode === 200) {
        setResults(data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectCurrentPostalCode = async () => {
    if (!currentLocation) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://your-api.workers.dev/detect?latitude=${currentLocation.latitude}&longitude=${currentLocation.longitude}`
      );
      const data = await response.json();

      if (data.statusCode === 200) {
        setResults([data.data]);
      }
    } catch (error) {
      console.error('Detection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderResult = ({ item }) => (
    <TouchableOpacity style={styles.resultItem}>
      <Text style={styles.villageName}>{item.village}</Text>
      <Text style={styles.details}>{item.district}, {item.regency}</Text>
      <Text style={styles.postalCode}>Kode Pos: {item.code}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Postal Code Finder</Text>

      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Search location..."
        onSubmitEditing={() => searchPostalCodes(query)}
      />

      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={detectCurrentPostalCode}
      >
        <Text style={styles.buttonText}>Use Current Location</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#0066cc" />
      ) : (
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={(item) => item.code.toString()}
          style={styles.resultsList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: 'white'
  },
  currentLocationButton: {
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2
  },
  villageName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3
  },
  postalCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066cc'
  }
});

export default PostalCodeFinder;
```

---

## 🔧 Configuration Options

### Rate Limiting

**API Rate Limits:**
- **Public API**: 100 requests per minute per IP
- **Premium**: Custom rate limits available
- **Enterprise**: Unlimited with dedicated infrastructure

**Headers for Rate Limiting:**
```bash
curl -I "https://your-api.workers.dev/search?q=Jakarta"

# Response headers:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99
# X-RateLimit-Reset: 1638360000
```

### Caching Behavior

**Automatic Caching:**
- **Location Detection**: 24-hour cache
- **Search Results**: 6-hour cache
- **Nearby Search**: 6-hour cache
- **Statistics**: 1-hour cache

**Cache Control Headers:**
```bash
curl -I "https://your-api.workers.dev/search?q=Jakarta"

# Response headers:
# Cache-Control: public, max-age=21600
# Age: 1234
# X-Cache: HIT
```

---

## 🚨 Error Handling

### Common Error Responses

**Invalid Parameters:**
```json
{
  "success": false,
  "error": "Invalid coordinates",
  "message": "Latitude must be between -11 and 6 for Indonesian coordinates",
  "timestamp": "2025-11-26T04:38:00.000Z",
  "version": "1.0.0"
}
```

**No Results Found:**
```json
{
  "statusCode": 404,
  "code": "NOT_FOUND",
  "data": []
}
```

**Rate Limited:**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "timestamp": "2025-11-26T04:38:00.000Z",
  "version": "1.0.0"
}
```

### Best Practices for Error Handling

**JavaScript Example:**
```javascript
async function searchWithErrorHandling(query) {
  try {
    const response = await fetch(`https://your-api.workers.dev/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (response.status === 404) {
        return { data: [], statusCode: 404 };
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Search failed:', error);

    // Return error-safe response
    return {
      statusCode: 500,
      code: "ERROR",
      data: [],
      error: error.message
    };
  }
}
```

---

## 📞 Support and Help

### Getting Help

1. **Documentation**: Check this guide and [API Documentation](./API.md)
2. **GitHub Issues**: Report bugs at https://github.com/mxwllalpha/kodepos-api/issues
3. **Email Contact**: mxwllalpha@gmail.com

### Troubleshooting

**Common Issues and Solutions:**

| Issue | Cause | Solution |
|-------|-------|----------|
| No results found | Invalid search query | Check spelling, try broader terms |
| Coordinate detection fails | Invalid coordinates | Ensure coordinates are within Indonesian bounds |
| Slow response times | Network issues | Check internet connection, try again |
| Rate limiting | Too many requests | Wait before making more requests |

### API Status

**Check API status anytime:**
```bash
# Basic health check
curl "https://your-api.workers.dev/health"

# Detailed health with statistics
curl "https://your-api.workers.dev/health/detailed"
```

---

## 📈 Tips and Best Practices

### Performance Tips

1. **Use Appropriate Endpoints**:
   - Use legacy endpoints for existing applications
   - Use modern endpoints for new applications

2. **Cache Results**: Implement client-side caching for frequently accessed data

3. **Batch Requests**: Group multiple requests when possible

4. **Optimize Search Terms**: Use specific location names for better results

### Integration Best Practices

1. **Error Handling**: Always implement proper error handling
2. **Rate Limiting**: Respect rate limits and implement backoff strategies
3. **Data Validation**: Validate API responses before using in applications
4. **Monitoring**: Monitor API usage and performance

### Data Quality

1. **Coordinate Accuracy**: Coordinates are accurate to approximately 100 meters
2. **Administrative Names**: Use standard Indonesian administrative names
3. **Timezone Support**: All locations include timezone information (WIB/WITA/WIT)

---

*Last Updated: November 26, 2025*
*User Guide Version: 1.0.0*
*Author: Maxwell Alpha (https://github.com/mxwllalpha)*