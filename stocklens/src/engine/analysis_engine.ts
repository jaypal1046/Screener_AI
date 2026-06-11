import { ScanReport, SignalResult, Timeframe, PatternSignal, BacktestResult } from './types';
import { initIndicators, scanAllIndicators, detectHeadAndShoulders, detectCupAndHandle, detectVCP, runBacktest } from './wasm_bridge';

export interface SetupCard {
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  entryZone: [number, number];
  stopLoss: number;
  target1: number;
  target2: number;
  riskRewardRatio: number;
  confidence: number; // 0-100
  reasoning: string[];
}

export interface MTFConfluence {
  shortTerm: 'BULL' | 'BEAR' | 'NEUTRAL';
  mediumTerm: 'BULL' | 'BEAR' | 'NEUTRAL';
  longTerm: 'BULL' | 'BEAR' | 'NEUTRAL';
  alignment: 'STRONG_BULL' | 'STRONG_BEAR' | 'MIXED' | 'CONFLICT';
}

/**
 * Initializes the WASM module. Must be called before scanning.
 */
export async function initializeEngine(): Promise<void> {
  await initIndicators();
  console.log('[StockLens] Math engine initialized (WASM ready)');
}

/**
 * Calculates the weighted consensus score (0-100)
 * Weights: Trend (30%), Momentum (25%), Volume (20%), Volatility (15%), Price Action (10%)
 */
function calculateConsensusScore(signals: SignalResult[]): number {
  const weights: Record<string, number> = {
    trend: 0.30,
    momentum: 0.25,
    volume: 0.20,
    volatility: 0.15,
    price_action: 0.10
  };

  const categoryScores: Record<string, { total: number; count: number }> = {
    trend: { total: 0, count: 0 },
    momentum: { total: 0, count: 0 },
    volume: { total: 0, count: 0 },
    volatility: { total: 0, count: 0 },
    price_action: { total: 0, count: 0 }
  };

  signals.forEach(sig => {
    if (!categoryScores[sig.category]) return;
    
    // Normalize signal value to -1 (Bear) to 1 (Bull)
    let sentiment = 0;
    if (sig.value > sig.thresholds?.bullish) sentiment = 1;
    else if (sig.value < sig.thresholds?.bearish) sentiment = -1;
    else sentiment = 0;

    // Special handling for binary signals (e.g., pattern detected)
    if (sig.isBinary) {
      sentiment = sig.detected ? 1 : 0; 
    }

    categoryScores[sig.category].total += sentiment;
    categoryScores[sig.category].count += 1;
  });

  let weightedSum = 0;
  let totalWeightUsed = 0;

  Object.keys(categoryScores).forEach(cat => {
    const data = categoryScores[cat];
    if (data.count === 0) return;
    
    // Average sentiment in category (-1 to 1)
    const avgSentiment = data.total / data.count;
    // Convert to 0-100 scale (0.5 = neutral 50)
    const normalizedScore = (avgSentiment + 1) * 50;
    
    weightedSum += normalizedScore * weights[cat];
    totalWeightUsed += weights[cat];
  });

  return totalWeightUsed > 0 ? Math.round(weightedSum / totalWeightUsed) : 50;
}

/**
 * Analyzes Multi-Timeframe Confluence
 */
export function analyzeMTFConfluence(
  short: ScanReport,
  medium: ScanReport,
  long: ScanReport
): MTFConfluence {
  const getBias = (report: ScanReport): 'BULL' | 'BEAR' | 'NEUTRAL' => {
    const score = calculateConsensusScore(report.signals);
    if (score > 60) return 'BULL';
    if (score < 40) return 'BEAR';
    return 'NEUTRAL';
  };

  const s = getBias(short);
  const m = getBias(medium);
  const l = getBias(long);

  let alignment: MTFConfluence['alignment'] = 'MIXED';
  if (s === 'BULL' && m === 'BULL' && l === 'BULL') alignment = 'STRONG_BULL';
  else if (s === 'BEAR' && m === 'BEAR' && l === 'BEAR') alignment = 'STRONG_BEAR';
  else if (s !== m || m !== l) alignment = 'CONFLICT';

  return { shortTerm: s, mediumTerm: m, longTerm: l, alignment };
}

/**
 * Generates an Auto Setup Card (Entry, SL, Target) based on ATR and S/R
 */
export function generateSetupCard(signals: SignalResult[], currentPrice: number): SetupCard | null {
  const atrSignal = signals.find(s => s.name === 'ATR');
  const rsiSignal = signals.find(s => s.name === 'RSI');
  const trendScore = calculateConsensusScore(signals.filter(s => s.category === 'trend'));
  
  if (!atrSignal) return null;

  const atr = atrSignal.value;
  const isBullish = trendScore > 55;
  const isBearish = trendScore < 45;

  if (!isBullish && !isBearish) {
    return {
      direction: 'NEUTRAL',
      entryZone: [currentPrice, currentPrice],
      stopLoss: 0,
      target1: 0,
      target2: 0,
      riskRewardRatio: 0,
      confidence: trendScore,
      reasoning: ['Market ranging', 'No clear trend direction']
    };
  }

  const direction = isBullish ? 'LONG' : 'SHORT';
  const multiplier = isBullish ? 1 : -1;
  
  // Entry: Current price +/- small buffer
  const entryBuffer = atr * 0.1;
  const entryLow = isBullish ? currentPrice : currentPrice - entryBuffer;
  const entryHigh = isBullish ? currentPrice + entryBuffer : currentPrice;

  // Stop Loss: 2x ATR away
  const stopLoss = currentPrice - (2 * atr * multiplier);

  // Targets: 1R and 2R
  const risk = Math.abs(currentPrice - stopLoss);
  const target1 = currentPrice + (risk * 1.5 * multiplier);
  const target2 = currentPrice + (risk * 3.0 * multiplier);

  const reasoning: string[] = [];
  if (isBullish) {
    reasoning.push(`Trend Score: ${trendScore}/100 (Bullish)`);
    if (rsiSignal && rsiSignal.value < 70) reasoning.push('RSI has room to run');
    reasoning.push(`Volatility (ATR): ₹${atr.toFixed(2)}`);
  } else {
    reasoning.push(`Trend Score: ${trendScore}/100 (Bearish)`);
    if (rsiSignal && rsiSignal.value > 30) reasoning.push('RSI has room to drop');
    reasoning.push(`Volatility (ATR): ₹${atr.toFixed(2)}`);
  }

  return {
    direction,
    entryZone: [entryLow, entryHigh],
    stopLoss: parseFloat(stopLoss.toFixed(2)),
    target1: parseFloat(target1.toFixed(2)),
    target2: parseFloat(target2.toFixed(2)),
    riskRewardRatio: 2.0, // Since we used 1.5R and 3R targets vs 1R risk avg
    confidence: trendScore,
    reasoning
  };
}

/**
 * Main scanning function for a single timeframe
 */
export async function runScanner(
  ticker: string,
  timeframe: Timeframe,
  ohlcv: { time: number, open: number, high: number, low: number, close: number, volume: number }[]
): Promise<ScanReport> {
  if (ohlcv.length < 50) {
    throw new Error(`Insufficient data for ${timeframe}: need 50+, got ${ohlcv.length}`);
  }

  // Extract arrays for WASM
  const opens = ohlcv.map(d => d.open);
  const highs = ohlcv.map(d => d.high);
  const lows = ohlcv.map(d => d.low);
  const closes = ohlcv.map(d => d.close);
  const volumes = ohlcv.map(d => d.volume);

  // Call WASM
  const rawSignals = scanAllIndicators(opens, highs, lows, closes, volumes);

  // Enrich with metadata
  const signals: SignalResult[] = rawSignals.map(s => ({
    ...s,
    timestamp: Date.now(),
    timeframe
  }));

  const consensusScore = calculateConsensusScore(signals);
  const currentPrice = closes[closes.length - 1];
  const setupCard = generateSetupCard(signals, currentPrice);

  return {
    ticker,
    timeframe,
    lastUpdated: Date.now(),
    currentPrice,
    consensusScore,
    signals,
    setupCard,
    metadata: {
      dataPoints: ohlcv.length,
      startDate: new Date(ohlcv[0].time).toISOString(),
      endDate: new Date(ohlcv[ohlcv.length - 1].time).toISOString()
    }
  };
}

/**
 * Run advanced pattern detection (H&S, Cup&Handle, VCP)
 * Returns array of pattern signals to merge with main scan results
 */
export function detectAdvancedPatterns(
  highs: number[],
  lows: number[],
  closes: number[],
  volumes: number[]
): PatternSignal[] {
  const patterns: PatternSignal[] = [];
  
  try {
    // Head & Shoulders
    const hsResult = detectHeadAndShoulders(highs, lows, closes);
    if (hsResult && typeof hsResult === 'object' && hsResult.detected) {
      patterns.push({
        name: 'HeadAndShoulders' as any,
        category: 'price_action',
        patternType: hsResult.type === 'Inverse Head and Shoulders' ? 'InverseHeadAndShoulders' : 'HeadAndShoulders',
        value: hsResult.confidence || 0.5,
        thresholds: { bullish: 0.5, bearish: 0 },
        signal: hsResult.breakdown ? 'BEAR' : 'BULL',
        strength: Math.round((hsResult.confidence || 0.5) * 100),
        isBinary: true,
        detected: true,
        confidence: hsResult.confidence || 0.5,
        neckline: hsResult.neckline,
        target: hsResult.target,
        metadata: { type: hsResult.type },
        timestamp: Date.now(),
        timeframe: '1D'
      });
    }
    
    // Cup & Handle
    const chResult = detectCupAndHandle(highs, lows, closes);
    if (chResult && typeof chResult === 'object' && chResult.detected) {
      patterns.push({
        name: 'CupAndHandle' as any,
        category: 'price_action',
        patternType: 'CupAndHandle',
        value: chResult.confidence || 0.5,
        thresholds: { bullish: 0.5, bearish: 0 },
        signal: 'BULL',
        strength: Math.round((chResult.confidence || 0.5) * 100),
        isBinary: true,
        detected: true,
        confidence: chResult.confidence || 0.75,
        breakoutPoint: chResult.breakout_point,
        target: chResult.target,
        metadata: {},
        timestamp: Date.now(),
        timeframe: '1D'
      });
    }
    
    // VCP (Volatility Contraction Pattern)
    const vcpResult = detectVCP(highs, lows, volumes);
    if (vcpResult && typeof vcpResult === 'object' && vcpResult.detected) {
      patterns.push({
        name: 'VCP' as any,
        category: 'volatility',
        patternType: 'VCP',
        value: vcpResult.confidence || 0.5,
        thresholds: { bullish: 0.5, bearish: 0 },
        signal: 'BULL',
        strength: Math.round((vcpResult.confidence || 0.85) * 100),
        isBinary: true,
        detected: true,
        confidence: vcpResult.confidence || 0.85,
        metadata: { contractions: vcpResult.contractions, volumeDryUp: vcpResult.volume_dry_up },
        timestamp: Date.now(),
        timeframe: '1D'
      });
    }
  } catch (error) {
    console.error('[StockLens] Pattern detection error:', error);
  }
  
  return patterns;
}

/**
 * Run backtest on historical data
 * Returns performance metrics for a given strategy
 */
export function backtestStrategy(
  closes: number[],
  highs: number[],
  lows: number[],
  strategy: string = 'ma_cross'
): BacktestResult {
  try {
    const result = runBacktest(closes, highs, lows, strategy);
    return {
      totalTrades: result.total_trades || 0,
      winningTrades: result.winning_trades || 0,
      winRate: result.win_rate || 0,
      finalEquity: result.final_equity || 10000,
      returnPct: result.return_pct || 0
    };
  } catch (error) {
    console.error('[StockLens] Backtest error:', error);
    return {
      totalTrades: 0,
      winningTrades: 0,
      winRate: 0,
      finalEquity: 10000,
      returnPct: 0
    };
  }
}
