# TradeInsight Pro - Backend

FastAPI-based backend service for real-time trading analytics.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── api/                 # API routes
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── stocks.py    # Stock data endpoints
│   │   │   ├── indicators.py # Indicator calculation endpoints
│   │   │   └── websocket.py  # Real-time data streaming
│   ├── core/                # Core configuration
│   │   ├── __init__.py
│   │   ├── config.py        # Application settings
│   │   └── security.py      # Security utilities
│   ├── models/              # Data models
│   │   ├── __init__.py
│   │   ├── stock.py         # Stock data models
│   │   └── indicator.py     # Indicator models
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   ├── market_data.py   # Market data fetching
│   │   ├── indicators.py    # Technical indicator calculations
│   │   └── streaming.py     # WebSocket streaming logic
│   ├── db/                  # Database utilities
│   │   ├── __init__.py
│   │   ├── postgres.py      # PostgreSQL connection
│   │   ├── redis.py         # Redis connection
│   │   └── influxdb.py      # InfluxDB connection
│   └── utils/               # Utility functions
│       ├── __init__.py
│       └── helpers.py
├── config/                  # Configuration files
├── tests/                   # Test suite
├── requirements.txt         # Python dependencies
├── Dockerfile              # Docker configuration
└── README.md               # This file
```

## API Endpoints

### Stocks
- `GET /api/v1/stocks/search?q={query}` - Search stocks
- `GET /api/v1/stocks/{symbol}` - Get stock details
- `GET /api/v1/stocks/{symbol}/history` - Get historical data

### Indicators
- `GET /api/v1/indicators/list` - List all available indicators
- `GET /api/v1/indicators/{symbol}/{indicator_name}` - Calculate specific indicator
- `POST /api/v1/indicators/calculate` - Calculate multiple indicators

### WebSocket
- `WS /ws/market-data/{symbol}` - Real-time market data stream
- `WS /ws/indicators/{symbol}` - Real-time indicator updates

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Application
APP_NAME=TradeInsight Pro
DEBUG=True
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tradeinsight
REDIS_URL=redis://localhost:6379/0
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=your-influxdb-token
INFLUXDB_ORG=your-org
INFLUXDB_BUCKET=market-data

# Market Data APIs
ALPHA_VANTAGE_API_KEY=your-api-key
FINNHUB_API_KEY=your-api-key
YAHOO_FINANCE_ENABLED=True

# WebSocket
WS_HEARTBEAT_INTERVAL=30
```

## Development

Run tests:
```bash
pytest tests/ -v
```

Run with auto-reload:
```bash
uvicorn app.main:app --reload
```

Generate requirements:
```bash
pip freeze > requirements.txt
```
