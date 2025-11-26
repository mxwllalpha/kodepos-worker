# User Guide

**Kodepos API Indonesia - Complete Usage Guide**

*Author: Maxwell Alpha (https://github.com/mxwllalpha) - mxwllalpha@gmail.com*
*Version: 1.0.0*

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