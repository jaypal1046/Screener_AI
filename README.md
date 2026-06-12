# Multi-Tab Stock Screener Extension

A powerful Chrome extension that transforms your browser into a professional **Multi-Tab Stock Screener**. Open multiple stock charts, create custom screeners with 15+ technical indicators, and get real-time mathematical match scores across all open tabs.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Google Chrome browser

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Extension
```bash
npm run build:js
```
This compiles the TypeScript source files into JavaScript and places them in the `public/` directory.

### 3. Load in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `public` folder from this project directory
5. The extension icon should now appear in your toolbar

## 📖 How to Use

### Step 1: Open Stock Tabs
Open multiple tabs with stock charts on supported platforms:
- TradingView
- Zerodha Kite
- Groww
- NSE India
- Yahoo Finance

*Tip: Open at least 3-5 different stock charts to see the multi-tab screening in action.*

### Step 2: Access the Screener Panel
1. On any open stock tab, look for the **Screener** floating panel (usually bottom-right)
2. If not visible, refresh the page or click the extension icon
3. The panel will automatically detect the current stock symbol and live data

### Step 3: Create a Custom Screener
1. Click the **+ (Plus)** button in the Screener panel
2. **Name your screener** (e.g., "Oversold Stocks", "Momentum Breakouts")
3. **Add Conditions**:
   - Select an indicator (RSI, MACD, Stochastic, etc.)
   - Choose an operator (>, <, ≥, ≤, =, Between, Crosses Above/Below)
   - Enter threshold values
   - Select timeframe (1D, 1W, 1M, 3M, 1Y)
4. Click **Save Screener**

#### Example: "Oversold Stocks" Screener
```
Condition 1: RSI < 30 (1D)
Condition 2: Stochastic %K < 20 (1D)
Condition 3: Williams %R < -80 (1D)
```

#### Example: "Momentum Breakout" Screener
```
Condition 1: RSI > 70 (1D)
Condition 2: MACD > Signal (1D)
Condition 3: Volume Ratio > 2.0 (1D)
Condition 4: ADX > 25 (1D)
```

### Step 4: View Real-Time Results
Once saved, the screener automatically evaluates **all open stock tabs**:

- **🟢 Perfect Match (100%)**: All conditions met
- **🟡 Partial Match (50-99%)**: Some conditions met
- **🔴 No Match (<50%)**: Few or no conditions met

The results panel shows:
- Stock symbol and current price
- Match score percentage
- Visual indicators (✓/✗) for each condition
- Detailed formula breakdown
- Failed condition details

### Step 5: Export Results
Click the **Export CSV** button to download all screening results with:
- Symbol, Price, Change %
- All indicator values (RSI, MACD, etc.)
- Match score and condition details
- Timestamp

## 🧪 How to Check & Verify

### Verify Extension is Running
1. Open any supported stock page (e.g., TradingView)
2. Look for the floating **Screener** panel
3. Check browser console (F12 → Console tab) for messages like:
   ```
   [StockScreener] Registered stock: RELIANCE
   [StockScreener] Found 3 open tabs
   ```

### Test Data Extraction
1. Open a stock chart (e.g., RELIANCE on TradingView)
2. Open the Screener panel
3. Verify the panel displays:
   - Correct stock symbol
   - Current price
   - Live indicator values (RSI, MACD, etc.)

### Test Multi-Tab Detection
1. Open 3 different stock tabs (e.g., RELIANCE, TCS, INFY)
2. Create a simple screener (e.g., "RSI < 50")
3. Verify the results panel shows all 3 stocks
4. Check that match scores update in real-time as prices change

### Test Mathematical Scoring
1. Create a screener with 4 conditions
2. Find a stock that meets 2 conditions
3. Verify the match score shows **50%** (2÷4×100)
4. Check the formula display shows the exact calculation

### Test CSV Export
1. Run a screener with multiple stocks
2. Click **Export CSV**
3. Open the downloaded file in Excel/Google Sheets
4. Verify all columns are present and data is accurate

## 🛠️ Development

### Project Structure
```
/workspace
├── src/
│   ├── screener/
│   │   ├── ScreenerManager.ts      # Core logic & evaluation engine
│   │   ├── ScreenerBuilderUI.ts    # Visual screener builder
│   │   ├── ScreenerUI.ts           # Results panel UI
│   │   └── index.ts                # Module exports
│   ├── content/
│   │   └── content.ts              # Main content script
│   └── background/
│       └── background.ts           # Background service worker
├── public/                         # Built extension files
├── package.json
└── README.md
```

### Available Scripts
```bash
npm run build:js      # Build extension to public/
npm run watch         # Auto-rebuild on file changes
npm run lint          # Check code quality
npm run test          # Run tests (if configured)
```

### Debugging
1. **Content Script**: Right-click on stock page → Inspect → Console tab
2. **Background Script**: Go to `chrome://extensions/` → Inspect views: background page
3. **Popup/UI**: Right-click on Screener panel → Inspect element

### Adding New Indicators
To add a new technical indicator:
1. Edit `src/screener/ScreenerManager.ts`
2. Add calculation logic in the `calculateIndicator()` method
3. Update the indicator list in `src/screener/ScreenerBuilderUI.ts`
4. Rebuild with `npm run build:js`

## 📊 Supported Indicators

| Indicator | Description | Parameters |
|-----------|-------------|------------|
| RSI | Relative Strength Index | Period (default: 14) |
| MACD | Moving Average Convergence Divergence | Fast, Slow, Signal |
| Stochastic | Stochastic Oscillator | %K, %D periods |
| ADX | Average Directional Index | Period |
| CCI | Commodity Channel Index | Period |
| Williams %R | Williams Percent Range | Period |
| ATR | Average True Range | Period |
| Bollinger %B | Bollinger Bands Position | Period, StdDev |
| Volume Ratio | Current vs Average Volume | Period |
| OBV | On-Balance Volume | - |
| MFI | Money Flow Index | Period |
| ROC | Rate of Change | Period |
| Aroon | Aroon Up/Down | Period |
| Supertrend | Supertrend Indicator | Period, Multiplier |

## 🎯 Use Cases

### Day Trading
- Create screeners for intraday momentum (1D timeframe)
- Monitor 10+ stocks simultaneously
- Get instant alerts when conditions are met

### Swing Trading
- Use 1W or 1M timeframes for trend identification
- Combine multiple indicators for confirmation
- Export results for weekend analysis

### Portfolio Monitoring
- Add all your holdings to separate tabs
- Create a "Health Check" screener
- Quickly identify which stocks need attention

## 📝 Notes

- **Live Data**: The extension reads data directly from the open web pages. Ensure charts are fully loaded.
- **Performance**: For best performance, limit open tabs to 10-15 when running complex screeners.
- **Accuracy**: Mathematical calculations are performed locally using extracted data. Verify critical decisions with your broker's platform.
- **Privacy**: All data processing happens locally in your browser. No data is sent to external servers.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

**Issue**: Screener panel not appearing
- **Solution**: Refresh the page, ensure the extension is enabled in `chrome://extensions/`

**Issue**: No data showing in panel
- **Solution**: Verify the stock page is fully loaded. Some platforms require manual chart interaction.

**Issue**: Incorrect match scores
- **Solution**: Check the formula display to verify condition logic. Ensure thresholds are set correctly.

**Issue**: CSV export fails
- **Solution**: Check browser pop-up blocker settings. Allow downloads from the extension.

---

**Built with pure mathematics - no AI black boxes. Every match score shows the exact formula used!**
