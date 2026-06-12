# TradeInsight Pro 📈

**Real-time Trading Analytics Dashboard with 40+ Technical Indicators**

TradeInsight Pro is a comprehensive trading analytics platform that provides real-time market data and technical analysis for stocks, indices, and other financial instruments. Built with modern technologies, it offers traders and investors powerful tools to make informed decisions.

![Dashboard Preview](./docs/dashboard-preview.png)

## ✨ Features

### 🎯 Core Features
- **Real-time Market Data**: Live price updates via WebSocket connections
- **40+ Technical Indicators**: Comprehensive indicator library across 5 categories
- **Interactive Charts**: Candlestick charts with multiple indicator overlays
- **Signal Analysis**: Automated buy/sell/neutral signals with strength indicators
- **Multi-asset Support**: Stocks, indices, ETFs, and more

### 📊 Technical Indicators (40 Total)

#### Trend Indicators (8)
- SMA (Simple Moving Average)
- EMA (Exponential Moving Average)
- WMA (Weighted Moving Average)
- MACD (Moving Average Convergence Divergence)
- ADX (Average Directional Index)
- Ichimoku Cloud
- Parabolic SAR
- VWAP (Volume Weighted Average Price)

#### Momentum Indicators (8)
- RSI (Relative Strength Index)
- Stochastic Oscillator
- CCI (Commodity Channel Index)
- Williams %R
- ROC (Rate of Change)
- Momentum Indicator
- Ultimate Oscillator
- Awesome Oscillator

#### Volatility Indicators (8)
- Bollinger Bands
- ATR (Average True Range)
- Keltner Channels
- Donchian Channels
- Standard Deviation
- Historical Volatility
- True Range
- Chandelier Exit

#### Volume Indicators (8)
- OBV (On Balance Volume)
- MFI (Money Flow Index)
- ADL (Accumulation/Distribution Line)
- CMF (Chaikin Money Flow)
- Force Index
- EOM (Ease of Movement)
- VWAP
- PVT (Price Volume Trend)

#### Support/Resistance Indicators (8)
- Pivot Points
- Fibonacci Retracement
- Camarilla Pivot Points
- Woodie's Pivot Points
- DeMark Pivot Points
- Support & Resistance Levels
- Automatic Fibonacci Levels
- Volume Profile

## 🛠️ Technology Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **Pandas & NumPy** - Data manipulation and analysis
- **TA-Lib & pandas-ta** - Technical analysis library
- **yfinance** - Market data provider
- **PostgreSQL** - Primary database
- **Redis** - Caching layer
- **InfluxDB** - Time-series data storage
- **WebSocket** - Real-time data streaming

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Charting library
- **React Query** - Data fetching and caching
- **Axios** - HTTP client

### Infrastructure
- **Docker** - Containerization
- **Kubernetes** - Orchestration
- **GitHub Actions** - CI/CD
- **Prometheus & Grafana** - Monitoring
- **Nginx** - Reverse proxy

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (optional)
- PostgreSQL, Redis, InfluxDB (or use Docker)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys and database URLs

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`
API docs at `http://localhost:8000/api/docs`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API URLs

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Docker Deployment

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 📡 API Endpoints

### Stocks
- `GET /api/v1/stocks/search?q={query}` - Search stocks
- `GET /api/v1/stocks/{symbol}` - Get stock details
- `GET /api/v1/stocks/{symbol}/history` - Get historical data
- `GET /api/v1/stocks/{symbol}/quote` - Get real-time quote

### Indicators
- `GET /api/v1/indicators/list` - List all indicators
- `GET /api/v1/indicators/categories` - Get indicator categories
- `GET /api/v1/indicators/{symbol}` - Get indicators for a stock
- `GET /api/v1/indicators/{symbol}/{indicator_name}` - Get single indicator
- `POST /api/v1/indicators/calculate` - Calculate custom indicators

### WebSocket
- `WS /ws/market-data/{symbol}` - Real-time market data
- `WS /ws/indicators/{symbol}` - Real-time indicator updates

## 📁 Project Structure

```
tradeinsight-pro/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Configuration
│   │   ├── db/             # Database utilities
│   │   ├── models/         # Pydantic models
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   ├── tests/              # Test suite
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utilities
│   ├── package.json
│   └── Dockerfile
├── infrastructure/         # Infrastructure configs
│   ├── docker/            # Docker configurations
│   ├── k8s/               # Kubernetes manifests
│   └── terraform/         # Terraform configs
├── docs/                  # Documentation
│   └── SDLC_PLAN.md       # Complete SDLC documentation
└── scripts/               # Utility scripts
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v --cov=app
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 Performance Targets

- **API Response Time**: < 500ms (p95)
- **WebSocket Latency**: < 100ms
- **Data Refresh Rate**: < 5 seconds
- **Concurrent Users**: 1000+
- **Uptime SLA**: 99.9%

## 🔒 Security

- API key authentication for premium features
- Rate limiting (60 requests/minute)
- CORS protection
- Input validation and sanitization
- Secure WebSocket connections (WSS in production)

## 📄 Documentation

Complete SDLC documentation is available in the `/docs` directory:

1. [Planning](./docs/SDLC_PLAN.md)
2. [Requirements](./docs/SRS_REQUIREMENTS.md)
3. [System Design](./docs/SYSTEM_DESIGN.md)
4. [Development Plan](./docs/DEVELOPMENT_PLAN.md)
5. [Testing Plan](./docs/TESTING_PLAN.md)
6. [Deployment Plan](./docs/DEPLOYMENT_PLAN.md)
7. [Maintenance & Operations](./docs/MAINTENANCE_OPERATIONS_PLAN.md)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Market data provided by Yahoo Finance, Alpha Vantage, and Finnhub
- Technical analysis powered by TA-Lib and pandas-ta
- UI inspiration from TradingView and other professional platforms

## 📞 Support

For questions and support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for traders and investors**

*Disclaimer: This application is for educational and informational purposes only. Not financial advice.*
