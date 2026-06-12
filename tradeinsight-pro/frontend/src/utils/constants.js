// Indicator categories
export const INDICATOR_CATEGORIES = {
  trend: {
    name: 'Trend',
    description: 'Identify market direction and momentum',
    color: 'blue'
  },
  momentum: {
    name: 'Momentum',
    description: 'Measure speed of price movements',
    color: 'purple'
  },
  volatility: {
    name: 'Volatility',
    description: 'Measure price fluctuation range',
    color: 'orange'
  },
  volume: {
    name: 'Volume',
    description: 'Analyze trading volume patterns',
    color: 'green'
  },
  support_resistance: {
    name: 'Support/Resistance',
    description: 'Identify key price levels',
    color: 'yellow'
  }
}

// Signal types
export const SIGNALS = {
  buy: { label: 'Buy', color: 'green', icon: '↑' },
  sell: { label: 'Sell', color: 'red', icon: '↓' },
  neutral: { label: 'Neutral', color: 'gray', icon: '→' }
}

// Time periods for historical data
export const TIME_PERIODS = [
  { value: '1D', label: '1 Day' },
  { value: '5D', label: '5 Days' },
  { value: '1mo', label: '1 Month' },
  { value: '3mo', label: '3 Months' },
  { value: '6mo', label: '6 Months' },
  { value: '1y', label: '1 Year' },
  { value: '2y', label: '2 Years' },
  { value: '5y', label: '5 Years' },
  { value: 'max', label: 'Max' }
]

// Chart intervals
export const CHART_INTERVALS = [
  { value: '1m', label: '1 Minute' },
  { value: '5m', label: '5 Minutes' },
  { value: '15m', label: '15 Minutes' },
  { value: '30m', label: '30 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '1d', label: '1 Day' },
  { value: '1wk', label: '1 Week' },
  { value: '1mo', label: '1 Month' }
]

// Popular stocks for quick access
export const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: '^GSPC', name: 'S&P 500' },
  { symbol: '^DJI', name: 'Dow Jones' },
  { symbol: '^IXIC', name: 'NASDAQ' }
]
