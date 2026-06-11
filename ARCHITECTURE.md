# StockLens Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Tab                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Target Website (TradingView, etc.)            │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │        StockLens Overlay (Shadow DOM)               │  │  │
│  │  │  ┌─────────────────────────────────────────────┐    │  │  │
│  │  │  │  RELIANCE                    [1D][1W][1M]   │    │  │  │
│  │  │  │  Loading...                      [×]        │    │  │  │
│  │  │  ├─────────────────────────────────────────────┤    │  │  │
│  │  │  │  Consensus: 6/10                            │    │  │  │
│  │  │  │  Bullish: 6  Neutral: 2  Bearish: 2         │    │  │  │
│  │  │  ├─────────────────────────────────────────────┤    │  │  │
│  │  │  │  📊 Momentum                                │    │  │  │
│  │  │  │  RSI(14)          65.2      [BULLISH]      │    │  │  │
│  │  │  │  MACD(12/26/9)    12.34     [BEARISH]      │    │  │  │
│  │  │  │  ...                                        │    │  │  │
│  │  │  └─────────────────────────────────────────────┘    │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         ↑                              ↑
         │                              │
    ┌────┴──────────────────────────────┴────┐
    │         Content Script                  │
    │  - Detects ticker from DOM             │
    │  - Injects overlay                     │
    │  - Monitors URL changes                │
    └─────────────────────────────────────────┘
                     │
                     │ chrome.runtime.sendMessage
                     ↓
    ┌─────────────────────────────────────────┐
    │      Background Service Worker           │
    │  ┌───────────────────────────────────┐  │
    │  │  Yahoo Finance API Fetch          │  │
    │  │  (CORS-friendly via background)   │  │
    │  └───────────────────────────────────┘  │
    │  ┌───────────────────────────────────┐  │
    │  │  WASM Module Bridge               │  │
    │  │  - Load stocklens_wasm.js         │  │
    │  │  - Call Rust functions            │  │
    │  └───────────────────────────────────┘  │
    │  ┌───────────────────────────────────┐  │
    │  │  JS Fallback Indicators           │  │
    │  │  (if WASM unavailable)            │  │
    │  └───────────────────────────────────┘  │
    └─────────────────────────────────────────┘
                     │
                     │ HTTP Request
                     ↓
    ┌─────────────────────────────────────────┐
    │     Yahoo Finance API                   │
    │  query1.finance.yahoo.com               │
    │  Returns: OHLCV JSON                    │
    └─────────────────────────────────────────┘
```

## Data Flow

### 1. Ticker Detection (Content Script)
```
User navigates to tradingview.com/chart?symbol=NSE:RELIANCE
         ↓
Content script runs on page load
         ↓
detectTickerFromDomain() checks URL pattern
         ↓
Extracts "RELIANCE" from URL parameter
         ↓
Validates ticker format (2-10 chars, uppercase letters)
         ↓
Returns: "RELIANCE"
```

### 2. Data Fetch (Background Worker)
```
Content script sends message: { type: 'FETCH_DATA', ticker: 'RELIANCE' }
         ↓
Background worker receives message
         ↓
Constructs Yahoo Finance URL:
  https://query1.finance.yahoo.com/v8/finance/chart/RELIANCE?
    period1=1704067200&period2=1711929600&interval=1d
         ↓
Fetches data (CORS allowed from background)
         ↓
Parses JSON response → OHLCV array
         ↓
Returns: { ticker, timeframe, currency, exchange, data[] }
```

### 3. Indicator Calculation (WASM)
```
Background worker loads WASM module (one-time init)
         ↓
Extracts arrays from OHLCV:
  closes = [2450.50, 2455.75, 2448.20, ...]
  highs = [2460.00, 2468.50, 2459.80, ...]
  lows = [2442.30, 2449.60, 2440.10, ...]
  volumes = [1250000, 1340000, 1180000, ...]
         ↓
Calls WASM functions:
  rsi = wasm.calculate_rsi(closes, 14)
  macd = wasm.calculate_macd(closes, 12, 26, 9)
  bb = wasm.calculate_bollinger_bands(closes, 20, 2)
  atr = wasm.calculate_atr(highs, lows, closes, 14)
  obv = wasm.calculate_obv(closes, volumes)
         ↓
Receives results as Float64Array
         ↓
Converts to JS arrays and returns to content script
```

### 4. Signal Analysis (Overlay)
```
Overlay receives indicators
         ↓
Analyzes latest values:
  - RSI: 72.5 → Overbought (>70) → BEARISH
  - MACD histogram: +2.3 → Above signal → BULLISH
  - Price vs BB: At lower band → BULLISH
  - OBV trend: Rising → BULLISH
  - Volume spike: 180% of avg → BULLISH
         ↓
Calculates consensus: 4 bullish, 1 bearish = 8/10
         ↓
Updates UI with color-coded signals
```

## Component Responsibilities

### Content Script (`content.js`)
- **Runs in**: Page context (isolated world)
- **Triggers**: On page load, URL changes
- **Responsibilities**:
  - Detect ticker from DOM/URL
  - Inject overlay into page
  - Listen for tab navigation
  - Communicate with background worker
- **Cannot do**: Cross-origin fetches, access to other tabs

### Background Worker (`background.js`)
- **Runs in**: Service worker context (persistent)
- **Triggers**: Messages from content scripts
- **Responsibilities**:
  - Fetch data from Yahoo Finance (CORS-friendly)
  - Initialize and call WASM module
  - Calculate technical indicators
  - Cache results (optional optimization)
- **Cannot do**: Direct DOM access, localStorage

### Overlay (`overlay.js`)
- **Runs in**: Shadow DOM (isolated from page CSS)
- **Triggers**: Injected by content script
- **Responsibilities**:
  - Render analysis panel
  - Handle user interactions (drag, timeframe switch)
  - Display signals with tooltips
  - Update consensus score
- **Special**: Uses Shadow DOM to prevent style conflicts

### WASM Module (`lib.rs` → `stocklens_wasm.wasm`)
- **Runs in**: Browser WASM sandbox
- **Triggers**: Called from background worker
- **Responsibilities**:
  - High-performance numerical calculations
  - Zero GC pauses
  - Type-safe interfaces via wasm-bindgen
- **Functions exported**:
  - `calculate_rsi(closes, period)`
  - `calculate_macd(closes, fast, slow, signal)`
  - `calculate_bollinger_bands(closes, period, std_dev)`
  - `calculate_atr(highs, lows, closes, period)`
  - `calculate_obv(closes, volumes)`
  - `calculate_stochastic(highs, lows, closes, k_period, d_period)`
  - `calculate_pivot_points(high, low, close)`

## Security Model

### Chrome Extension Permissions
```json
{
  "permissions": ["activeTab", "scripting", "tabs"],
  "host_permissions": [
    "https://query1.finance.yahoo.com/*",
    "https://www.tradingview.com/*",
    ...
  ]
}
```

### Isolation Layers
1. **Content Script**: Runs in isolated world, cannot access page JS variables
2. **Shadow DOM**: Overlay styles don't leak to page, page styles don't affect overlay
3. **Service Worker**: Separate process, survives page navigation
4. **WASM Sandbox**: Memory-safe, no direct file/network access

### Data Privacy
- All calculations run locally (no server)
- No user data collected
- No analytics/tracking
- Yahoo Finance API is public data

## Performance Optimizations

### WASM Benefits
| Operation | JavaScript | Rust WASM | Speedup |
|-----------|-----------|-----------|---------|
| RSI (500 candles) | ~2.5ms | ~0.15ms | 16× |
| MACD (500 candles) | ~4.0ms | ~0.25ms | 16× |
| Bollinger Bands | ~3.5ms | ~0.20ms | 17× |
| Full Suite (10 indicators) | ~25ms | ~1.5ms | 16× |

### Lazy Loading
- WASM module loads only when first indicator needed
- Overlay injects after page fully loads (`document_idle`)
- Timeframe data fetched on-demand

### Memory Management
- WASM uses stack allocation (no GC)
- JS arrays released after calculation
- No persistent state except current ticker

## Error Handling

### Graceful Degradation
```
WASM Load Fails
       ↓
Fallback to JS implementations
       ↓
User sees slightly slower but functional overlay
```

### Network Errors
```
Yahoo API Unavailable
       ↓
Show error in overlay footer
       ↓
Retry on next timeframe switch
```

### Ticker Detection Fails
```
No Ticker Found
       ↓
Don't inject overlay
       ↓
Log to console for debugging
```

## Extension Points

### Adding New Indicators
1. Add Rust function in `rust-indicators/src/lib.rs`
2. Export with `#[wasm_bindgen]`
3. Rebuild WASM
4. Add signal analysis logic in `overlay.js`
5. Add UI row in overlay template

### Adding New Platforms
1. Add detection function in `ticker-detector.js`
2. Add domain to `detectTickerFromDomain()` map
3. Add URL pattern to manifest.json `content_scripts`
4. Test on real pages

### Custom Themes
1. Add theme selector in overlay header
2. Store preference in `chrome.storage.local`
3. Apply different CSS variables in Shadow DOM

## Testing Strategy

### Unit Tests (Rust)
```bash
cd rust-indicators
cargo test
```
Test each indicator with known inputs/outputs.

### Integration Tests (Manual)
1. Load extension in Chrome
2. Visit each supported platform
3. Verify ticker detection
4. Compare signals with TradingView indicators

### Performance Tests
```javascript
console.time('RSI Calculation');
const rsi = wasm.calculate_rsi(closes, 14);
console.timeEnd('RSI Calculation');
// Target: < 1ms for 500 candles
```

## Future Enhancements

### Phase 2 Features
- Multi-stock scanner dashboard
- Real-time WebSocket data (for live markets)
- Custom alert system (email/push notifications)
- Backtesting engine
- Portfolio tracking

### Phase 3 Features
- Machine learning patterns (opt-in)
- Social sentiment integration
- Options chain analysis
- Screener with custom filters

---

**Design Principle**: Every feature must be auditable. No black boxes. Pure math only.
