# StockLens Build Script

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Build WASM (requires Rust + wasm-pack)
npm run build:wasm

# 3. Bundle JavaScript
npm run build:js

# Or build everything at once
npm run build
```

## Manual Build Steps

### Step 1: Compile Rust to WASM

```bash
cd rust-indicators
wasm-pack build --target web --out-dir ../stocklens-wasm/pkg
```

This creates:
- `stocklens-wasm/pkg/stocklens_wasm.js` - JS glue code
- `stocklens-wasm/pkg/stocklens_wasm.wasm` - WASM binary
- `stocklens-wasm/pkg/stocklens_wasm.d.ts` - TypeScript definitions

### Step 2: Copy WASM to Public Folder

```bash
mkdir -p public/stocklens-wasm/pkg
cp stocklens-wasm/pkg/* public/stocklens-wasm/pkg/
```

### Step 3: Bundle JavaScript

Using esbuild:

```bash
# Content script
npx esbuild src/content/content.js --bundle --outfile=public/content.js --format=esm --minify

# Background worker
npx esbuild src/background/background.js --bundle --outfile=public/background.js --format=esm --minify

# Overlay (loaded dynamically, not in manifest)
npx esbuild src/overlay/overlay.js --bundle --outfile=public/overlay.js --format=esm --minify
```

### Step 4: Load Extension

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the `public` folder

## Development Mode

Watch for changes and rebuild automatically:

```bash
npm run build:dev
```

Then reload extension in Chrome (`chrome://extensions/` → Reload button).

## Prerequisites

### Node.js
- Version 18 or higher
- Install from https://nodejs.org/

### Rust
- Latest stable version
- Install from https://rustup.rs/

### wasm-pack
```bash
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

Or with cargo:
```bash
cargo install wasm-pack
```

## Troubleshooting

### WASM Import Errors

If you see "Failed to fetch" for WASM files:
1. Ensure `stocklens-wasm/pkg/` folder exists in `public/`
2. Check manifest.json includes WASM in `web_accessible_resources`
3. Verify CORS headers if serving from a server

### Ticker Not Detected

1. Open DevTools Console
2. Look for `[StockLens]` log messages
3. Check if your platform is supported in `ticker-detector.js`
4. Add custom detection logic for new platforms

### Overlay Not Showing

1. Check content script loaded (DevTools Console)
2. Verify URL matches patterns in manifest.json
3. Check for CSS conflicts (Shadow DOM should prevent this)
4. Inspect page elements for `#stocklens-overlay` div

## File Structure After Build

```
stocklens/
├── public/
│   ├── manifest.json           # Extension config
│   ├── content.js              # Bundled content script
│   ├── background.js           # Bundled service worker
│   ├── overlay.js              # Bundled overlay UI
│   └── stocklens-wasm/
│       └── pkg/
│           ├── stocklens_wasm.js
│           ├── stocklens_wasm.wasm
│           └── stocklens_wasm.d.ts
├── src/
│   ├── content/
│   │   └── content.js          # Source content script
│   ├── background/
│   │   └── background.js       # Source background worker
│   ├── overlay/
│   │   └── overlay.js          # Source overlay UI
│   └── utils/
│       └── ticker-detector.js  # Ticker detection logic
├── rust-indicators/
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs              # Rust indicator implementations
├── package.json
└── README.md
```

## Testing

### Unit Tests (Indicators)

```bash
cd rust-indicators
cargo test
```

### Manual Testing

1. **TradingView**: Navigate to `tradingview.com/chart?symbol=NSE:RELIANCE`
2. **Yahoo Finance**: Navigate to `finance.yahoo.com/quote/RELIANCE.NS`
3. **Groww**: Navigate to `groww.in/stocks/RELIANCE`
4. **Zerodha**: Navigate to `kite.zerodha.com/market/quote/quotes/RELIANCE`
5. **NSE**: Navigate to `nseindia.com/get-quote/equity?symbol=RELIANCE`

Verify:
- ✅ Ticker auto-detected
- ✅ Overlay appears on right side
- ✅ Signals load within 2 seconds
- ✅ Timeframe switcher works
- ✅ Panel is draggable
- ✅ Consensus score updates

## Performance Benchmarks

Target performance (on mid-range laptop):

| Operation | Target Time |
|-----------|-------------|
| Ticker Detection | < 100ms |
| Data Fetch | < 500ms |
| Indicator Calculation (WASM) | < 50ms |
| Overlay Render | < 100ms |
| **Total Load Time** | **< 1s** |

## Publishing to Chrome Web Store

1. Zip the `public` folder
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Pay one-time $5 developer fee
4. Upload ZIP
5. Fill out store listing (description, screenshots, etc.)
6. Submit for review (typically 1-3 days)

Note: Ensure you have rights to use any platform names/logos.
