/**
 * WASM Bridge - Connects TypeScript to Rust indicators
 * Falls back to pure JS implementation if WASM fails to load
 */
import { scanIndicatorsJS, detectHeadAndShouldersJS, detectCupAndHandleJS, detectVCPJS, runBacktestJS } from './fallback_engine';

// Placeholder types for WASM (will be replaced when WASM is built)
interface IndicatorResult {
  name: string;
  value: number;
  signal: string;
  is_binary?: boolean;
  detected?: boolean;
  metadata?: Record<string, any>;
}

let wasmInitialized = false;
let wasmAvailable = false;

// Placeholder functions for WASM (will be replaced when WASM module is imported)
let scan_indicators: any = null;
let detect_head_and_shoulders: any = null;
let detect_cup_and_handle: any = null;
let detect_vcp: any = null;
let backtest_strategy: any = null;

/**
 * Initialize the WASM module
 */
export async function initIndicators(): Promise<void> {
  if (wasmInitialized) return;
  
  // Try to dynamically import WASM module
  try {
    // Dynamic import with type assertion to avoid TS error when pkg doesn't exist yet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wasmModule = await import(/* webpackIgnore: true */ '../../rust-indicators/pkg/index.js' as any);
    await wasmModule.default();
    
    // Import the actual WASM functions
    scan_indicators = wasmModule.scan_indicators;
    detect_head_and_shoulders = wasmModule.detect_head_and_shoulders;
    detect_cup_and_handle = wasmModule.detect_cup_and_handle;
    detect_vcp = wasmModule.detect_vcp;
    backtest_strategy = wasmModule.backtest_strategy;
    
    wasmInitialized = true;
    wasmAvailable = true;
    console.log('[StockLens] WASM indicators loaded');
  } catch (error) {
    console.warn('[StockLens] WASM not available, using JS fallback:', error);
    wasmInitialized = true;
    wasmAvailable = false;
  }
}

/**
 * Run all indicators on OHLCV data
 * Returns array of raw indicator results from Rust or JS fallback
 */
export function scanAllIndicators(
  opens: number[],
  highs: number[],
  lows: number[],
  closes: number[],
  volumes: number[]
): any[] {
  if (!wasmInitialized) {
    throw new Error('WASM not initialized. Call initIndicators() first.');
  }

  // Use JS fallback if WASM unavailable
  if (!wasmAvailable) {
    console.log('[StockLens] Using JS fallback for indicators');
    return scanIndicatorsJS(opens, highs, lows, closes, volumes).map(sig => ({
      ...sig,
      timestamp: Date.now(),
      timeframe: '1D' as const
    }));
  }

  try {
    const results = scan_indicators(opens, highs, lows, closes, volumes);
    return results.map(mapRustResultToSignal);
  } catch (error) {
    console.error('[StockLens] WASM scan error, falling back to JS:', error);
    wasmAvailable = false;
    return scanIndicatorsJS(opens, highs, lows, closes, volumes).map(sig => ({
      ...sig,
      timestamp: Date.now(),
      timeframe: '1D' as const
    }));
  }
}

/**
 * Advanced pattern detection wrappers
 */
export function detectHeadAndShoulders(highs: number[], lows: number[], closes: number[]) {
  if (!wasmInitialized) throw new Error('WASM not initialized');
  
  if (!wasmAvailable) {
    return detectHeadAndShouldersJS(highs, lows, closes);
  }
  
  try {
    return detect_head_and_shoulders(highs, lows, closes);
  } catch (error) {
    console.error('[StockLens] WASM H&S error, falling back to JS:', error);
    wasmAvailable = false;
    return detectHeadAndShouldersJS(highs, lows, closes);
  }
}

export function detectCupAndHandle(highs: number[], lows: number[], closes: number[]) {
  if (!wasmInitialized) throw new Error('WASM not initialized');
  
  if (!wasmAvailable) {
    return detectCupAndHandleJS(highs, lows, closes);
  }
  
  try {
    return detect_cup_and_handle(highs, lows, closes);
  } catch (error) {
    console.error('[StockLens] WASM C&H error, falling back to JS:', error);
    wasmAvailable = false;
    return detectCupAndHandleJS(highs, lows, closes);
  }
}

export function detectVCP(highs: number[], lows: number[], volumes: number[]) {
  if (!wasmInitialized) throw new Error('WASM not initialized');
  
  if (!wasmAvailable) {
    return detectVCPJS(highs, lows, volumes);
  }
  
  try {
    return detect_vcp(highs, lows, volumes);
  } catch (error) {
    console.error('[StockLens] WASM VCP error, falling back to JS:', error);
    wasmAvailable = false;
    return detectVCPJS(highs, lows, volumes);
  }
}

export function runBacktest(closes: number[], highs: number[], lows: number[], strategy: string) {
  if (!wasmInitialized) throw new Error('WASM not initialized');
  
  if (!wasmAvailable) {
    return runBacktestJS(closes, highs, lows, strategy);
  }
  
  try {
    return backtest_strategy(closes, highs, lows, strategy);
  } catch (error) {
    console.error('[StockLens] WASM backtest error, falling back to JS:', error);
    wasmAvailable = false;
    return runBacktestJS(closes, highs, lows, strategy);
  }
}

/**
 * Maps Rust IndicatorResult to our SignalResult format
 */
function mapRustResultToSignal(rustResult: IndicatorResult): any {
  const categoryMap: Record<string, 'momentum' | 'trend' | 'volume' | 'volatility' | 'price_action'> = {
    'RSI': 'momentum',
    'MACD': 'momentum',
    'Stochastic': 'momentum',
    'Williams_R': 'momentum',
    'CCI': 'momentum',
    'ROC': 'momentum',
    'Awesome_Oscillator': 'momentum',
    'Stoch_RSI': 'momentum',
    
    'MA_Crossover': 'trend',
    'ADX': 'trend',
    'Ichimoku': 'trend',
    'Supertrend': 'trend',
    'Parabolic_SAR': 'trend',
    'VWAP': 'trend',
    'Aroon': 'trend',
    'Donchian': 'trend',
    'Linear_Regression': 'trend',
    
    'OBV': 'volume',
    'Acc_Dist': 'volume',
    'MFI': 'volume',
    'Volume_Spike': 'volume',
    'Chaikin_MF': 'volume',
    'VWAP_Deviation': 'volume',
    
    'BB_Squeeze': 'volatility',
    'ATR': 'volatility',
    'Keltner': 'volatility',
    'Historical_Volatility': 'volatility',
    'ATR_Percent': 'volatility',
    
    'Support_Resistance': 'price_action',
    'Breakout': 'price_action',
    'HH_HL_Structure': 'price_action',
    'Candlestick_Patterns': 'price_action',
    'Inside_Bar': 'price_action',
    'Double_Top_Bottom': 'price_action',
    'Head_Shoulders': 'price_action',
    'Fair_Value_Gap': 'price_action',
    'Order_Block': 'price_action',
    'Cup_Handle': 'price_action'
  };

  const thresholds = getThresholdsForIndicator(rustResult.name);
  
  let signal: 'BULL' | 'BEAR' | 'NEUTRAL' = 'NEUTRAL';
  if (rustResult.value > thresholds.bullish) signal = 'BULL';
  else if (rustResult.value < thresholds.bearish) signal = 'BEAR';

  // Handle binary patterns
  const isBinary = rustResult.is_binary || false;
  const detected = rustResult.detected || false;
  
  if (isBinary) {
    signal = detected ? 'BULL' : 'NEUTRAL';
  }

  // Calculate strength (0-100)
  let strength = 50;
  if (!isBinary && thresholds.bullish !== thresholds.bearish) {
    const range = thresholds.bullish - thresholds.bearish;
    if (range !== 0) {
      strength = Math.min(100, Math.max(0, 
        ((rustResult.value - thresholds.bearish) / range) * 100
      ));
    }
  } else if (isBinary) {
    strength = detected ? 100 : 0;
  }

  return {
    name: rustResult.name,
    category: categoryMap[rustResult.name] || 'momentum',
    value: rustResult.value,
    thresholds,
    signal,
    strength: Math.round(strength),
    isBinary,
    detected,
    metadata: rustResult.metadata || {},
    timestamp: 0, // Will be set by caller
    timeframe: '1D' as const // Will be set by caller
  };
}

/**
 * Get default thresholds for each indicator
 */
function getThresholdsForIndicator(name: string): { bullish: number; bearish: number } {
  const defaults: Record<string, { bullish: number; bearish: number }> = {
    'RSI': { bullish: 70, bearish: 30 },
    'MACD': { bullish: 0, bearish: 0 }, // Zero line cross
    'Stochastic': { bullish: 80, bearish: 20 },
    'Williams_R': { bullish: -20, bearish: -80 },
    'CCI': { bullish: 100, bearish: -100 },
    'ROC': { bullish: 0, bearish: 0 },
    'Awesome_Oscillator': { bullish: 0, bearish: 0 },
    'Stoch_RSI': { bullish: 80, bearish: 20 },
    
    'ADX': { bullish: 25, bearish: 20 }, // Trend strength
    'Aroon': { bullish: 70, bearish: 30 },
    
    'MFI': { bullish: 80, bearish: 20 },
    'Chaikin_MF': { bullish: 0.1, bearish: -0.1 },
    
    'BB_Squeeze': { bullish: 0, bearish: 0 }, // Binary essentially
    'ATR': { bullish: 0, bearish: 0 }, // Neutral, used for calculation
    
    // Patterns are binary
    'Support_Resistance': { bullish: 0, bearish: 0 },
    'Breakout': { bullish: 0, bearish: 0 },
    'Candlestick_Patterns': { bullish: 0, bearish: 0 },
    'Inside_Bar': { bullish: 0, bearish: 0 },
    'Double_Top_Bottom': { bullish: 0, bearish: 0 },
    'Head_Shoulders': { bullish: 0, bearish: 0 },
    'Fair_Value_Gap': { bullish: 0, bearish: 0 },
    'Order_Block': { bullish: 0, bearish: 0 },
    'Cup_Handle': { bullish: 0, bearish: 0 }
  };

  return defaults[name] || { bullish: 0, bearish: 0 };
}

/**
 * Check if WASM is ready
 */
export function isWasmReady(): boolean {
  return wasmInitialized;
}
