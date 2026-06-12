# 🚀 Quick Start - Multi-Tab Stock Screener

## Installation (2 minutes)

### Step 1: Build the Extension
```bash
cd /workspace
npm run build:js
```
✅ You should see: `public/content.js 68.1kb` and `public/background.js 3.5kb`

### Step 2: Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select the folder: `/workspace/public`
5. ✅ Extension loaded! You'll see the StockLens icon

---

## Using the Screener (5 minutes)

### Step 1: Open Stock Tabs
Open 3-4 tabs with different stocks:
- **Tab 1**: `https://in.tradingview.com/chart/?symbol=NSE:RELIANCE`
- **Tab 2**: `https://in.tradingview.com/chart/?symbol=NSE:TCS`
- **Tab 3**: `https://in.tradingview.com/chart/?symbol=NSE:INFY`
- **Tab 4**: `https://in.tradingview.com/chart/?symbol=NSE:HDFCBANK`

Wait 2-3 seconds on each tab for the overlay to appear (shows RSI, MACD, etc.)

### Step 2: Open Screener Panel
On any tab, look at the **bottom-right corner** for the "Screener" panel.

If you don't see it:
- Click the StockLens extension icon (top-right of browser)
- Or press `Ctrl+Shift+S` (if shortcut configured)

### Step 3: Create Your First Screener
Click the **+ (Plus)** button in the Screener panel.

**Create "Oversold Stocks" screener:**
1. **Name**: `Oversold Stocks`
2. **Add Condition 1**:
   - Indicator: `RSI`
   - Operator: `<` (less than)
   - Value: `30`
   - Timeframe: `1D`
3. **Add Condition 2**:
   - Indicator: `Stochastic`
   - Operator: `<`
   - Value: `20`
   - Timeframe: `1D`
4. **Add Condition 3**:
   - Indicator: `Volume Ratio`
   - Operator: `>`
   - Value: `1.5`
   - Timeframe: `1D`
5. Click **Save**

### Step 4: View Results Instantly
The panel updates automatically showing:

```
┌─────────────────────────────────────────┐
│ SCREENER: Oversold Stocks               │
├─────────────────────────────────────────┤
│ Perfect Matches: 1 | Partial: 2         │
├─────────────────────────────────────────┤
│                                         │
│ 🟢 RELIANCE                    100%     │
│    Match Score = 3 ÷ 3 × 100 = 100%    │
│    ✓ RSI (1D): 28.5 < 30               │
│    ✓ Stochastic (1D): 18.2 < 20        │
│    ✓ Volume Ratio (1D): 2.1 > 1.5      │
│                                         │
│ 🟡 TCS                          67%     │
│    Match Score = 2 ÷ 3 × 100 = 67%     │
│    ✓ RSI (1D): 29.1 < 30               │
│    ✓ Stochastic (1D): 15.4 < 20        │
│    ✗ Volume Ratio (1D): 1.2 ≯ 1.5      │
│                                         │
│ 🟡 INFY                         33%     │
│    Match Score = 1 ÷ 3 × 100 = 33%     │
│    ✗ RSI (1D): 45.2 ≮ 30               │
│    ✓ Stochastic (1D): 19.8 < 20        │
│    ✓ Volume Ratio (1D): 1.8 > 1.5      │
│                                         │
└─────────────────────────────────────────┘
```

### Step 5: Export to CSV
Click the **⬇ (Download)** button to save results as CSV.

Open in Excel/Google Sheets to analyze further!

---

## Pre-Made Screener Templates

Copy these conditions to create powerful screeners instantly:

### 🔵 Conservative Blue-Chip Entry
```
Conditions:
- RSI < 40 (1D)
- MACD > Signal (1W)
- ADX > 20 (1D)
- Volume Ratio > 1.2 (1D)
```

### 🔴 Aggressive Momentum Play
```
Conditions:
- RSI > 70 (1D)
- ROC > 5 (1D)
- Volume Ratio > 2.0 (1D)
- Supertrend = 1 (1D)
```

### 🟢 Reversal Setup
```
Conditions:
- RSI < 30 (1D)
- Stochastic < 20 (1D)
- Williams %R < -80 (1D)
- Bollinger %B < 0.2 (1D)
```

### 📈 Trend Continuation
```
Conditions:
- ADX > 25 (1W)
- Aroon Up > 70 (1W)
- MACD > 0 (1W)
- OBV trend > 0 (1W)
```

### 💰 Volume Breakout
```
Conditions:
- Volume Ratio > 3.0 (1D)
- MFI > 60 (1D)
- Price > VWAP (1D)
- OBV making new high (1D)
```

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Toggle Screener Panel | `Ctrl + Shift + S` |
| Toggle Analysis Overlay | `Ctrl + Shift + A` |
| Refresh All Data | `Ctrl + Shift + R` |
| Export Current Results | `Ctrl + Shift + E` |

---

## Troubleshooting

### ❌ "No stocks detected"
- Make sure you have stock chart tabs open
- Wait 2-3 seconds after opening each tab
- Check if the overlay appears (shows RSI, MACD values)

### ❌ "No matches found"
- Your conditions might be too strict
- Try widening the ranges (e.g., RSI < 35 instead of RSI < 30)
- Check if indicator values actually exist for your stocks

### ❌ "Panel not visible"
- Click the StockLens extension icon
- Reload the page (F5)
- Check browser console for errors (F12 → Console tab)

### ❌ "Export not working"
- Allow popups for the site
- Make sure you have at least one screener created
- Try creating a new screener first

---

## Pro Tips

1. **Multi-Timeframe Analysis**: Check 1D for entry signals, 1W for trend direction
2. **Combine Indicators**: Use momentum + volume + trend for higher probability setups
3. **Save Screeners**: Export CSV regularly to track historical matches
4. **Monitor Actively**: Keep tabs open - screener updates in real-time!
5. **Start Simple**: Begin with 2-3 conditions, add more as you learn
6. **Backtest Manually**: Look at historical charts to verify screener effectiveness

---

## What's Next?

Now that you have the screener running:

1. ✅ Test with 5-10 different stocks
2. ✅ Create 3-4 different screener strategies
3. ✅ Export results daily to track performance
4. ✅ Refine conditions based on market behavior
5. ✅ Share successful screeners with friends!

---

## Support

**Documentation:**
- `COMPLETE_SUMMARY.md` - Full feature overview
- `SCREENER_GUIDE.md` - API reference and technical details
- `SCREENER_USAGE.md` - Detailed usage examples

**Console Debugging:**
Open browser console (F12) and run:
```javascript
// See all monitored stocks
window.screenerManager?.getAllStockPages()

// See active screeners
window.screenerManager?.getAllScreeners()

// Manual export
const csv = window.screenerManager?.exportToCSV('screener_ID')
console.log(csv)
```

---

**🎉 You're ready to screen stocks like a pro!**

*Built with pure mathematics. No AI black boxes.*
