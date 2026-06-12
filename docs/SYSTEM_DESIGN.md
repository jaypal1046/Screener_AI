# System Architecture Design
## TradeInsight Pro - Technical Design Document

**Version:** 1.0  
**Date:** 2024  
**Phase:** 3 - Design

---

## 1. System Overview

### 1.1 Architecture Pattern
TradeInsight Pro follows a **Microservices Architecture** with the following key components:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Web App   │  │  Mobile App │  │   Desktop   │          │
│  │  (React.js) │  │  (React     │  │   (Electron │          │
│  │             │  │   Native)   │  │   Future)   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              NGINX / AWS API Gateway                 │    │
│  │  - Rate Limiting  - Authentication  - Routing        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Services                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   User   │ │  Market  │ │Indicator │ │  Alert   │       │
│  │ Service  │ │  Data    │ │ Service  │ │ Service  │       │
│  │          │ │ Service  │ │          │ │          │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │Watchlist │ │  Chart   │ │  Export  │                     │
│  │ Service  │ │ Service  │ │ Service  │                     │
│  │          │ │          │ │          │                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │PostgreSQL│ │  Redis   │ │TimeSeries│ │  Object  │       │
│  │(Primary) │ │ (Cache)  │ │   DB     │ │  Storage │       │
│  │          │ │          │ │(InfluxDB)│ │   (S3)   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  External APIs Layer                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Alpha   │ │  Yahoo   │ │ Finnhub  │ │  IEX     │       │
│  │ Vantage  │ │ Finance  │ │          │ │  Cloud   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

#### Frontend
- **Framework:** React.js 18+ with TypeScript
- **State Management:** Redux Toolkit + RTK Query
- **Charting Library:** Lightweight Charts (TradingView) + D3.js for custom indicators
- **UI Components:** Material-UI (MUI) v5
- **Build Tool:** Vite
- **Testing:** Jest + React Testing Library + Cypress (E2E)

#### Backend
- **Runtime:** Node.js 20 LTS / Python 3.11 (for indicator calculations)
- **Framework:** FastAPI (Python) + Express.js (Node.js)
- **API Documentation:** OpenAPI/Swagger
- **Authentication:** JWT + OAuth 2.0
- **Message Queue:** Redis Streams / RabbitMQ

#### Data Processing
- **Indicator Calculations:** TA-Lib, Pandas, NumPy
- **Real-time Processing:** Apache Kafka / Redis Streams
- **Data Aggregation:** Custom aggregation service

#### Database
- **Primary DB:** PostgreSQL 15 (user data, configurations)
- **Cache:** Redis 7 (session, market data cache)
- **Time Series:** InfluxDB 2.0 (historical market data)
- **Object Storage:** AWS S3 / MinIO (exports, screenshots)

#### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Orchestration:** Kubernetes (production)
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)

---

## 2. Component Design

### 2.1 Frontend Architecture

#### Component Hierarchy
```
App
├── Layout
│   ├── Header
│   │   ├── SearchBar
│   │   ├── UserMenu
│   │   └── Notifications
│   ├── Sidebar
│   │   ├── WatchlistPanel
│   │   └── LayoutsPanel
│   └── MainContent
│       ├── ChartContainer
│       │   ├── ChartHeader (timeframe, symbol info)
│       │   ├── MainChart (candlestick + overlays)
│       │   ├── IndicatorPane (RSI, MACD, etc.)
│       │   └── DrawingTools
│       ├── IndicatorPanel
│       │   ├── TrendIndicators
│       │   ├── MomentumIndicators
│       │   ├── VolatilityIndicators
│       │   ├── VolumeIndicators
│       │   └── SupportResistanceIndicators
│       └── DetailsPanel
│           ├── SymbolInfo
│           ├── OrderBook (future)
│           └── NewsFeed
└── Footer
    └── StatusBar (connection status, last update)
```

#### Key Frontend Modules

**1. Chart Engine Module**
```typescript
interface ChartEngine {
  renderCandlestick(data: OHLCV[]): void;
  addIndicator(indicator: IndicatorConfig): void;
  removeIndicator(id: string): void;
  updateIndicators(newData: OHLCV): void;
  setZoom(level: number): void;
  setPan(offset: number): void;
  addDrawing(tool: DrawingTool): void;
}
```

**2. Indicator Manager Module**
```typescript
interface IndicatorManager {
  getAvailableIndicators(): IndicatorDefinition[];
  calculate(symbol: string, indicator: string, params: Params): Promise<number[]>;
  validateParams(indicator: string, params: Params): boolean;
  getDefaultParams(indicator: string): Params;
}
```

**3. Data Stream Module**
```typescript
interface DataStream {
  connect(): Promise<void>;
  subscribe(symbol: string, callback: (data: OHLCV) => void): Subscription;
  unsubscribe(subscription: Subscription): void;
  reconnect(): Promise<void>;
}
```

### 2.2 Backend Services

#### Service 1: Market Data Service
**Responsibilities:**
- Fetch real-time and historical data from external APIs
- Cache market data in Redis
- Aggregate data across multiple timeframes
- Handle API rate limiting and failover

**API Endpoints:**
```python
# FastAPI example
@app.get("/api/v1/market-data/{symbol}")
async def get_market_data(symbol: str, timeframe: str = "1D"):
    # Check cache first
    cached = await redis.get(f"market:{symbol}:{timeframe}")
    if cached:
        return json.loads(cached)
    
    # Fetch from primary API
    data = await fetch_from_alpha_vantage(symbol, timeframe)
    
    # Cache for 5 seconds
    await redis.setex(f"market:{symbol}:{timeframe}", 5, json.dumps(data))
    
    return data

@app.get("/api/v1/historical/{symbol}")
async def get_historical_data(
    symbol: str,
    timeframe: str,
    start_date: datetime,
    end_date: datetime
):
    # Query InfluxDB for historical data
    query = f'''
        FROM(bucket: "market_data")
        |> range(start: {start_date}, stop: {end_date})
        |> filter(fn: (r) => r._measurement == "{symbol}")
        |> filter(fn: (r) => r.timeframe == "{timeframe}")
    '''
    result = await influxdb.query(query)
    return format_influxdb_result(result)
```

#### Service 2: Indicator Calculation Service
**Responsibilities:**
- Calculate all 40 technical indicators
- Optimize calculations for performance
- Support custom parameters
- Cache calculation results

**Implementation:**
```python
import talib
import numpy as np
import pandas as pd

class IndicatorCalculator:
    def __init__(self):
        self.cache = {}
    
    def calculate_rsi(self, close_prices: np.ndarray, period: int = 14) -> np.ndarray:
        """Calculate RSI using TA-Lib"""
        return talib.RSI(close_prices, timeperiod=period)
    
    def calculate_macd(
        self, 
        close_prices: np.ndarray,
        fast: int = 12,
        slow: int = 26,
        signal: int = 9
    ) -> dict:
        """Calculate MACD with line, signal, and histogram"""
        macd_line, signal_line, histogram = talib.MACD(
            close_prices,
            fastperiod=fast,
            slowperiod=slow,
            signalperiod=signal
        )
        return {
            'macd': macd_line,
            'signal': signal_line,
            'histogram': histogram
        }
    
    def calculate_bollinger_bands(
        self,
        close_prices: np.ndarray,
        period: int = 20,
        std_dev: float = 2.0
    ) -> dict:
        """Calculate Bollinger Bands"""
        upper, middle, lower = talib.BBANDS(
            close_prices,
            timeperiod=period,
            nbdevup=std_dev,
            nbdevdn=std_dev
        )
        return {
            'upper': upper,
            'middle': middle,
            'lower': lower
        }
    
    def calculate_all_indicators(
        self,
        ohlcv_data: pd.DataFrame,
        indicator_configs: list
    ) -> dict:
        """Calculate multiple indicators efficiently"""
        results = {}
        
        for config in indicator_configs:
            indicator_name = config['name']
            params = config.get('parameters', {})
            
            # Use method dispatcher
            method_name = f"calculate_{indicator_name.lower()}"
            if hasattr(self, method_name):
                method = getattr(self, method_name)
                results[indicator_name] = method(ohlcv_data, **params)
        
        return results
```

#### Service 3: User Management Service
**Responsibilities:**
- User authentication and authorization
- Session management
- Profile management
- Subscription handling

**Database Schema:**
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

#### Service 4: Watchlist Service
**Responsibilities:**
- Create, read, update, delete watchlists
- Manage watchlist items
- Real-time price updates for watchlist symbols

**API Endpoints:**
```python
@app.post("/api/v1/watchlists")
async def create_watchlist(
    name: str,
    symbols: List[str],
    current_user: User = Depends(get_current_user)
):
    watchlist = await db.watchlists.create(
        user_id=current_user.user_id,
        name=name,
        symbols=symbols
    )
    return watchlist

@app.get("/api/v1/watchlists")
async def get_watchlists(current_user: User = Depends(get_current_user)):
    watchlists = await db.watchlists.get_by_user(current_user.user_id)
    return watchlists

@app.websocket("/ws/watchlist-updates")
async def watchlist_updates(websocket: WebSocket):
    await websocket.accept()
    while True:
        # Send real-time updates for watched symbols
        updates = await get_price_updates()
        await websocket.send_json(updates)
```

#### Service 5: Alert Service
**Responsibilities:**
- Create and manage alerts
- Monitor indicator conditions
- Send notifications via email/push

**Alert Evaluation Engine:**
```python
class AlertEngine:
    def __init__(self):
        self.active_alerts = {}
    
    async def evaluate_alerts(self, symbol: str, current_data: dict):
        """Evaluate all active alerts for a symbol"""
        alerts = await self.get_active_alerts(symbol)
        
        for alert in alerts:
            condition_met = await self.check_condition(
                alert.condition,
                current_data
            )
            
            if condition_met:
                await self.trigger_alert(alert)
                if alert.one_time:
                    await self.deactivate_alert(alert.id)
    
    async def check_condition(
        self,
        condition: AlertCondition,
        data: dict
    ) -> bool:
        """Check if alert condition is met"""
        indicator_value = data.get(condition.indicator)
        
        if condition.operator == "crosses_above":
            return (
                indicator_value > condition.threshold and
                data.get('previous_' + condition.indicator) <= condition.threshold
            )
        elif condition.operator == "greater_than":
            return indicator_value > condition.threshold
        elif condition.operator == "less_than":
            return indicator_value < condition.threshold
        
        return False
```

---

## 3. Database Design

### 3.1 Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    Users    │       │  Watchlists  │       │   Symbols   │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ user_id PK  │──┐    │ watchlist_id │──┐    │ symbol_id   │
│ email       │  │    │ user_id FK   │  │    │ symbol      │
│ password    │  │    │ name         │  │    │ name        │
│ created_at  │  │    │ created_at   │  │    │ exchange    │
└─────────────┘  │    └──────────────┘  │    │ type        │
                 │                      │    └─────────────┘
                 │    ┌──────────────┐  │
                 │    │WatchlistItems│  │
                 └───▶│ id PK        │  │
                      │ watchlist_fk │◀─┘
                      │ symbol       │
                      │ added_at     │
                      └──────────────┘

┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│SavedLayouts │       │    Alerts    │       │MarketData   │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ layout_id   │       │ alert_id     │       │ symbol      │
│ user_id FK  │       │ user_id FK   │       │ timestamp   │
│ name        │       │ symbol       │       │ open        │
│ config_json │       │ indicator    │       │ high        │
│ created_at  │       │ condition    │       │ low         │
└─────────────┘       │ threshold    │       │ close       │
                      │ is_active    │       │ volume      │
                      └──────────────┘       └─────────────┘
```

### 3.2 Time Series Data Model (InfluxDB)

```
Measurement: market_data
Tags: symbol, exchange, timeframe
Fields: open, high, low, close, volume, adjusted_close
Timestamp: nanosecond precision

Example Write:
market_data,symbol=AAPL,exchange=NASDAQ,timeframe=1D 
open=185.50,high=186.20,low=185.10,close=185.90,volume=1250000 
1705329000000000000
```

### 3.3 Redis Cache Structure

```
# Market Data Cache (TTL: 5 seconds)
SET market:AAPL:1D {"open":185.50,"high":186.20,...}
EXPIRE market:AAPL:1D 5

# User Session Cache (TTL: 30 minutes)
SET session:abc123 {"user_id":"usr_123","email":"..."}
EXPIRE session:abc123 1800

# Indicator Calculation Cache (TTL: 1 minute)
SET indicator:AAPL:RSI:14 [45.2, 46.1, 47.3, ...]
EXPIRE indicator:AAPL:RSI:14 60

# Rate Limiting Counter
INCR rate_limit:user:usr_123:alpha_vantage
EXPIRE rate_limit:user:usr_123:alpha_vantage 60
```

---

## 4. API Design

### 4.1 RESTful API Specification

#### Authentication Endpoints
```yaml
POST /api/v1/auth/register:
  summary: Register new user
  request:
    email: string
    password: string
    firstName: string
    lastName: string
  response:
    userId: string
    token: string

POST /api/v1/auth/login:
  summary: Login user
  request:
    email: string
    password: string
  response:
    userId: string
    token: string
    expiresIn: number

POST /api/v1/auth/refresh:
  summary: Refresh access token
  headers:
    Authorization: Bearer <refresh_token>
  response:
    token: string
    expiresIn: number
```

#### Market Data Endpoints
```yaml
GET /api/v1/market/symbols/search:
  summary: Search for symbols
  parameters:
    q: string (query)
    type: string (stock|index|etf|forex|crypto)
    limit: number (default: 10)
  response:
    - symbol: string
      name: string
      exchange: string
      type: string

GET /api/v1/market/quotes/{symbol}:
  summary: Get real-time quote
  parameters:
    symbol: string (path)
  response:
    symbol: string
    price: number
    change: number
    changePercent: number
    volume: number
    timestamp: datetime

GET /api/v1/market/history/{symbol}:
  summary: Get historical data
  parameters:
    symbol: string (path)
    timeframe: string (1m|5m|15m|30m|1h|4h|1D|1W|1M)
    start: datetime (query)
    end: datetime (query)
  response:
    - timestamp: datetime
      open: number
      high: number
      low: number
      close: number
      volume: number
```

#### Indicator Endpoints
```yaml
GET /api/v1/indicators/available:
  summary: List all available indicators
  response:
    - name: string
      category: string
      description: string
      defaultParams: object
      minParams: object
      maxParams: object

GET /api/v1/indicators/{symbol}/{indicator}:
  summary: Calculate indicator for symbol
  parameters:
    symbol: string (path)
    indicator: string (path)
    timeframe: string (query)
    params: object (query, JSON encoded)
  response:
    symbol: string
    indicator: string
    values: number[]
    timestamps: datetime[]

POST /api/v1/indicators/calculate-batch:
  summary: Calculate multiple indicators
  request:
    symbol: string
    timeframe: string
    indicators:
      - name: string
        params: object
  response:
    symbol: string
    results:
      indicator_name:
        values: number[]
        metadata: object
```

#### User Endpoints
```yaml
GET /api/v1/user/watchlists:
  summary: Get user's watchlists
  headers:
    Authorization: Bearer <token>
  response:
    - watchlistId: string
      name: string
      symbols: string[]
      createdAt: datetime

POST /api/v1/user/layouts:
  summary: Save chart layout
  headers:
    Authorization: Bearer <token>
  request:
    name: string
    symbol: string
    timeframe: string
    indicators: array
    drawings: array
  response:
    layoutId: string
    name: string
    createdAt: datetime
```

### 4.2 WebSocket API

```javascript
// Connection
const ws = new WebSocket('wss://api.tradeinsight.pro/ws');

// Authentication
ws.send(JSON.stringify({
  type: 'auth',
  token: 'jwt_token_here'
}));

// Subscribe to market data
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'market_data',
  symbol: 'AAPL',
  timeframe: '1D'
}));

// Receive market data updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // data.type: 'market_update' | 'indicator_update' | 'alert_triggered'
};

// Subscribe to indicator updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'indicator',
  symbol: 'AAPL',
  indicator: 'RSI',
  params: { period: 14 }
}));
```

---

## 5. Security Design

### 5.1 Authentication Flow
```
1. User submits credentials → HTTPS POST /auth/login
2. Server validates credentials against database
3. Server generates JWT access token (15 min expiry)
4. Server generates refresh token (7 day expiry)
5. Server stores refresh token hash in database
6. Server returns tokens to client
7. Client stores tokens securely (httpOnly cookies)
8. Client includes access token in Authorization header
9. On expiry, client uses refresh token to get new access token
```

### 5.2 Security Measures

**Password Storage:**
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

**JWT Token Generation:**
```python
from datetime import datetime, timedelta
from jose import jwt

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

**Rate Limiting:**
```python
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter

@app.get("/api/v1/market/quotes/{symbol}", dependencies=[Depends(RateLimiter(times=10, seconds=60))])
async def get_quote(symbol: str):
    ...
```

**CORS Configuration:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tradeinsight.pro", "https://www.tradeinsight.pro"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

---

## 6. Performance Optimization

### 6.1 Caching Strategy

**Multi-Level Caching:**
```
Level 1: Browser Cache (static assets, 1 hour)
Level 2: CDN Cache (static assets, 24 hours)
Level 3: Redis Cache (market data, 5 seconds)
Level 4: Application Cache (indicator calculations, 1 minute)
Level 5: Database Query Cache (frequently accessed data)
```

### 6.2 Database Optimization

**Indexing Strategy:**
```sql
-- Users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created ON users(created_at);

-- Watchlists
CREATE INDEX idx_watchlists_user ON watchlists(user_id);
CREATE INDEX idx_watchlist_items_symbol ON watchlist_items(symbol);

-- Market data (InfluxDB)
-- Automatic indexing on tags (symbol, timeframe)
```

**Query Optimization:**
```python
# Use connection pooling
from databases import Database

database = Database("postgresql://user:pass@localhost/tradeinsight")

# Use prepared statements
query = "SELECT * FROM users WHERE email = :email"
user = await database.fetch_one(query, {"email": email})

# Use batch operations for inserts
await database.execute_many(query, values_list)
```

### 6.3 Indicator Calculation Optimization

**Vectorized Calculations:**
```python
import numpy as np
import numba

@numba.jit(nopython=True)
def calculate_sma_fast(prices: np.ndarray, period: int) -> np.ndarray:
    """Optimized SMA calculation using Numba JIT"""
    n = len(prices)
    result = np.empty(n)
    result[:period-1] = np.nan
    
    cumsum = np.cumsum(prices)
    result[period-1:] = (cumsum[period-1:] - cumsum[:-period+1]) / period
    result[period-1] = cumsum[period-1] / period
    
    return result
```

**Parallel Processing:**
```python
from concurrent.futures import ProcessPoolExecutor

def calculate_all_indicators_parallel(ohlcv_data, indicator_configs):
    with ProcessPoolExecutor() as executor:
        futures = []
        for config in indicator_configs:
            future = executor.submit(
                calculate_single_indicator,
                ohlcv_data,
                config
            )
            futures.append((config['name'], future))
        
        results = {}
        for name, future in futures:
            results[name] = future.result()
        
        return results
```

---

## 7. Deployment Architecture

### 7.1 Development Environment
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
  
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/tradeinsight
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=tradeinsight
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
  
  influxdb:
    image: influxdb:2.0
    ports:
      - "8086:8086"
    volumes:
      - influxdb_data:/var/lib/influxdb2

volumes:
  postgres_data:
  redis_data:
  influxdb_data:
```

### 7.2 Production Environment (Kubernetes)

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tradeinsight-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: tradeinsight/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: ClusterIP
```

---

## 8. Monitoring and Observability

### 8.1 Metrics Collection

**Key Metrics to Track:**
- API response times (p50, p95, p99)
- Error rates by endpoint
- Active users count
- WebSocket connections
- Indicator calculation times
- Cache hit/miss ratios
- Database query performance
- External API latency

**Prometheus Configuration:**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend-service:8000']
    metrics_path: '/metrics'
  
  - job_name: 'frontend'
    static_configs:
      - targets: ['frontend-service:3000']
```

### 8.2 Logging Strategy

**Structured Logging:**
```python
import structlog

logger = structlog.get_logger()

logger.info(
    "market_data_fetched",
    symbol="AAPL",
    timeframe="1D",
    latency_ms=45,
    source="alpha_vantage"
)
```

**Log Aggregation:**
```
Application → JSON Logs → Filebeat → Logstash → Elasticsearch → Kibana
```

---

## 9. Testing Strategy

### 9.1 Test Pyramid

```
        /\
       /  \      E2E Tests (Cypress)
      /----\     (10%)
     /      \
    /--------\   Integration Tests (Pytest/Jest)
   /          \  (20%)
  /------------\
 /              \  Unit Tests (Pytest/Jest)
/________________\ (70%)
```

### 9.2 Test Examples

**Unit Test (Indicator Calculation):**
```python
def test_rsi_calculation():
    prices = np.array([44, 44.25, 44.5, 44.75, 45, 45.25, 45.5, 45.75, 46, 46.25])
    expected_rsi = 70.0  # Simplified expected value
    
    calculator = IndicatorCalculator()
    result = calculator.calculate_rsi(prices, period=14)
    
    assert len(result) == len(prices)
    assert result[-1] > 50  # RSI should be bullish for rising prices
```

**Integration Test (API Endpoint):**
```python
@pytest.mark.asyncio
async def test_get_market_data(client):
    response = await client.get("/api/v1/market/quotes/AAPL")
    
    assert response.status_code == 200
    data = response.json()
    assert data['symbol'] == 'AAPL'
    assert 'price' in data
    assert 'volume' in data
```

**E2E Test (Cypress):**
```javascript
describe('Chart with Indicators', () => {
  it('should display RSI indicator on chart', () => {
    cy.visit('/chart/AAPL');
    cy.get('[data-testid="indicator-panel"]').should('be.visible');
    cy.contains('RSI').click();
    cy.get('[data-testid="indicator-pane-rsi"]').should('exist');
    cy.get('[data-testid="indicator-pane-rsi"]')
      .should('contain.text', 'RSI');
  });
});
```

---

## 10. Appendix

### 10.1 Indicator Implementation Status

| Category | Indicator | Status | Complexity |
|----------|-----------|--------|------------|
| Trend | SMA | ✅ Ready | Low |
| Trend | EMA | ✅ Ready | Low |
| Trend | MACD | ✅ Ready | Medium |
| Trend | Ichimoku | 🔄 In Progress | High |
| Momentum | RSI | ✅ Ready | Low |
| Momentum | Stochastic | ✅ Ready | Medium |
| Volatility | Bollinger Bands | ✅ Ready | Medium |
| Volume | OBV | ✅ Ready | Low |
| Support/Res | Pivot Points | 🔄 In Progress | Medium |

### 10.2 API Provider Comparison

| Provider | Free Tier | Rate Limit | Data Quality | Latency |
|----------|-----------|------------|--------------|---------|
| Alpha Vantage | 500/day | 5/min | High | < 1s |
| Yahoo Finance | Unlimited | Unofficial | Medium | < 2s |
| Finnhub | 60/min | 60/min | High | < 500ms |
| IEX Cloud | Paid only | 100k/mo | Very High | < 200ms |

### 10.3 Glossary

- **OHLCV**: Open, High, Low, Close, Volume
- **TA-Lib**: Technical Analysis Library
- **JWT**: JSON Web Token
- **CORS**: Cross-Origin Resource Sharing
- **CDN**: Content Delivery Network
- **E2E**: End-to-End (testing)

---

**Next Phase:** Development (Phase 4)
