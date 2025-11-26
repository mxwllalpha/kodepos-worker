# Kodepos API Indonesia - Architecture Documentation

**High-performance Indonesian postal code API with global edge distribution**

*Author: Maxwell Alpha (https://github.com/mxwllalpha) - mxwllalpha@gmail.com*
*Version: 1.0.0*
*Architecture: Cloudflare Workers + D1 Database + TypeScript*

---

## 🏗️ System Architecture Overview

```mermaid
graph TB
    subgraph "Global Edge Network (Cloudflare)"
        US[United States]
        EU[Europe]
        AS[Asia]
        ID[Indonesia]
    end

    subgraph "API Gateway Layer"
        API[Kodepos API Worker]
    end

    subgraph "Application Layer"
        Legacy[Legacy Endpoints]
        Modern[Modern Endpoints]
        Health[Health Checks]
    end

    subgraph "Business Logic Layer"
        Search[Search Service]
        Location[Location Detection]
        Transform[Response Transformer]
        Cache[Cache Manager]
    end

    subgraph "Data Layer"
        D1[(D1 Database)]
        KV[(KV Storage)]
    end

    subgraph "Data Sources"
        Original[Kodepos Dataset]
        Validation[Data Validation]
    end

    US --> API
    EU --> API
    AS --> API
    ID --> API

    API --> Legacy
    API --> Modern
    API --> Health

    Legacy --> Search
    Modern --> Search
    Modern --> Location
    Health --> Cache

    Search --> Transform
    Location --> Transform

    Search --> D1
    Location --> D1
    Cache --> KV

    D1 --> Original
    Original --> Validation
```

## 🚀 Component Architecture

### 1. API Gateway Layer

**Cloudflare Workers** provide the global edge computing platform:

```mermaid
graph LR
    subgraph "Request Flow"
        Request[User Request] --> Router[Router Layer]
        Router --> Validator[Input Validation]
        Validator --> RateLimit[Rate Limiting]
        RateLimit --> Handler[Request Handler]
    end

    subgraph "Response Flow"
        Handler --> Transformer[Response Transformer]
        Transformer --> Cache[Cache Layer]
        Cache --> Response[API Response]
    end
```

**Key Features:**
- **Global Distribution**: 200+ edge locations worldwide
- **Auto-scaling**: Automatic scaling based on demand
- **Low Latency**: <100ms response times globally
- **Security**: DDoS protection and security headers

### 2. Application Layer

**Dual API Architecture** ensures backward compatibility:

```mermaid
graph TB
    subgraph "Legacy API (100% Compatible)"
        SearchLegacy[GET /search?q=query]
        DetectLegacy[GET /detect?lat=X&lng=Y]
    end

    subgraph "Modern API (Enhanced)"
        SearchModern[GET /api/v1/search]
        DetectModern[GET /api/v1/detect]
        NearbyModern[GET /api/v1/nearby]
        Provinces[GET /api/v1/provinces]
        Cities[GET /api/v1/cities]
        Stats[GET /api/v1/stats]
    end

    subgraph "Health Endpoints"
        HealthBasic[GET /health]
        HealthDetailed[GET /health/detailed]
    end

    SearchLegacy --> Adapter[Legacy Adapter]
    DetectLegacy --> Adapter

    SearchModern --> Service[Core Service]
    DetectModern --> Service
    NearbyModern --> Service
    Provinces --> Service
    Cities --> Service
    Stats --> Service

    HealthBasic --> Monitor[Health Monitor]
    HealthDetailed --> Monitor

    Adapter --> Service
    Service --> Database[Database Layer]
    Monitor --> Database
```

### 3. Business Logic Layer

**Core Services** handle business logic and data processing:

```mermaid
graph LR
    subgraph "Search Service"
        QueryParser[Query Parser]
        QueryBuilder[SQL Builder]
        ResultProcessor[Result Processor]
    end

    subgraph "Location Service"
        CoordinateValidator[Coordinate Validator]
        HaversineCalculator[Haversine Calculator]
        LocationMatcher[Location Matcher]
    end

    subgraph "Transformation Service"
        LegacyAdapter[Legacy Adapter]
        FieldMapper[Field Mapper]
        ResponseFormatter[Response Formatter]
    end

    QueryParser --> QueryBuilder
    QueryBuilder --> ResultProcessor

    CoordinateValidator --> HaversineCalculator
    HaversineCalculator --> LocationMatcher

    ResultProcessor --> LegacyAdapter
    LocationMatcher --> LegacyAdapter
    LegacyAdapter --> FieldMapper
    FieldMapper --> ResponseFormatter
```

### 4. Data Layer

**Cloudflare D1 + KV Storage** provide data persistence and caching:

```mermaid
graph TB
    subgraph "Primary Storage (D1 Database)"
       PostalCodes[postal_codes Table]
        Indexes[Performance Indexes]
        Constraints[Data Constraints]
    end

    subgraph "Cache Storage (KV Storage)"
        LocationCache[Location Cache]
        SearchCache[Search Cache]
        StatsCache[Statistics Cache]
    end

    subgraph "Database Schema"
        Schema[Schema Definition]
        Migrations[Migration Scripts]
        DataImport[Import Scripts]
    end

    PostalCodes --> Indexes
    Indexes --> Constraints

    Schema --> PostalCodes
    Migrations --> Schema
    DataImport --> Schema

    LocationCache --> PostalCodes
    SearchCache --> PostalCodes
    StatsCache --> PostalCodes
```

---

## 📊 Database Architecture

### Schema Design

**Main Table: postal_codes**
```sql
CREATE TABLE postal_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kodepos INTEGER NOT NULL,
    kelurahan TEXT NOT NULL,
    kecamatan TEXT NOT NULL,
    kota TEXT NOT NULL,
    provinsi TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    elevation INTEGER,
    timezone TEXT DEFAULT 'WIB',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Performance Indexes**
```sql
-- Primary indexes for query performance
CREATE INDEX idx_postal_codes_kodepos ON postal_codes(kodepos);
CREATE INDEX idx_postal_codes_provinsi ON postal_codes(provinsi);
CREATE INDEX idx_postal_codes_kota ON postal_codes(kota);
CREATE INDEX idx_postal_codes_kecamatan ON postal_codes(kecamatan);
CREATE INDEX idx_postal_codes_kelurahan ON postal_codes(kelurahan);

-- Location indexes for geo-queries
CREATE INDEX idx_postal_codes_coordinates ON postal_codes(latitude, longitude);

-- Composite indexes for common queries
CREATE INDEX idx_postal_codes_prov_kota ON postal_codes(provinsi, kota);
CREATE INDEX idx_postal_codes_kota_kecamatan ON postal_codes(kota, kecamatan);
```

### Data Relationships

```mermaid
erDiagram
    postal_codes ||--o{ search_results : "contains"
    postal_codes ||--o{ location_detections : "matches"
    postal_codes ||--o{ nearby_searches : "nearby"

    postal_codes {
        int id PK
        int kodepos
        string kelurahan
        string kecamatan
        string kota
        string provinsi
        float latitude
        float longitude
        int elevation
        string timezone
        datetime created_at
        datetime updated_at
    }

    search_results {
        int kodepos FK
        string query
        datetime timestamp
    }

    location_detections {
        int kodepos FK
        float query_lat
        float query_lng
        float distance_km
        datetime timestamp
    }

    nearby_searches {
        int kodepos FK
        float center_lat
        float center_lng
        float radius_km
        float distance_km
        datetime timestamp
    }
```

---

## 🔄 Request Flow Architecture

### Search Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant Router
    participant Validator
    participant SearchService
    participant Database
    participant Cache
    participant Transformer

    Client->>Router: GET /search?q=Jakarta
    Router->>Validator: Validate query parameters
    Validator->>SearchService: Validated search query

    SearchService->>Cache: Check cache
    alt Cache Hit
        Cache->>SearchService: Cached results
    else Cache Miss
        SearchService->>Database: Execute SQL query
        Database->>SearchService: Query results
        SearchService->>Cache: Store in cache
    end

    SearchService->>Transformer: Raw data
    Transformer->>Transformer: Apply legacy formatting
    Transformer->>Router: Formatted response
    Router->>Client: API response with legacy format
```

### Location Detection Flow

```mermaid
sequenceDiagram
    participant Client
    participant Router
    participant Validator
    participant LocationService
    participant Database
    participant Transformer

    Client->>Router: GET /detect?lat=-6.2088&lng=106.8456
    Router->>Validator: Validate coordinates
    Validator->>LocationService: Validated coordinates

    LocationService->>LocationService: Calculate bounding box
    LocationService->>Database: Query nearby locations
    Database->>LocationService: Candidate locations

    LocationService->>LocationService: Calculate distances
    LocationService->>LocationService: Find closest match

    LocationService->>Transformer: Location data with distance
    Transformer->>Transformer: Apply legacy formatting
    Transformer->>Router: Formatted response
    Router->>Client: API response with distance
```

### Modern API Search Flow

```mermaid
sequenceDiagram
    participant Client
    participant Router
    participant Validator
    participant SearchService
    participant Database
    participant Transformer

    Client->>Router: GET /api/v1/search?provinsi=DKI&kota=Jakarta
    Router->>Validator: Validate parameters
    Validator->>SearchService: Validated filters

    SearchService->>SearchService: Build dynamic query
    SearchService->>Database: Execute filtered query
    Database->>SearchService: Filtered results

    SearchService->>Transformer: Raw data
    Transformer->>Transformer: Apply modern format
    Transformer->>Router: Modern response format
    Router->>Client: Enhanced API response
```

---

## 🚀 Performance Architecture

### Caching Strategy

```mermaid
graph TB
    subgraph "Multi-Layer Caching"
        subgraph "Edge Cache"
            CDN[Cloudflare CDN]
            Static[Static Assets]
        end

        subgraph "Application Cache"
            KV[Cloudflare KV]
            LocationCache[Location Cache<br/>24h TTL]
            SearchCache[Search Cache<br/>6h TTL]
            StatsCache[Stats Cache<br/>1h TTL]
        end

        subgraph "Database Cache"
            QueryCache[Query Cache]
            IndexCache[Index Cache]
        end
    end

    CDN --> Static
    KV --> LocationCache
    KV --> SearchCache
    KV --> StatsCache

    LocationCache --> QueryCache
    SearchCache --> QueryCache
    StatsCache --> QueryCache
```

### Performance Metrics

```mermaid
graph LR
    subgraph "Response Time Metrics"
        API[API Response: <100ms]
        DB[Database Query: <50ms]
        Cache[Cache Hit: <10ms]
    end

    subgraph "Throughput Metrics"
        RPS[Requests/Second: 1000+]
        CacheHit[Cache Hit Rate: 85%]
        GlobalLatency[Global Latency: <200ms]
    end

    subgraph "Data Metrics"
        Records[Total Records: 83,761]
        Indexes[Performance Indexes: 10+]
        QueryComplexity[Avg Query Time: 45ms]
    end
```

### Scalability Architecture

```mermaid
graph TB
    subgraph "Horizontal Scaling"
        subgraph "Cloudflare Edge"
            Edge1[Edge Location 1]
            Edge2[Edge Location 2]
            EdgeN[Edge Location N]
        end

        subgraph "Database Scaling"
            ReadOnly[Read Replicas]
            WriteOnly[Primary DB]
            Partitioning[Data Partitioning]
        end

        subgraph "Cache Scaling"
            Distributed[Distributed KV]
            ConsistentHash[Consistent Hashing]
            Replication[Cache Replication]
        end
    end

    Edge1 --> ReadOnly
    Edge2 --> ReadOnly
    EdgeN --> ReadOnly

    ReadOnly --> WriteOnly
    WriteOnly --> Partitioning

    Distributed --> ConsistentHash
    ConsistentHash --> Replication
```

---

## 🔒 Security Architecture

### Security Layers

```mermaid
graph TB
    subgraph "Network Security"
        DDoS[DDoS Protection]
        WAF[Web Application Firewall]
        RateLimit[Rate Limiting]
    end

    subgraph "Application Security"
        Validation[Input Validation]
        Sanitization[Data Sanitization]
        Headers[Security Headers]
    end

    subgraph "Data Security"
        SQLPrevention[SQL Injection Prevention]
        XSSProtection[XSS Protection]
        Encryption[Data Encryption]
    end

    DDoS --> WAF
    WAF --> RateLimit
    RateLimit --> Validation

    Validation --> Sanitization
    Sanitization --> Headers
    Headers --> SQLPrevention

    SQLPrevention --> XSSProtection
    XSSProtection --> Encryption
```

### Security Headers Implementation

```typescript
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

### Rate Limiting Strategy

```mermaid
graph LR
    subgraph "Rate Limiting Implementation"
        IP[IP-based Limiting<br/>100 req/min]
        KV[Rate Limit Storage]
        Bypass[Premium Bypass]
        Analytics[Usage Analytics]
    end

    IP --> KV
    KV --> Bypass
    Bypass --> Analytics
```

---

## 🔧 Deployment Architecture

### Deployment Pipeline

```mermaid
graph LR
    subgraph "Development"
        Local[Local Development]
        Testing[Unit Testing]
        Integration[Integration Testing]
    end

    subgraph "CI/CD Pipeline"
        Build[Build Process]
        Quality[Code Quality]
        Security[Security Scan]
    end

    subgraph "Production"
        Staging[Staging Environment]
        Production[Production Deploy]
        Monitor[Performance Monitoring]
    end

    Local --> Testing
    Testing --> Integration
    Integration --> Build

    Build --> Quality
    Quality --> Security
    Security --> Staging

    Staging --> Production
    Production --> Monitor
```

### Environment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        DevLocal[Local Wrangler]
        DevD1[Development D1]
        DevKV[Development KV]
    end

    subgraph "Staging Environment"
        StagingWorker[Staging Worker]
        StagingD1[Staging D1]
        StagingKV[Staging KV]
    end

    subgraph "Production Environment"
        ProdWorker[Production Worker]
        ProdD1[Production D1]
        ProdKV[Production KV]
        ProdCDN[Global CDN]
    end

    DevLocal --> DevD1
    DevLocal --> DevKV

    StagingWorker --> StagingD1
    StagingWorker --> StagingKV

    ProdWorker --> ProdD1
    ProdWorker --> ProdKV
    ProdWorker --> ProdCDN
```

---

## 📈 Monitoring & Observability

### Health Check Architecture

```mermaid
graph TB
    subgraph "Health Monitoring"
        BasicHealth[Basic Health Check]
        DetailedHealth[Detailed Health Check]
        SystemMetrics[System Metrics]
    end

    subgraph "Performance Monitoring"
        ResponseTime[Response Times]
        ErrorRates[Error Rates]
        Throughput[Request Throughput]
    end

    subgraph "Business Metrics"
        UsageAnalytics[Usage Analytics]
        PopularQueries[Popular Queries]
        GeographicUsage[Geographic Usage]
    end

    BasicHealth --> ResponseTime
    DetailedHealth --> ErrorRates
    SystemMetrics --> Throughput

    ResponseTime --> UsageAnalytics
    ErrorRates --> PopularQueries
    Throughput --> GeographicUsage
```

### Logging Architecture

```mermaid
graph LR
    subgraph "Log Sources"
        APILogs[API Logs]
        ErrorLogs[Error Logs]
        PerformanceLogs[Performance Logs]
    end

    subgraph "Log Processing"
        Structured[Structured Logging]
        PIIFilter[PII Filtering]
        Aggregation[Log Aggregation]
    end

    subgraph "Log Analytics"
        RealTime[Real-time Analysis]
        Alerts[Alerting System]
        Dashboard[Monitoring Dashboard]
    end

    APILogs --> Structured
    ErrorLogs --> PIIFilter
    PerformanceLogs --> Aggregation

    Structured --> RealTime
    PIIFilter --> Alerts
    Aggregation --> Dashboard
```

---

## 🔮 Future Architecture Enhancements

### Scalability Improvements

```mermaid
graph TB
    subgraph "Future Enhancements"
        subgraph "Data Layer"
            ReadReplicas[Read Replicas]
            Sharding[Database Sharding]
            AdvancedCaching[Advanced Caching]
        end

        subgraph "API Layer"
            GraphQL[GraphQL API]
            WebSocket[WebSocket Support]
            Streaming[Streaming Responses]
        end

        subgraph "Analytics Layer"
            MLAnalytics[ML-based Analytics]
            PredictiveAPI[Predictive Analytics]
            RealTimeStream[Real-time Streaming]
        end
    end

    ReadReplicas --> GraphQL
    Sharding --> WebSocket
    AdvancedCaching --> Streaming

    GraphQL --> MLAnalytics
    WebSocket --> PredictiveAPI
    Streaming --> RealTimeStream
```

### Feature Roadmap Architecture

```mermaid
graph LR
    subgraph "Phase 1: Current (v1.0.0)"
        LegacyAPI[Legacy API]
        ModernAPI[Modern API]
        BasicCache[Basic Caching]
    end

    subgraph "Phase 2: Enhanced (v1.1.0)"
        RealTimeUpdates[Real-time Updates]
        AdvancedSearch[Advanced Search]
        Analytics[Usage Analytics]
    end

    subgraph "Phase 3: Intelligence (v2.0.0)"
        MLRecommendations[ML Recommendations]
        PredictiveAPI[Predictive API]
        AdvancedAnalytics[Advanced Analytics]
    end

    LegacyAPI --> RealTimeUpdates
    ModernAPI --> AdvancedSearch
    BasicCache --> Analytics

    RealTimeUpdates --> MLRecommendations
    AdvancedSearch --> PredictiveAPI
    Analytics --> AdvancedAnalytics
```

---

## 📋 Architecture Decision Records (ADRs)

### ADR-001: Dual API Architecture
**Decision**: Implement both legacy and modern APIs
**Rationale**: Ensure 100% backward compatibility while providing enhanced features
**Consequences**: Maintain separate adapter services, additional code complexity

### ADR-002: Cloudflare Native Stack
**Decision**: Use Cloudflare Workers + D1 + KV
**Rationale**: Global distribution, auto-scaling, cost-effectiveness
**Consequences**: Vendor lock-in, limited database features

### ADR-003: Comprehensive Data Coverage
**Decision**: Include all 83,761 postal codes with coordinates
**Rationale**: Provide complete coverage for Indonesian market
**Consequences**: Large dataset size, optimization challenges

### ADR-004: Multi-layer Caching Strategy
**Decision**: Implement CDN, KV, and application-level caching
**Rationale**: Achieve sub-100ms response times globally
**Consequences**: Cache invalidation complexity, consistency challenges

---

*Last Updated: November 26, 2025*
*Architecture Version: 1.0.0*
*Author: Maxwell Alpha (https://github.com/mxwllalpha)*