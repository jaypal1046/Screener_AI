# StockLens Multi-Tab Stock Screener

## Overview
Your extension has been transformed into a powerful **Multi-Tab Stock Screener** application that allows you to:
- Open multiple stock pages simultaneously
- Extract live data from each page automatically
- Create custom screeners with mathematical conditions
- See real-time match scores and rankings
- Export results to CSV

## How to Use

### 1. Open Stock Pages
Open multiple tabs with different stocks on supported platforms:
- TradingView
- Groww
- Zerodha/Kite
- NSE India
- Yahoo Finance

### 2. Access the Screener Panel
The screener panel automatically appears when you open stock pages. You can:
- Click the **+** button to create a new screener
- Click **⬇** to export results as CSV
- Click **×** to close the panel
- Drag the panel by its header to reposition it

### 3. Create a Custom Screener
Click the **+** button to open the Screener Builder:

#### Step-by-Step:
1. **Name your screener**: e.g., "Oversold Stocks", "Momentum Breakouts"
2. **Add conditions**: Click "Add Condition" for each rule
3. **Configure each condition**:
   - **Indicator**: Choose from RSI, MACD, Stochastic, ADX, CCI, Williams %R, ATR, Bollinger %B, Volume Ratio, OBV, MFI, ROC, Aroon, Supertrend
   - **Operator**: Select comparison (>, <, ≥, ≤, =, Between, Crosses Above, Crosses Below)
   - **Value**: Enter threshold value(s)
   - **Timeframe**: Choose 1D, 1W, 1M, 3M, or 1Y

#### Example Screeners:

**Oversold Stocks:**
- RSI < 30 (1D)
- Stochastic < 20 (1D)
- Williams %R < -80 (1D)

**Momentum Breakouts:**
- RSI > 70 (1D)
- MACD > 0 (1D)
- Volume Ratio > 2 (1D)

**Trend Following:**
- ADX > 25 (1D)
- Supertrend = Bullish (1D)
- Aroon Up > 70 (1D)

### 4. View Results
Results are displayed in two sections:

#### Perfect Matches (100%)
Stocks that meet ALL your conditions - highlighted in green

#### Partial Matches
Stocks that meet SOME conditions - color-coded by match percentage:
- 🟢 75-99%: High match (light green)
- 🟡 50-74%: Medium match (yellow/orange)
- 🔴 <50%: Low match (red)

### 5. Mathematical Scoring
The screener uses precise mathematical formulas:

```
Match Score = (Matched Conditions ÷ Total Conditions) × 100
```

Each result shows:
- **Score Circle**: Visual representation of match percentage
- **Condition Pills**: ✓ for passed, ✗ for failed conditions
- **Formula Display**: Exact calculation breakdown
- **Failed Conditions**: List of which conditions didn't match

### 6. Export Results
Click the **⬇** button to download results as CSV with:
- Ticker symbol
- Match score
- Current price
- All indicator values
- Condition details

## Features

### Multi-Tab Support
- Automatically detects when you open new stock pages
- Monitors all open tabs simultaneously
- Updates screeners in real-time as new data arrives

### Live Data Extraction
- Pulls OHLCV data directly from web pages
- Supports multiple timeframes (1D, 1W, 1M, 3M, 1Y)
- Calculates 15+ technical indicators using pure mathematics

### Advanced Operators
- **Comparison**: >, <, ≥, ≤, =
- **Range**: Between (min - max)
- **Crossover**: Crosses Above/Below (with momentum detection)

### Visual Feedback
- Color-coded match scores
- Condition-by-condition breakdown
- Mathematical formula display
- Hover effects and smooth animations

## Technical Details

### Supported Indicators
| Category | Indicators |
|----------|-----------|
| Momentum | RSI, Stochastic, CCI, Williams %R, ROC, MFI |
| Trend | MACD, ADX, Aroon, Supertrend |
| Volume | Volume Ratio, OBV, MFI |
| Volatility | ATR, Bollinger %B |

### Mathematical Precision
All calculations use pure mathematics via WebAssembly (Rust-based):
- No AI black boxes
- No server dependencies
- No login required
- 100% transparent formulas

## Tips & Best Practices

1. **Start Simple**: Begin with 2-3 conditions, then refine
2. **Use Multiple Timeframes**: Check conditions on 1D AND 1W for stronger signals
3. **Combine Categories**: Mix momentum, trend, and volume for well-rounded screeners
4. **Watch Partial Matches**: A stock at 80% might be worth investigating
5. **Export Regularly**: Save your findings for later analysis

## Keyboard Shortcuts
- Toggle screener panel: `Alt + S` (coming soon)
- Refresh all data: `F5` (standard browser refresh)

## Troubleshooting

**No stocks appearing?**
- Make sure you have stock pages open
- Wait for data to load (check overlay status)
- Try refreshing the page

**Screener not matching?**
- Verify your conditions aren't too strict
- Check if indicators are available for your timeframe
- Look at partial matches for near-misses

**Data not updating?**
- Ensure you're on a supported platform
- Check browser console for errors
- Try closing and reopening the tab

## Next Steps

Future enhancements planned:
- Cross-tab communication for true multi-tab scanning
- Alert notifications when new matches appear
- Pre-built screener templates
- Backtesting capabilities
- Custom indicator builder

---

**Enjoy your powerful new stock screening tool!** 📊✨
