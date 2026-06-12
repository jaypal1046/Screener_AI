# TradeInsight Pro - Frontend

React-based frontend application for real-time trading analytics dashboard.

## Setup

```bash
cd frontend
npm install
npm run dev
```

## Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.jsx
│   │   ├── StockSearch.jsx
│   │   ├── StockChart.jsx
│   │   ├── IndicatorPanel.jsx
│   │   ├── IndicatorCard.jsx
│   │   ├── SignalGauge.jsx
│   │   └── DataTable.jsx
│   ├── pages/               # Page components
│   │   ├── Dashboard.jsx
│   │   ├── StockDetail.jsx
│   │   └── Indicators.jsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useStockData.js
│   │   ├── useIndicators.js
│   │   └── useWebSocket.js
│   ├── services/            # API services
│   │   ├── api.js
│   │   ├── stocks.js
│   │   └── indicators.js
│   ├── utils/               # Utility functions
│   │   ├── formatters.js
│   │   └── constants.js
│   ├── styles/              # CSS styles
│   │   └── App.css
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Features

- **Real-time Stock Data**: Live price updates via WebSocket
- **40+ Technical Indicators**: Selectable indicators across 5 categories
- **Interactive Charts**: Candlestick charts with indicator overlays
- **Signal Summary**: Overall buy/sell/neutral signals
- **Responsive Design**: Works on desktop and mobile

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Charting library
- **Axios** - HTTP client
- **React Query** - Data fetching and caching

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Production

Build and preview:

```bash
npm run build
npm run preview
```
