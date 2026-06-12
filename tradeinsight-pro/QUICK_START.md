# 🚀 TradeInsight Pro - Quick Start Guide

Get your trading analytics dashboard up and running in minutes!

## Prerequisites

- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)
- **Git** (optional, for cloning)

## 📦 Installation & Setup

### Step 1: Navigate to Project Directory
```bash
cd /workspace/tradeinsight-pro
```

### Step 2: Configure Environment Variables
The `.env` file is already created with default values. Customize if needed:
```bash
# View current configuration
cat .env

# Edit if needed (optional)
nano .env
```

### Step 3: Launch the Application
```bash
# Build and start all services
docker-compose up --build
```

**Note:** First build may take 5-10 minutes as it downloads base images and installs dependencies.

### Step 4: Access the Application

Once all services are healthy (wait for "TradeInsight Pro Starting..." message):

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend Dashboard** | http://localhost:3000 | Main trading interface |
| **Backend API** | http://localhost:8000 | REST API server |
| **API Documentation** | http://localhost:8000/api/docs | Swagger UI (interactive) |
| **Alternative Docs** | http://localhost:8000/api/redoc | ReDoc documentation |
| **PostgreSQL** | localhost:5432 | Database (for direct access) |
| **Redis** | localhost:6379 | Cache layer |
| **InfluxDB** | http://localhost:8086 | Time-series database UI |

## 🔍 Verify Installation

### Check Service Health
```bash
# Test backend health
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","service":"tradeinsight-pro-backend"}
```

### Test API Endpoints
```bash
# Get list of all 40 indicators
curl http://localhost:8000/api/v1/indicators/

# Get stock details for AAPL
curl http://localhost:8000/api/v1/stocks/AAPL/details

# Get historical data
curl "http://localhost:8000/api/v1/stocks/AAPL/history?period=1mo"
```

### Test WebSocket Connection
Open browser console at http://localhost:3000 and run:
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/test');
ws.onopen = () => {
    console.log('✅ WebSocket connected!');
    ws.send('Hello from TradeInsight Pro!');
};
ws.onmessage = (event) => {
    console.log('📩 Received:', event.data);
};
```

## 🛑 Stopping the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## 📊 What's Running?

The Docker Compose stack includes **6 services**:

1. **postgres** - Relational database for user data and configurations
2. **redis** - In-memory cache for fast indicator calculations
3. **influxdb** - Time-series database for market data storage
4. **backend** - FastAPI server with 40 technical indicators
5. **frontend** - React dashboard with real-time updates
6. **data-worker** - Background service fetching live market data

## 🔧 Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Scale Services
```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3
```

### Execute Commands Inside Containers
```bash
# Run Python shell in backend
docker-compose exec backend python

# Run bash in frontend
docker-compose exec frontend sh

# Access PostgreSQL
docker-compose exec postgres psql -U tradeinsight -d tradeinsight
```

## 🐛 Troubleshooting

### Port Already in Use
If you get "port already allocated" errors:
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Database Connection Issues
```bash
# Check if postgres is healthy
docker-compose ps postgres

# View postgres logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Frontend Not Loading
```bash
# Check if build completed
docker-compose logs frontend | grep "ready"

# Clear browser cache and hard reload (Ctrl+Shift+R)
```

### Memory Issues
If containers crash due to memory:
```bash
# Increase Docker memory limit (Mac/Windows)
# Docker Desktop -> Settings -> Resources -> Memory (set to 4GB+)

# Or limit individual services in docker-compose.yml
```

## 📈 Next Steps

1. **Explore the Dashboard**: Open http://localhost:3000 and browse stocks
2. **View API Docs**: Visit http://localhost:8000/api/docs to test endpoints
3. **Add API Keys**: Edit `.env` to add premium data provider keys (Alpha Vantage, Finnhub)
4. **Customize Indicators**: Modify `backend/app/services/indicators.py` to adjust calculations
5. **Deploy to Production**: Follow `docs/DEPLOYMENT_PLAN.md` for AWS/Kubernetes deployment

## 🎯 Key Features Demo

### Real-Time Data Streaming
- Open multiple browser tabs to see live price updates
- Watch indicator values change in real-time
- Observe WebSocket connections in browser DevTools

### 40 Technical Indicators
All indicators are pre-calculated and ready:
- **Trend**: SMA, EMA, MACD, ADX, Ichimoku, etc.
- **Momentum**: RSI, Stochastic, CCI, Williams %R, etc.
- **Volatility**: Bollinger Bands, ATR, Keltner Channels, etc.
- **Volume**: OBV, MFI, CMF, VWAP, etc.
- **Support/Resistance**: Pivot Points, Fibonacci, etc.

### Market Summary
- Aggregated buy/sell signals from all 40 indicators
- Overall market sentiment score (0-100)
- Visual gauge showing market strength

## 📞 Support

For detailed documentation, see:
- `README.md` - Project overview
- `docs/` - Complete SDLC documentation
- `http://localhost:8000/api/docs` - Interactive API reference

---

**Happy Trading! 📊🚀**
