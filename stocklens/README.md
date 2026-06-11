# StockLens 📊

A powerful Chrome/Edge extension that provides institutional-grade technical analysis directly in your browser. No AI black boxes — every signal is derived from deterministic, auditable mathematical formulas.

## Features

### 🔍 Auto Ticker Detection
Works seamlessly on:
- **TradingView** (tradingview.com)
- **Zerodha Kite** (kite.zerodha.com)
- **Groww** (groww.in)
- **NSE India** (nseindia.com)
- **Yahoo Finance** (finance.yahoo.com)

### 📈 40+ Technical Indicators (Pure Math)

#### Momentum Scanners (8)
- **RSI (14)** - Overbought/oversold zones, divergence detection
- **MACD (12/26/9)** - Signal crossover, histogram reversal, zero-line cross
- **Stochastic (14,3,3)** - %K/%D cross, divergence, overbought reversal
- **Williams %R** - Fast reversal near -80/-20 extremes
- **CCI (20)** - Commodity Channel Index, trend vs mean reversion
- **Rate of Change** - % price change over N periods, acceleration
- **Awesome Oscillator** - Momentum zero-cross, twin peaks pattern
- **StochRSI** - RSI applied to RSI — faster, more sensitive

#### Trend Scanners (9)
- **MA Crossover** - Golden cross (50/200), death cross, EMA ribbons
- **ADX (14)** - Trend strength 0–100, +DI/-DI crossover
- **Ichimoku Cloud** - Kumo breakout, Tenkan/Kijun cross, Chikou span
- **Supertrend** - ATR-based trend filter, flip signal detection
- **Parabolic SAR** - Trailing stop dots, acceleration factor flip
- **VWAP** - Volume-weighted avg price, institutional benchmark
- **Aroon (25)** - New high/low frequency, crossover signal
- **Donchian Channel** - N-period high/low channel, breakout detection
- **Linear Regression** - Statistical trend line, deviation bands

#### Volume Scanners (7)
- **OBV Trend** - Cumulative volume direction, divergence from price
- **Acc/Dist Line** - Buying vs selling pressure in each candle
- **Money Flow Index** - Volume-weighted RSI, 80/20 zones
- **Volume Spike** - N× average, smart money move detector
- **Volume Profile** - Price levels with most traded volume (POC, VAH, VAL)
- **Chaikin Money Flow** - 21-day money flow oscillator, zero-line cross
- **VWAP Deviation** - Distance from VWAP in ATR units, mean-reversion

#### Volatility Scanners (6)
- **BB Squeeze** - Bandwidth at N-month low, coiling energy
- **ATR (14)** - True range average, stop-loss sizing in rupees
- **Keltner Channel** - ATR-based envelope, BB vs KC squeeze signal
- **Historical Volatility** - 20-day std dev of returns, regime detection
- **ATR%** - Normalized ATR for cross-stock comparison
- **VCP Detector** - Volatility Contraction Pattern — Minervini method

#### Price Action Patterns (10)
- **S/R Detection** - Pivot point clusters, touch-count scoring
- **Breakout Scanner** - N-period high break + volume confirmation
- **HH/HL Structure** - Swing point detection, trend structure scoring
- **Candlestick Patterns** - Engulfing, doji, pin bar, hammer, shooting star
- **Inside Bar** - Consolidation pattern, pending breakout signal
- **Double Top/Bottom** - M/W pattern detection with neckline break
- **Head & Shoulders** - Classic reversal pattern with neckline
- **Fair Value Gap** - 3-candle imbalance (SMC/ICT concept)
- **Order Block** - Institutional candle before strong move (SMC)
- **Cup & Handle** - William O'Neil pattern, breakout from handle

### ✨ Smart Features (Unique Moat)

- **Consensus Score (0-100)** - Weighted sum of all signals — single number verdict
- **Multi-Timeframe Confluence** - 1D + 1W + 1M signals must agree — higher confidence
- **Auto Setup Card** - Entry / SL / target auto-calculated from ATR + S/R
- **Alert Engine** - Browser notification when score crosses threshold
- **Signal History Log** - Track past signals per stock, see what worked
- **Sector Heatmap** - Compare stock vs its sector (Nifty IT, Bank, etc.)
- **RS vs Nifty** - Stock momentum relative to benchmark index

### 💎 Pro Features (Monetization Ready)

- **Paper Trade Journal** - Log virtual trades, track P&L against signals
- **Export Report (PDF)** - Full analysis snapshot, shareable with mentor
- **Custom Scanner Builder** - User picks indicators + thresholds, saves preset
- **Backtest Engine** - Run scanner signal on historical data, see win rate
- **Telegram Alerts** - Push signal alerts to user's Telegram channel

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Extension Shell | TypeScript | Browser API requirement |
| UI Overlay | TypeScript + CSS | Shadow DOM injection |
| Math Engine | Rust → WebAssembly | 10-20× faster than JS, zero GC pauses |
| Data Fetching | TypeScript | Yahoo Finance API (free, no auth) |
| Storage | Chrome Storage API | Local persistence, no server needed |

## Installation

### Prerequisites

**Option A: JavaScript Fallback Mode (Quick Start)**
- Node.js 18+
- No Rust required

**Option B: High-Performance WASM Mode (Recommended)**
- Node.js 18+
- Rust toolchain (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`)
- `wasm-pack` (`cargo install wasm-pack`)

### Build Steps

```bash
cd /workspace/stocklens

# Install dependencies
npm install

# Option A: Build with JS fallback only
npm run build:js

# Option B: Build with WASM accelerator
npm run build:wasm    # Compiles Rust to .wasm
npm run build:js      # Bundles TypeScript
```

### Load in Chrome

1. Open Chrome/Edge and navigate to `chrome://extensions`
2. Enable **Developer Mode** (toggle in top-right)
3. Click **Load Unpacked**
4. Select the `/workspace/stocklens/public` folder
5. Visit a supported site (TradingView, Zerodha, Groww, NSE, Yahoo Finance)
6. Open any stock chart — the StockLens overlay will appear automatically

## Usage

1. **Navigate** to any supported site (TradingView, Groww, Zerodha, etc.)
2. **Open** a stock page
3. **Wait** for auto-detection (ticker extracted from DOM)
4. **View** the floating overlay with consensus score and signals
5. **Switch** timeframes using buttons (1D/1W/1M/3M/1Y)
6. **Click** on signals for detailed explanations
7. **Drag** the panel to reposition (pinned to right by default)
8. **Access** Pro features via settings menu (paper trade, export, custom scanners)

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Content Script │────▶│  Background SW   │────▶│  Yahoo Finance  │
│  (Ticker Detect)│     │  (Data Fetch)    │     │  API            │
└────────┬────────┘     └──────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  WASM Bridge    │────▶│  Rust Indicators │
│                 │     │  (40+ scanners)  │
└────────┬────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐
│  Overlay UI     │
│  (Shadow DOM)   │
└─────────────────┘
```

### Project Structure

```
stocklens/
├── rust-indicators/        # Rust WASM module
│   ├── src/lib.rs          # 40+ indicators (pure math)
│   └── Cargo.toml
│
├── src/
│   ├── engine/
│   │   ├── types.ts              # Type definitions
│   │   ├── wasm_bridge.ts        # WASM integration
│   │   ├── fallback_engine.ts    # Pure JS fallback
│   │   ├── analysis_engine.ts    # Consensus scoring, MTF
│   │   ├── storage_manager.ts    # Chrome storage CRUD
│   │   ├── report_generator.ts   # PDF/CSV export
│   │   └── custom_scanner_builder.ts # User presets
│   │
│   ├── content/
│   │   ├── content.ts            # Main content script
│   │   └── detectors/            # Platform-specific parsers
│   │
│   ├── background/
│   │   └── background.ts         # Service worker
│   │
│   ├── services/
│   │   └── YahooFinanceService.ts # API wrapper
│   │
│   └── ui/
│       └── overlay.ts            # Shadow DOM panel
│
├── public/                   # Built extension (load this)
│   ├── manifest.json
│   ├── _workers/
│   └── icons/
│
└── package.json
```

## Performance

- **WASM Math Engine**: ~10-20× faster than pure JavaScript
- **Zero GC Pauses**: Rust's memory safety without garbage collection
- **Lazy Loading**: Indicators only run when needed
- **Data Caching**: 1-minute cache reduces API calls
- **Graceful Degradation**: Automatically falls back to JS if WASM fails

## Testing

### Manual Testing Checklist

- [ ] Load extension in Chrome
- [ ] Visit TradingView → Open RELIANCE chart
- [ ] Verify overlay appears with consensus score
- [ ] Switch timeframes (1D, 1W, 1M) — scores should update
- [ ] Check draggable panel functionality
- [ ] Test alert notifications (set threshold in settings)
- [ ] Add stock to watchlist
- [ ] Log a paper trade
- [ ] Export journal as CSV/PDF
- [ ] Create custom scanner preset
- [ ] Run backtest on MA crossover strategy

## Customization

### Adjust Indicator Parameters

Edit `src/engine/fallback_engine.ts` or Rust source `rust-indicators/src/lib.rs`:

```typescript
// Example: Change RSI period
const rsiPeriod = 14; // Default
const rsiPeriod = 21; // Alternative
```

### Add New Indicator

1. **Rust**: Add function to `rust-indicators/src/lib.rs`
2. **WASM Bridge**: Export in `src/engine/wasm_bridge.ts`
3. **Fallback**: Implement JS version in `fallback_engine.ts`
4. **Types**: Add to `SignalResult` union in `types.ts`
5. **UI**: Update overlay rendering in `ui/overlay.ts`

### Customize Consensus Weights

Edit `src/engine/analysis_engine.ts`:

```typescript
const weights = {
  momentum: 1.0,
  trend: 1.2,      // Higher = more important
  volume: 1.1,
  volatility: 0.9,
  price_action: 1.3
};
```

## Monetization Strategy

### Free Tier
- All core indicators (40+)
- 5 timeframes (1D/1W/1M/3M/1Y)
- Basic alerts
- Consensus score
- Auto setup card

### Pro Tier (₹299/month or ₹2999/year)
- Watchlist scanning (10-50 stocks)
- Advanced patterns (VCP, Cup & Handle, H&S)
- Backtesting engine
- PDF/CSV exports
- Telegram integration
- Custom scanner builder
- Signal history log
- Priority support

## Roadmap

### Phase 1 (Current) ✅
- [x] Core indicator library (40+)
- [x] Ticker detection (5 platforms)
- [x] Basic overlay UI
- [x] Consensus scoring
- [x] WASM + JS fallback
- [x] Paper trade journal
- [x] Report generation (PDF/CSV)
- [x] Custom scanner builder

### Phase 2 (Next)
- [ ] Watchlist batch scanner
- [ ] Sector heatmap visualization
- [ ] Telegram bot integration
- [ ] Mobile responsive overlay
- [ ] i18n (Hindi, Spanish, etc.)

### Phase 3 (Future)
- [ ] Real-time WebSocket data (premium)
- [ ] Options chain analysis
- [ ] FII/DII data integration
- [ ] Social sentiment scanner
- [ ] AI-powered pattern recognition (optional)

## Troubleshooting

**Overlay not appearing?**
- Check browser console for errors (F12 → Console)
- Ensure site is in supported platforms list
- Try refreshing the page

**Scores seem incorrect?**
- Verify Yahoo Finance data is loading (check Network tab)
- Ensure timeframe matches chart timeframe
- Try switching to JS fallback mode (disable WASM)

**WASM not loading?**
- Ensure `wasm-pack` build completed successfully
- Check `public/_workers/*.wasm` files exist
- Fallback engine activates automatically if WASM fails

## Contributing

Contributions welcome! Areas for improvement:
- Additional pattern detection algorithms
- More backtesting strategies
- Telegram integration for alerts
- Sector heatmap visualization
- Mobile responsive overlay
- Additional language support

## License

MIT License — feel free to fork, modify, and distribute.

## Disclaimer

This tool is for **educational purposes only**. Not financial advice. Always do your own research before trading. Past performance does not guarantee future results.

---

**Built with ❤️ using Rust + TypeScript**

*No AI. No black boxes. Just pure math.*
