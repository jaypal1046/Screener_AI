/**
 * Fallback Indicator Engine - Pure TypeScript
 * Used when WASM is not available or during development
 * Implements all core indicators in JavaScript for graceful degradation
 */

import { SignalResult } from './types';

/**
 * Calculate RSI (Relative Strength Index)
 */
export function calculateRSI(closes: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  let gains = 0;
  let losses = 0;

  for (let i = 0; i < closes.length; i++) {
    if (i === 0) {
      rsi.push(NaN);
      continue;
    }

    const change = closes[i] - closes[i - 1];

    if (i < period) {
      if (change > 0) gains += change;
      else losses -= change;
      rsi.push(NaN);
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

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(closes: number[], fast: number = 12, slow: number = 26, signalPeriod: number = 9) {
  const emaFast = calculateEMA(closes, fast);
  const emaSlow = calculateEMA(closes, slow);
  
  const macdLine: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    macdLine.push(emaFast[i] - emaSlow[i]);
  }

  // Signal line is EMA of MACD line
  const validMacd = macdLine.filter(v => !isNaN(v));
  const signalLine = calculateEMA(validMacd, signalPeriod);
  
  // Histogram
  const histogram: number[] = [];
  for (let i = 0; i < macdLine.length; i++) {
    if (isNaN(macdLine[i]) || i >= signalLine.length && isNaN(signalLine[i])) {
      histogram.push(NaN);
    } else {
      histogram.push(macdLine[i] - (signalLine[i] || 0));
    }
  }

  return { macdLine, signalLine, histogram };
}

/**
 * Calculate EMA (Exponential Moving Average)
 */
export function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);

  let sum = 0;
  for (let i = 0; i < period && i < data.length; i++) {
    sum += data[i];
  }
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ema.push(NaN);
    } else if (i === period - 1) {
      ema.push(sum / period);
    } else {
      ema.push((data[i] - ema[i - 1]) * multiplier + ema[i - 1]);
    }
  }

  return ema;
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(closes: number[], period: number = 20, stdDev: number = 2) {
  const upper: number[] = [];
  const middle: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      middle.push(NaN);
      lower.push(NaN);
      continue;
    }

    const slice = closes.slice(i - period + 1, i + 1);
    const sma = slice.reduce((a, b) => a + b, 0) / period;
    
    const squaredDiff = slice.map(x => Math.pow(x - sma, 2));
    const variance = squaredDiff.reduce((a, b) => a + b, 0) / period;
    const std = Math.sqrt(variance);

    middle.push(sma);
    upper.push(sma + (stdDev * std));
    lower.push(sma - (stdDev * std));
  }

  return { upper, middle, lower };
}

/**
 * Calculate ATR (Average True Range)
 */
export function calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number[] {
  const tr: number[] = [];
  const atr: number[] = [];

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

  // First ATR is simple average
  let sum = 0;
  for (let i = 0; i < period && i < tr.length; i++) {
    sum += tr[i];
  }

  for (let i = 0; i < tr.length; i++) {
    if (i < period - 1) {
      atr.push(NaN);
    } else if (i === period - 1) {
      atr.push(sum / period);
    } else {
      atr.push((atr[i - 1] * (period - 1) + tr[i]) / period);
    }
  }

  return atr;
}

/**
 * Calculate Stochastic Oscillator
 */
export function calculateStochastic(highs: number[], lows: number[], closes: number[], kPeriod: number = 14, dPeriod: number = 3) {
  const k: number[] = [];
  const d: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < kPeriod - 1) {
      k.push(NaN);
      d.push(NaN);
      continue;
    }

    const sliceHighs = highs.slice(i - kPeriod + 1, i + 1);
    const sliceLows = lows.slice(i - kPeriod + 1, i + 1);
    
    const highestHigh = Math.max(...sliceHighs);
    const lowestLow = Math.min(...sliceLows);
    
    const kValue = highestHigh === lowestLow ? 50 : ((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
    k.push(kValue);

    // D is SMA of K
    if (i < dPeriod - 1 || k.slice(i - dPeriod + 1, i + 1).some(isNaN)) {
      d.push(NaN);
    } else {
      const kSlice = k.slice(i - dPeriod + 1, i + 1);
      d.push(kSlice.reduce((a, b) => a + b, 0) / dPeriod);
    }
  }

  return { k, d };
}

// Fix typo in stochastic
function calculateStochasticFixed(highs: number[], lows: number[], closes: number[], kPeriod: number = 14, dPeriod: number = 3) {
  const k: number[] = [];
  const d: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < kPeriod - 1) {
      k.push(NaN);
      d.push(NaN);
      continue;
    }

    const sliceHighs = highs.slice(i - kPeriod + 1, i + 1);
    const sliceLows = lows.slice(i - kPeriod + 1, i + 1);
    
    const highestHigh = Math.max(...sliceHighs);
    const lowestLow = Math.min(...sliceLows);
    
    const kValue = highestHigh === lowestLow ? 50 : ((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
    k.push(kValue);

    // D is SMA of K
    if (i < dPeriod - 1 || k.slice(i - dPeriod + 1, i + 1).some(isNaN)) {
      d.push(NaN);
    } else {
      const kSlice = k.slice(i - dPeriod + 1, i + 1);
      d.push(kSlice.reduce((a, b) => a + b, 0) / dPeriod);
    }
  }

  return { k, d };
}

/**
 * Calculate OBV (On-Balance Volume)
 */
export function calculateOBV(closes: number[], volumes: number[]): number[] {
  const obv: number[] = [volumes[0]];

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

/**
 * Detect candlestick patterns
 */
export function detectCandlestickPatterns(opens: number[], highs: number[], lows: number[], closes: number[]) {
  const patterns: { name: string; index: number; bullish: boolean }[] = [];

  for (let i = 1; i < opens.length; i++) {
    const prevOpen = opens[i - 1];
    const prevClose = closes[i - 1];
    const currOpen = opens[i];
    const currClose = closes[i];
    const currHigh = highs[i];
    const currLow = lows[i];

    const bodySize = Math.abs(currClose - currOpen);
    const range = currHigh - currLow;
    const upperWick = currHigh - Math.max(currOpen, currClose);
    const lowerWick = Math.min(currOpen, currClose) - currLow;

    // Engulfing
    if (currClose > currOpen && prevClose < prevOpen && currOpen < prevClose && currClose > prevOpen) {
      patterns.push({ name: 'Engulfing', index: i, bullish: true });
    } else if (currClose < currOpen && prevClose > prevOpen && currOpen > prevClose && currClose < prevOpen) {
      patterns.push({ name: 'Engulfing', index: i, bullish: false });
    }

    // Doji
    if (bodySize < range * 0.1) {
      patterns.push({ name: 'Doji', index: i, bullish: false });
    }

    // Hammer
    if (lowerWick > bodySize * 2 && upperWick < bodySize * 0.5 && currClose > currOpen) {
      patterns.push({ name: 'Hammer', index: i, bullish: true });
    }

    // Shooting Star
    if (upperWick > bodySize * 2 && lowerWick < bodySize * 0.5 && currClose < currOpen) {
      patterns.push({ name: 'ShootingStar', index: i, bullish: false });
    }

    // Inside Bar
    if (currHigh < highs[i - 1] && currLow > lows[i - 1]) {
      patterns.push({ name: 'InsideBar', index: i, bullish: false });
    }
  }

  return patterns;
}

/**
 * Find Support/Resistance levels using pivot points
 */
export function findSupportResistance(highs: number[], lows: number[], window: number = 10) {
  const levels: { price: number; type: 'support' | 'resistance'; touches: number }[] = [];

  for (let i = window; i < highs.length - window; i++) {
    let isPivotHigh = true;
    let isPivotLow = true;

    for (let j = i - window; j <= i + window; j++) {
      if (j === i) continue;
      if (highs[j] >= highs[i]) isPivotHigh = false;
      if (lows[j] <= lows[i]) isPivotLow = false;
    }

    if (isPivotHigh) {
      levels.push({ price: highs[i], type: 'resistance', touches: 1 });
    } else if (isPivotLow) {
      levels.push({ price: lows[i], type: 'support', touches: 1 });
    }
  }

  // Cluster nearby levels
  return clusterLevels(levels, 0.02); // 2% tolerance
}

function clusterLevels(levels: any[], tolerance: number) {
  const clustered: any[] = [];
  
  for (const level of levels) {
    let found = false;
    for (const cluster of clustered) {
      if (Math.abs(cluster.price - level.price) / cluster.price < tolerance) {
        cluster.touches++;
        cluster.price = (cluster.price * cluster.touches + level.price) / (cluster.touches + 1);
        found = true;
        break;
      }
    }
    if (!found) {
      clustered.push({ ...level });
    }
  }

  return clustered.sort((a, b) => b.touches - a.touches);
}

/**
 * Detect Fair Value Gap (FVG) - 3-candle imbalance
 */
export function detectFVG(highs: number[], lows: number[], closes: number[]) {
  const fvg: { index: number; type: 'bullish' | 'bearish'; gap: number }[] = [];

  for (let i = 2; i < closes.length; i++) {
    // Bullish FVG: Candle 1 low > Candle 3 high
    if (lows[i - 2] > highs[i]) {
      fvg.push({
        index: i,
        type: 'bullish',
        gap: lows[i - 2] - highs[i]
      });
    }
    // Bearish FVG: Candle 1 high < Candle 3 low
    else if (highs[i - 2] < lows[i]) {
      fvg.push({
        index: i,
        type: 'bearish',
        gap: lows[i] - highs[i - 2]
      });
    }
  }

  return fvg;
}

/**
 * Simple JS fallback scanner when WASM is unavailable
 */
export function scanIndicatorsJS(
  opens: number[],
  highs: number[],
  lows: number[],
  closes: number[],
  volumes: number[]
): Partial<SignalResult>[] {
  const signals: Partial<SignalResult>[] = [];

  // RSI
  const rsi = calculateRSI(closes, 14);
  const lastRsi = rsi[rsi.length - 1];
  if (!isNaN(lastRsi)) {
    signals.push({
      name: 'RSI',
      category: 'momentum',
      value: lastRsi,
      thresholds: { bullish: 70, bearish: 30 },
      signal: lastRsi > 70 ? 'BULL' : lastRsi < 30 ? 'BEAR' : 'NEUTRAL',
      strength: Math.round(((lastRsi - 30) / 40) * 100),
      isBinary: false
    });
  }

  // MACD
  const macd = calculateMACD(closes);
  const lastMacd = macd.histogram[macd.histogram.length - 1];
  const prevMacd = macd.histogram[macd.histogram.length - 2];
  if (!isNaN(lastMacd) && !isNaN(prevMacd)) {
    signals.push({
      name: 'MACD',
      category: 'momentum',
      value: lastMacd,
      thresholds: { bullish: 0, bearish: 0 },
      signal: lastMacd > 0 ? 'BULL' : 'BEAR',
      strength: Math.abs(lastMacd) * 100,
      isBinary: false,
      metadata: { crossover: (prevMacd < 0 && lastMacd > 0) || (prevMacd > 0 && lastMacd < 0) }
    });
  }

  // Bollinger Bands Squeeze
  const bb = calculateBollingerBands(closes, 20, 2);
  const bandwidth = (bb.upper[bb.upper.length - 1] - bb.lower[bb.lower.length - 1]) / bb.middle[bb.middle.length - 1];
  if (!isNaN(bandwidth)) {
    signals.push({
      name: 'BB_Squeeze',
      category: 'volatility',
      value: bandwidth,
      thresholds: { bullish: 0.1, bearish: 0.1 },
      signal: bandwidth < 0.1 ? 'BULL' : 'NEUTRAL', // Squeeze often precedes breakout
      strength: bandwidth < 0.05 ? 100 : 50,
      isBinary: false
    });
  }

  // ATR
  const atr = calculateATR(highs, lows, closes, 14);
  const lastAtr = atr[atr.length - 1];
  if (!isNaN(lastAtr)) {
    signals.push({
      name: 'ATR',
      category: 'volatility',
      value: lastAtr,
      thresholds: { bullish: 0, bearish: 0 },
      signal: 'NEUTRAL',
      strength: 50,
      isBinary: false,
      metadata: { stopLossDistance: lastAtr * 1.5 }
    });
  }

  // OBV Trend
  const obv = calculateOBV(closes, volumes);
  const obvTrend = obv[obv.length - 1] > obv[obv.length - 10] ? 'uptrend' : 'downtrend';
  signals.push({
    name: 'OBV',
    category: 'volume',
    value: obvTrend === 'uptrend' ? 1 : 0,
    thresholds: { bullish: 0.5, bearish: 0.5 },
    signal: obvTrend === 'uptrend' ? 'BULL' : 'BEAR',
    strength: 60,
    isBinary: false
  });

  // Candlestick Patterns
  const patterns = detectCandlestickPatterns(opens, highs, lows, closes);
  const recentPattern = patterns.filter(p => p.index >= closes.length - 5);
  if (recentPattern.length > 0) {
    const pattern = recentPattern[recentPattern.length - 1];
    signals.push({
      name: 'Candlestick_Pattern',
      category: 'price_action',
      value: pattern.bullish ? 1 : 0,
      thresholds: { bullish: 0.5, bearish: 0.5 },
      signal: pattern.bullish ? 'BULL' : 'BEAR',
      strength: 70,
      isBinary: true,
      detected: true,
      metadata: { patternType: pattern.name }
    });
  }

  // Support/Resistance
  const sr = findSupportResistance(highs, lows, 10);
  const currentPrice = closes[closes.length - 1];
  const nearestResistance = sr.filter(l => l.type === 'resistance' && l.price > currentPrice).sort((a, b) => a.price - b.price)[0];
  const nearestSupport = sr.filter(l => l.type === 'support' && l.price < currentPrice).sort((a, b) => b.price - a.price)[0];
  
  if (nearestResistance || nearestSupport) {
    const distanceToResistance = nearestResistance ? (nearestResistance.price - currentPrice) / currentPrice : 1;
    const distanceToSupport = nearestSupport ? (currentPrice - nearestSupport.price) / currentPrice : 1;
    
    signals.push({
      name: 'Support_Resistance',
      category: 'price_action',
      value: distanceToResistance < distanceToSupport ? 0 : 1,
      thresholds: { bullish: 0.5, bearish: 0.5 },
      signal: distanceToResistance < 0.02 ? 'BEAR' : distanceToSupport < 0.02 ? 'BULL' : 'NEUTRAL',
      strength: 60,
      isBinary: false,
      metadata: { resistance: nearestResistance?.price, support: nearestSupport?.price }
    });
  }

  return signals;
}

/**
 * Detect Head & Shoulders pattern (JS fallback)
 */
export function detectHeadAndShouldersJS(highs: number[], lows: number[], closes: number[]) {
  // Simplified H&S detection - looks for 3 peaks with middle highest
  const len = highs.length;
  if (len < 50) return { detected: false, type: null, confidence: 0 };
  
  // Find local maxima in last 50 candles
  const peaks: { index: number; price: number }[] = [];
  for (let i = 10; i < len - 10; i++) {
    let isPeak = true;
    for (let j = 1; j <= 10; j++) {
      if (highs[i] <= highs[i - j] || highs[i] <= highs[i + j]) {
        isPeak = false;
        break;
      }
    }
    if (isPeak) peaks.push({ index: i, price: highs[i] });
  }
  
  if (peaks.length < 3) return { detected: false, type: null, confidence: 0 };
  
  // Check last 3 peaks for H&S pattern
  const last3 = peaks.slice(-3);
  const left = last3[0];
  const head = last3[1];
  const right = last3[2];
  
  // Head should be highest, left and right should be similar height
  const isHS = head.price > left.price && 
               head.price > right.price && 
               Math.abs(left.price - right.price) / head.price < 0.1;
  
  if (isHS) {
    const neckline = (lows[left.index] + lows[right.index]) / 2;
    const target = neckline - (head.price - neckline);
    return { detected: true, type: 'head_and_shoulders', confidence: 75, neckline, target };
  }
  
  // Check for inverse H&S
  const valleys: { index: number; price: number }[] = [];
  for (let i = 10; i < len - 10; i++) {
    let isValley = true;
    for (let j = 1; j <= 10; j++) {
      if (lows[i] >= lows[i - j] || lows[i] >= lows[i + j]) {
        isValley = false;
        break;
      }
    }
    if (isValley) valleys.push({ index: i, price: lows[i] });
  }
  
  if (valleys.length >= 3) {
    const last3V = valleys.slice(-3);
    const leftV = last3V[0];
    const headV = last3V[1];
    const rightV = last3V[2];
    
    const isInvHS = headV.price < leftV.price && 
                    headV.price < rightV.price && 
                    Math.abs(leftV.price - rightV.price) / headV.price < 0.1;
    
    if (isInvHS) {
      const necklineV = (highs[leftV.index] + highs[rightV.index]) / 2;
      const targetV = necklineV + (necklineV - headV.price);
      return { detected: true, type: 'inverse_head_and_shoulders', confidence: 75, neckline: necklineV, target: targetV };
    }
  }
  
  return { detected: false, type: null, confidence: 0 };
}

/**
 * Detect Cup & Handle pattern (JS fallback)
 */
export function detectCupAndHandleJS(highs: number[], lows: number[], closes: number[]) {
  const len = highs.length;
  if (len < 60) return { detected: false, confidence: 0 };
  
  // Look for U-shaped pattern in last 60 candles
  const start = len - 60;
  const mid = len - 20;
  
  const firstHigh = highs.slice(start, start + 10).reduce((a, b) => Math.max(a, b));
  const cupLow = lows.slice(start + 10, mid).reduce((a, b) => Math.min(a, b));
  const handleHigh = highs.slice(mid, len - 5).reduce((a, b) => Math.max(a, b));
  const currentPrice = closes[closes.length - 1];
  
  // Cup depth should be 10-30%
  const cupDepth = (firstHigh - cupLow) / firstHigh;
  const isCup = cupDepth > 0.1 && cupDepth < 0.3;
  
  // Handle should be shallow pullback (less than 50% of cup depth)
  const handlePullback = (handleHigh - currentPrice) / handleHigh;
  const isHandle = handlePullback > 0 && handlePullback < cupDepth * 0.5;
  
  if (isCup && isHandle) {
    const breakoutPoint = handleHigh;
    const target = breakoutPoint + (breakoutPoint - cupLow);
    return { detected: true, confidence: 70, breakoutPoint, target, cupDepth };
  }
  
  return { detected: false, confidence: 0 };
}

/**
 * Detect VCP pattern (JS fallback)
 */
export function detectVCPJS(highs: number[], lows: number[], volumes: number[]) {
  const len = highs.length;
  if (len < 40) return { detected: false, contractions: 0 };
  
  // Look for decreasing volatility contractions
  const lookback = 30;
  const start = len - lookback;
  
  // Calculate volatility in 3 segments
  const segmentSize = Math.floor(lookback / 3);
  const volatilities: number[] = [];
  
  for (let i = 0; i < 3; i++) {
    const segStart = start + i * segmentSize;
    const segEnd = segStart + segmentSize;
    const segHighs = highs.slice(segStart, segEnd);
    const segLows = lows.slice(segStart, segEnd);
    const range = (Math.max(...segHighs) - Math.min(...segLows)) / Math.min(...segLows);
    volatilities.push(range);
  }
  
  // Check for decreasing volatility
  const isContracting = volatilities[0] > volatilities[1] && volatilities[1] > volatilities[2];
  
  // Check for volume dry-up in last segment
  const volStart = start + 2 * segmentSize;
  const firstHalfVol = volumes.slice(volStart, volStart + Math.floor(segmentSize / 2)).reduce((a, b) => a + b, 0);
  const secondHalfVol = volumes.slice(volStart + Math.floor(segmentSize / 2), volStart + segmentSize).reduce((a, b) => a + b, 0);
  const isVolumeDryUp = secondHalfVol < firstHalfVol * 0.7;
  
  if (isContracting && isVolumeDryUp) {
    return { detected: true, contractions: 3, avgContraction: (volatilities[0] - volatilities[2]) / volatilities[0] * 100 };
  }
  
  return { detected: false, contractions: 0 };
}

/**
 * Run backtest on strategy (JS fallback)
 */
export function runBacktestJS(closes: number[], highs: number[], lows: number[], strategy: string) {
  const len = closes.length;
  if (len < 50) return { trades: [], winRate: 0, totalReturn: 0, equity: [] };
  
  const trades: any[] = [];
  let position = 0;
  let entryPrice = 0;
  let wins = 0;
  let losses = 0;
  let equity = 10000; // Start with $10k
  
  // Simple MA crossover backtest for demo
  const ma50 = [];
  const ma200 = [];
  
  for (let i = 0; i < len; i++) {
    if (i >= 49) {
      const sum50 = closes.slice(i - 49, i + 1).reduce((a, b) => a + b, 0);
      ma50.push(sum50 / 50);
    } else {
      ma50.push(NaN);
    }
    
    if (i >= 199) {
      const sum200 = closes.slice(i - 199, i + 1).reduce((a, b) => a + b, 0);
      ma200.push(sum200 / 200);
    } else {
      ma200.push(NaN);
    }
  }
  
  for (let i = 200; i < len; i++) {
    const prevMa50 = ma50[i - 1];
    const prevMa200 = ma200[i - 1];
    const currMa50 = ma50[i];
    const currMa200 = ma200[i];
    
    if (!isNaN(prevMa50) && !isNaN(prevMa200) && !isNaN(currMa50) && !isNaN(currMa200)) {
      // Golden cross - buy
      if (prevMa50 <= prevMa200 && currMa50 > currMa200 && position === 0) {
        position = 1;
        entryPrice = closes[i];
      }
      // Death cross - sell
      else if (prevMa50 >= prevMa200 && currMa50 < currMa200 && position === 1) {
        const pnl = (closes[i] - entryPrice) / entryPrice * equity;
        equity += pnl;
        const isWin = pnl > 0;
        if (isWin) wins++; else losses++;
        
        trades.push({
          entry: entryPrice,
          exit: closes[i],
          pnl,
          isWin,
          exitIndex: i
        });
        
        position = 0;
      }
    }
    
    equity *= (1 + (closes[i] - closes[i - 1]) / closes[i - 1] * position);
  }
  
  const totalTrades = wins + losses;
  return {
    trades,
    winRate: totalTrades > 0 ? (wins / totalTrades) * 100 : 0,
    totalReturn: ((equity - 10000) / 10000) * 100,
    equity: [10000, equity],
    finalEquity: equity
  };
}
