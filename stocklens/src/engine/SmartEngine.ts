/**
 * StockLens Smart Engine
 * Handles signal aggregation, MTF confluence, and auto-setup calculation.
 * Pure TypeScript - no external dependencies.
 */

import { ScanReport, SignalResult, Timeframe, SetupCard } from './types';

// Weighting configuration for the consensus score
const SIGNAL_WEIGHTS: Record<string, number> = {
  // Core Momentum
  'rsi': 1.0,
  'macd': 1.2,
  'stochastic': 1.0,
  'roc': 0.8,
  // Core Trend
  'ma_crossover': 1.5,
  'adx': 1.0,
  'parabolic_sar': 1.0,
  'vwap': 1.2,
  // Core Volume
  'obv': 1.3,
  'acc_dist': 1.1,
  'volume_spike': 1.4,
  // Core Volatility
  'bb_squeeze': 1.5, // High probability event
  'atr': 0.5, // Mostly for sizing, not direction
  // Price Action
  'support_resistance': 1.6,
  'breakout': 1.8,
  'hh_hl_structure': 1.4,
  'candlestick_pattern': 1.3,
  // Unique/Smart
  'fair_value_gap': 1.2,
  'order_block': 1.3,
};

const BULLISH_SIGNALS = ['buy', 'bullish', 'oversold_reversal', 'golden_cross', 'breakout_up'];
const BEARISH_SIGNALS = ['sell', 'bearish', 'overbought_reversal', 'death_cross', 'breakdown_down'];

export class SmartEngine {
  /**
   * Calculates the weighted consensus score (0-100)
   * 50 = Neutral, >50 = Bullish bias, <50 = Bearish bias
   */
  calculateConsensusScore(reports: ScanReport[]): number {
    let totalWeight = 0;
    let bullishWeight = 0;
    let bearishWeight = 0;

    reports.forEach(report => {
      report.signals.forEach(signal => {
        const indicatorKey = signal.indicator || signal.name;
        const weight = SIGNAL_WEIGHTS[indicatorKey] || 1.0;
        totalWeight += weight;

        if (BULLISH_SIGNALS.includes(signal.signal)) {
          bullishWeight += weight;
        } else if (BEARISH_SIGNALS.includes(signal.signal)) {
          bearishWeight += weight;
        }
      });
    });

    if (totalWeight === 0) return 50;

    // Base score is 50. Add proportional bias.
    // Max deviation is +/- 50 points.
    const netBias = (bullishWeight - bearishWeight) / totalWeight;
    return Math.round(50 + (netBias * 50));
  }

  /**
   * Checks Multi-Timeframe Confluence
   * Returns true if majority of timeframes agree on direction
   */
  checkMTFConfluence(reports: ScanReport[]): { agreed: boolean, direction: 'bullish' | 'bearish' | 'neutral', strength: number } {
    const timeframeScores: Record<string, number> = {};
    
    reports.forEach(report => {
      timeframeScores[report.timeframe] = this.calculateConsensusScore([report]);
    });

    const values = Object.values(timeframeScores);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Count how many timeframes are > 60 (bullish) or < 40 (bearish)
    const bullishCount = values.filter(v => v > 60).length;
    const bearishCount = values.filter(v => v < 40).length;
    const totalTFs = values.length;

    if (bullishCount > totalTFs / 2) {
      return { agreed: true, direction: 'bullish', strength: bullishCount };
    }
    if (bearishCount > totalTFs / totalTFs / 2) {
      return { agreed: true, direction: 'bearish', strength: bearishCount };
    }

    return { agreed: false, direction: 'neutral', strength: 0 };
  }

  /**
   * Generates an Auto Setup Card (Entry, SL, Target)
   * Uses ATR for stops and S/R for targets
   */
  generateAutoSetup(reports: ScanReport[], currentPrice: number): SetupCard | null {
    // Find the latest daily report for baseline structure
    const dailyReport = reports.find(r => r.timeframe === '1D');
    if (!dailyReport) return null;

    // Extract ATR (14) value
    const atrSignal = dailyReport.signals.find(s => s.indicator === 'atr' || s.name === 'atr');
    const atrValue = atrSignal?.value || (currentPrice * 0.02); // Fallback 2%

    // Determine Direction based on consensus
    const score = this.calculateConsensusScore([dailyReport]);
    const isLong = score >= 55;
    const isShort = score <= 45;

    if (!isLong && !isShort) return null;

    // Extract Support/Resistance levels
    const srSignal = dailyReport.signals.find(s => s.indicator === 'support_resistance' || s.name === 'support_resistance');
    const levels = srSignal?.metadata?.levels as number[] || [];
    
    let entry = currentPrice;
    let stopLoss = 0;
    let target = 0;
    let confidence: 'Low' | 'Medium' | 'High' = 'Medium';

    if (isLong) {
      // Stop Loss: Below recent swing low or 2x ATR
      const supportLevel = levels.filter(l => l < currentPrice).pop() || (currentPrice - (atrValue * 2));
      stopLoss = parseFloat((supportLevel - (atrValue * 0.5)).toFixed(2));
      
      // Target: Next resistance or 2R
      const resistanceLevel = levels.find(l => l > currentPrice);
      const risk = entry - stopLoss;
      target = resistanceLevel ? 
        parseFloat(resistanceLevel.toFixed(2)) : 
        parseFloat((entry + (risk * 2)).toFixed(2));

      if (score > 75) confidence = 'High';
      if (score < 60) confidence = 'Low';

    } else if (isShort) {
      // Stop Loss: Above recent swing high or 2x ATR
      const resistanceLevel = levels.find(l => l > currentPrice) || (currentPrice + (atrValue * 2));
      stopLoss = parseFloat((resistanceLevel + (atrValue * 0.5)).toFixed(2));
      
      // Target: Next support or 2R
      const supportLevel = levels.filter(l => l < currentPrice).pop();
      const risk = stopLoss - entry;
      target = supportLevel ? 
        parseFloat(supportLevel.toFixed(2)) : 
        parseFloat((entry - (risk * 2)).toFixed(2));

      if (score < 25) confidence = 'High';
      if (score > 40) confidence = 'Low';
    }

    const riskReward = Math.abs((target - entry) / (entry - stopLoss));
    const reasoningText = isLong ? `Bullish confluence with ${Math.round(atrValue)} ATR buffer` : `Bearish confluence with ${Math.round(atrValue)} ATR buffer`;

    return {
      direction: isLong ? 'LONG' : 'SHORT',
      entryZone: [entry * 0.99, entry * 1.01] as [number, number],
      stopLoss: stopLoss,
      target1: target,
      target2: target + (target - entry) * 0.5,
      riskRewardRatio: riskReward,
      confidence: Math.round(score),
      reasoning: [reasoningText],
      entry: entry,
      target: target,
      riskReward: riskReward
    };
  }

  /**
   * Formats signals for the UI overlay
   */
  formatSignalsForUI(reports: ScanReport[]): any[] {
    const uiData: any[] = [];
    
    reports.forEach(report => {
      const group = {
        timeframe: report.timeframe,
        score: this.calculateConsensusScore([report]),
        indicators: [] as any[]
      };

      report.signals.forEach(sig => {
        let color = 'gray';
        if (BULLISH_SIGNALS.includes(sig.signal)) color = 'green';
        if (BEARISH_SIGNALS.includes(sig.signal)) color = 'red';

        group.indicators.push({
          name: this.formatIndicatorName(sig.indicator || sig.name),
          value: sig.value?.toFixed(2) || '-',
          signal: sig.signal,
          color: color,
          description: sig.metadata?.description || ''
        });
      });

      uiData.push(group);
    });

    return uiData;
  }

  private formatIndicatorName(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
