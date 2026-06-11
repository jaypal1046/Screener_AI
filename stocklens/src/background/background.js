// Background Service Worker - Data Fetching & WASM Bridge

let wasmModule = null;

// Initialize WASM module on first load
async function initWASM() {
  if (wasmModule) return wasmModule;
  
  try {
    const wasmUrl = chrome.runtime.getURL('stocklens-wasm/pkg/stocklens_wasm.js');
    const wasmExports = await import(wasmUrl);
    wasmModule = await wasmExports.default();
    console.log('[StockLens] WASM module initialized');
    return wasmModule;
  } catch (error) {
    console.error('[StockLens] WASM initialization failed:', error);
    return null;
  }
}

// Fetch OHLCV data from Yahoo Finance (CORS-friendly via background)
async function fetchYahooFinance(ticker, period = '1mo', interval = '1d') {
  const baseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';
  const params = new URLSearchParams({
    symbol: ticker,
    period1: getPeriodStart(period),
    period2: Math.floor(Date.now() / 1000),
    interval: interval,
    includePrePost: 'false',
    events: 'div|split|earnings'
  });

  const url = `${baseUrl}/${ticker}?${params.toString()}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return parseYahooResponse(data);
  } catch (error) {
    console.error('[StockLens] Fetch error:', error);
    throw error;
  }
}

function getPeriodStart(period) {
  const now = Math.floor(Date.now() / 1000);
  const periods = {
    '1d': now - 86400,
    '5d': now - (86400 * 5),
    '1mo': now - (86400 * 30),
    '3mo': now - (86400 * 90),
    '6mo': now - (86400 * 180),
    '1y': now - (86400 * 365),
    '2y': now - (86400 * 730),
    '5y': now - (86400 * 1825)
  };
  return periods[period] || periods['1mo'];
}

function parseYahooResponse(data) {
  if (!data.chart?.result?.[0]) {
    throw new Error('No data available');
  }

  const result = data.chart.result[0];
  const quote = result.indicators.quote[0];
  const timestamps = result.timestamp;

  const ohlcv = [];
  for (let i = 0; i < timestamps.length; i++) {
    // Skip null values
    if (quote.open[i] === null || quote.close[i] === null) continue;

    ohlcv.push({
      timestamp: timestamps[i] * 1000, // Convert to ms
      open: quote.open[i],
      high: quote.high[i],
      low: quote.low[i],
      close: quote.close[i],
      volume: quote.volume[i] || 0
    });
  }

  return {
    ticker: result.meta.symbol,
    timeframe: result.meta.dataGranularity,
    currency: result.meta.currency,
    exchange: result.meta.exchangeName,
    data: ohlcv
  };
}

// Calculate indicators using WASM module
async function calculateIndicators(ohlcvData) {
  const wasm = await initWASM();
  
  if (!wasm) {
    // Fallback to JS implementation if WASM not available
    return calculateIndicatorsJS(ohlcvData);
  }

  try {
    const closes = ohlcvData.data.map(d => d.close);
    const highs = ohlcvData.data.map(d => d.high);
    const lows = ohlcvData.data.map(d => d.low);
    const volumes = ohlcvData.data.map(d => d.volume);

    // Call WASM functions
    const rsi = wasm.calculate_rsi(closes, 14);
    const macd = wasm.calculate_macd(closes, 12, 26, 9);
    const bb = wasm.calculate_bollinger_bands(closes, 20, 2);
    const atr = wasm.calculate_atr(highs, lows, closes, 14);
    const obv = wasm.calculate_obv(closes, volumes);
    const stoch = wasm.calculate_stochastic(highs, lows, closes, 14, 3);

    return {
      rsi: Array.from(rsi),
      macd: {
        line: Array.from(macd.macd_line),
        signal: Array.from(macd.signal_line),
        histogram: Array.from(macd.histogram)
      },
      bollingerBands: {
        upper: Array.from(bb.upper),
        middle: Array.from(bb.middle),
        lower: Array.from(bb.lower)
      },
      atr: Array.from(atr),
      obv: Array.from(obv),
      stochastic: {
        k: Array.from(stoch.k),
        d: Array.from(stoch.d)
      }
    };
  } catch (error) {
    console.error('[StockLens] WASM calculation error:', error);
    return calculateIndicatorsJS(ohlcvData);
  }
}

// Pure JS fallback implementations
function calculateIndicatorsJS(ohlcvData) {
  const closes = ohlcvData.data.map(d => d.close);
  const highs = ohlcvData.data.map(d => d.high);
  const lows = ohlcvData.data.map(d => d.low);
  const volumes = ohlcvData.data.map(d => d.volume);

  return {
    rsi: calculateRSI(closes, 14),
    macd: calculateMACD(closes, 12, 26, 9),
    bollingerBands: calculateBollingerBands(closes, 20, 2),
    atr: calculateATR(highs, lows, closes, 14),
    obv: calculateOBV(closes, volumes),
    stochastic: calculateStochastic(highs, lows, closes, 14, 3)
  };
}

function calculateStochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3) {
  const k = [];
  
  for (let i = 0; i < closes.length; i++) {
    if (i < kPeriod - 1) {
      k.push(null);
    } else {
      const sliceHighs = highs.slice(i - kPeriod + 1, i + 1);
      const sliceLows = lows.slice(i - kPeriod + 1, i + 1);
      
      const highestHigh = Math.max(...sliceHighs);
      const lowestLow = Math.min(...sliceLows);
      
      if (highestHigh === lowestLow) {
        k.push(50.0);
      } else {
        const kVal = ((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100.0;
        k.push(kVal);
      }
    }
  }
  
  // Calculate %D (SMA of %K)
  const d = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < dPeriod - 1) {
      d.push(null);
    } else {
      const slice = k.slice(i - dPeriod + 1, i + 1);
      const valid = slice.filter(v => v !== null);
      
      if (valid.length < dPeriod) {
        d.push(null);
      } else {
        const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
        d.push(avg);
      }
    }
  }
  
  return { k, d };
}

function calculateRSI(closes, period = 14) {
  const rsi = [];
  let gains = 0;
  let losses = 0;

  for (let i = 0; i < closes.length; i++) {
    if (i === 0) {
      rsi.push(null);
      continue;
    }

    const change = closes[i] - closes[i - 1];
    
    if (i < period) {
      if (change > 0) gains += change;
      else losses -= change;
      rsi.push(null);
    } else if (i === period) {
      if (change > 0) gains += change;
      else losses -= change;
      
      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    } else {
      const smoothGain = (gains * (period - 1) + Math.max(change, 0)) / period;
      const smoothLoss = (losses * (period - 1) + Math.abs(Math.min(change, 0))) / period;
      gains = smoothGain;
      losses = smoothLoss;
      
      const rs = smoothLoss === 0 ? 100 : smoothGain / smoothLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }

  return rsi;
}

function calculateMACD(closes, fast = 12, slow = 26, signal = 9) {
  const emaFast = calculateEMA(closes, fast);
  const emaSlow = calculateEMA(closes, slow);
  
  const macdLine = [];
  for (let i = 0; i < closes.length; i++) {
    if (emaFast[i] !== null && emaSlow[i] !== null) {
      macdLine.push(emaFast[i] - emaSlow[i]);
    } else {
      macdLine.push(null);
    }
  }

  const validMacd = macdLine.filter(v => v !== null);
  const signalLine = calculateEMA(validMacd, signal);
  
  // Rebuild signal line with nulls aligned
  const fullSignalLine = [];
  let signalIdx = 0;
  for (let i = 0; i < closes.length; i++) {
    if (macdLine[i] !== null) {
      fullSignalLine.push(signalLine[signalIdx++] || null);
    } else {
      fullSignalLine.push(null);
    }
  }

  const histogram = macdLine.map((macd, i) => {
    if (macd !== null && fullSignalLine[i] !== null) {
      return macd - fullSignalLine[i];
    }
    return null;
  });

  return { macdLine, signalLine: fullSignalLine, histogram };
}

function calculateEMA(closes, period) {
  const ema = [];
  const multiplier = 2 / (period + 1);

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      ema.push(null);
    } else if (i === period - 1) {
      const sum = closes.slice(0, period).reduce((a, b) => a + b, 0);
      ema.push(sum / period);
    } else {
      ema.push((closes[i] - ema[i - 1]) * multiplier + ema[i - 1]);
    }
  }

  return ema;
}

function calculateBollingerBands(closes, period = 20, stdDev = 2) {
  const upper = [];
  const middle = [];
  const lower = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      middle.push(null);
      lower.push(null);
    } else {
      const slice = closes.slice(i - period + 1, i + 1);
      const sma = slice.reduce((a, b) => a + b, 0) / period;
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period;
      const std = Math.sqrt(variance);

      middle.push(sma);
      upper.push(sma + (stdDev * std));
      lower.push(sma - (stdDev * std));
    }
  }

  return { upper, middle, lower };
}

function calculateATR(highs, lows, closes, period = 14) {
  const tr = [];
  const atr = [];

  for (let i = 0; i < highs.length; i++) {
    if (i === 0) {
      tr.push(highs[i] - lows[i]);
    } else {
      const tr1 = highs[i] - lows[i];
      const tr2 = Math.abs(highs[i] - closes[i - 1]);
      const tr3 = Math.abs(lows[i] - closes[i - 1]);
      tr.push(Math.max(tr1, tr2, tr3));
    }
  }

  for (let i = 0; i < tr.length; i++) {
    if (i < period - 1) {
      atr.push(null);
    } else if (i === period - 1) {
      const sum = tr.slice(0, period).reduce((a, b) => a + b, 0);
      atr.push(sum / period);
    } else {
      atr.push((atr[i - 1] * (period - 1) + tr[i]) / period);
    }
  }

  return atr;
}

function calculateOBV(closes, volumes) {
  const obv = [volumes[0]];

  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) {
      obv.push(obv[i - 1] + volumes[i]);
    } else if (closes[i] < closes[i - 1]) {
      obv.push(obv[i - 1] - volumes[i]);
    } else {
      obv.push(obv[i - 1]);
    }
  }

  return obv;
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      switch (message.type) {
        case 'FETCH_DATA': {
          const ohlcv = await fetchYahooFinance(message.ticker, message.period, message.interval);
          const indicators = await calculateIndicators(ohlcv);
          sendResponse({ success: true, data: { ohlcv, indicators } });
          break;
        }

        case 'CALCULATE_INDICATORS': {
          const indicators = await calculateIndicators(message.ohlcv);
          sendResponse({ success: true, indicators });
          break;
        }

        case 'INIT_WASM': {
          await initWASM();
          sendResponse({ success: true });
          break;
        }

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  })();

  return true; // Keep channel open for async response
});

console.log('[StockLens] Background service worker initialized');
