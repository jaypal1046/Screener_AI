# StockLens Multi-Tab Stock Screener Guide 📊

## Overview

The StockLens extension now includes a powerful **Multi-Tab Stock Screener** that allows you to:
- Open multiple stock pages in different tabs
- Create custom screeners based on live technical indicators
- See real-time matches with mathematical precision
- Export results to CSV

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Tab 1:        │     │   Tab 2:         │     │   Tab 3:        │
│   RELIANCE      │     │   TCS            │     │   INFY          │
│   (Live Data)   │     │   (Live Data)    │     │   (Live Data)   │
└────────┬────────┘     └────────┬─────────┘     └────────┬────────┘
         │                       │                        │
         └───────────────────────┼────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   ScreenerManager       │
                    │   - Manages all stocks  │
                    │   - Runs filters        │
                    │   - Calculates scores   │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   ScreenerUI Panel      │
                    │   - Shows matches       │
                    │   - Math formulas       │
                    │   - Export options      │
                    └─────────────────────────┘
```

## Key Features

### 1. Multi-Page Monitoring
- Automatically tracks all open stock pages
- Extracts live OHLCV data from each page
- Maintains separate scan reports per timeframe

### 2. Custom Screener Builder
Create screeners with conditions like:
```typescript
{
  indicator: 'rsi',
  operator: 'lt',        // less than
  value: 30,             // oversold threshold
  timeframe: '1D',
  category: 'momentum'
}
```

**Supported Operators:**
- `gt` - Greater than
- `lt` - Less than
- `gte` - Greater than or equal
- `lte` - Less than or equal
- `eq` - Equal to
- `between` - Range check `[min, max]`
- `crosses_above` - Crossover detection
- `crosses_below` - Crossunder detection

### 3. Mathematical Match Scoring

Each stock is scored using:

```
Match Score = (Matched Conditions ÷ Total Conditions) × 100
```

**Example Display:**
```
Match Score = 3 ÷ 4 × 100 = 75%
```

### 4. Real-Time Results Panel

The floating panel shows:
- **Perfect Matches (100%)**: Stocks meeting all conditions
- **Partial Matches**: Stocks meeting some conditions
- **Condition Pills**: Visual ✓/✗ for each indicator
- **Math Formula**: Exact calculation shown
- **Failed Conditions**: Which indicators didn't match

## Usage

### Step 1: Open Multiple Stock Pages
Open your favorite stocks in separate tabs:
- TradingView: `tradingview.com/chart/?symbol=NSE:RELIANCE`
- Zerodha Kite: `kite.zerodha.com/chart/NSE:RELIANCE`
- Groww: `groww.in/stocks/reliance-industries-ltd`
- Yahoo Finance: `finance.yahoo.com/chart/RELIANCE.NS`

### Step 2: Create a Screener
Click the **+** button in the Screener panel to create a demo screener:

**Demo: Momentum Breakout**
```typescript
[
  { indicator: 'rsi', operator: 'lt', value: 30 },      // Oversold
  { indicator: 'volume_spike', operator: 'gt', value: 1.5 }, // High volume
  { indicator: 'ma_crossover', operator: 'gt', value: 0 }    // Bullish cross
]
```

### Step 3: View Results
The panel automatically updates showing:
- ✅ Perfect matches (green, 100%)
- ⚠️ Partial matches (yellow/orange, 50-99%)
- ❌ No matches (not shown)

### Step 4: Export Results
Click the **⬇** button to export to CSV:
```csv
Ticker,Match Score (%),Matched Conditions,Total Conditions,Current Price,rsi (1D),volume_spike (1D),ma_crossover (1D)
RELIANCE,100,3,3,2456.75,28.50,2.10,1.00
TCS,75,2,3,3890.20,32.40,1.80,0.50
```

## API Reference

### ScreenerManager

```typescript
// Add a stock page to monitor
addStockPage(page: StockPage): void

// Update stock data
updateStockPageData(
  pageId: string,
  ohlcvData: Record<Timeframe, OHLCV[]>,
  report: ScanReport
): void

// Create custom screener
createScreener(name: string, conditions: FilterCondition[]): ScreenerFilter

// Run screener
runScreener(screenerId: string): ScreenerResult[]

// Export to CSV
exportToCSV(screenerId: string): string
```

### Types

```typescript
interface StockPage {
  id: string;
  ticker: string;
  exchange: string;
  url: string;
  status: 'loading' | 'ready' | 'error';
  report?: ScanReport;
  ohlcvData?: Record<Timeframe, OHLCV[]>;
}

interface FilterCondition {
  indicator: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'between' | 'crosses_above' | 'crosses_below';
  value: number | [number, number];
  timeframe: Timeframe;
  category: 'momentum' | 'trend' | 'volume' | 'volatility' | 'price_action';
}

interface ScreenerResult {
  ticker: string;
  matchScore: number;      // 0-100
  matchedConditions: number;
  totalConditions: number;
  failedConditions: FailedCondition[];
  report?: ScanReport;
}
```

## Example Screeners

### 1. Oversold Bounce
```typescript
[
  { indicator: 'rsi', operator: 'lt', value: 30, timeframe: '1D' },
  { indicator: 'stochastic', operator: 'lt', value: 20, timeframe: '1D' },
  { indicator: 'volume_spike', operator: 'gt', value: 1.5, timeframe: '1D' }
]
```

### 2. Trend Following
```typescript
[
  { indicator: 'ma_crossover', operator: 'gt', value: 0, timeframe: '1D' },
  { indicator: 'adx', operator: 'gt', value: 25, timeframe: '1D' },
  { indicator: 'supertrend', operator: 'eq', value: 1, timeframe: '1D' }
]
```

### 3. Volatility Breakout
```typescript
[
  { indicator: 'bb_squeeze', operator: 'eq', value: 1, timeframe: '1D' },
  { indicator: 'atr', operator: 'lt', value: 2, timeframe: '1D' },
  { indicator: 'volume_spike', operator: 'gt', value: 2.0, timeframe: '1D' }
]
```

### 4. Volume Accumulation
```typescript
[
  { indicator: 'obv_trend', operator: 'gt', value: 0, timeframe: '1W' },
  { indicator: 'money_flow_index', operator: 'gt', value: 50, timeframe: '1D' },
  { indicator: 'accumulation_distribution', operator: 'gt', value: 0, timeframe: '1D' }
]
```

## Technical Details

### Data Flow
1. **Content Script** detects ticker on each page
2. **YahooFinanceService** fetches OHLCV data
3. **SmartEngine** calculates 40+ indicators
4. **ScreenerManager** evaluates conditions
5. **ScreenerUI** displays results with math formulas

### Performance
- **Lazy Evaluation**: Screeners only run when data updates
- **Efficient Matching**: O(n) complexity per screener
- **Memory Management**: Old pages can be removed manually
- **Real-Time Updates**: 60-second auto-refresh interval

### Shadow DOM Isolation
Both overlay panels use Shadow DOM to avoid CSS conflicts with host pages.

## Troubleshooting

**No matches showing?**
- Ensure you have multiple stock tabs open
- Check if screeners are enabled (toggle in manager)
- Verify indicator values meet your conditions

**Export not working?**
- Make sure you have at least one screener created
- Check browser popup blocker settings
- Try creating a new screener first

**Panel not visible?**
- Click the extension icon to toggle visibility
- Check browser console for errors (F12)
- Reload the page and reinitialize

## Future Enhancements

- [ ] Watchlist batch scanning (100+ stocks)
- [ ] Pre-built screener templates
- [ ] Alert notifications when new matches found
- [ ] Backtesting screener performance
- [ ] Sector/industry filtering
- [ ] Market cap filters
- [ ] Save/load screener presets

---

**Built with ❤️ using TypeScript + Mathematics**

*No AI. No black boxes. Just pure math.*
