/**
 * CustomScannerBuilder
 * Allows users to create, save, and run custom scanner presets.
 * Users can pick indicators, set thresholds, and define scoring weights.
 */

import { CustomScannerPreset, SignalResult, ScanReport } from './types';
import { StorageManager } from './storage_manager';

export class CustomScannerBuilder {
  
  private static readonly PRESET_KEY = 'stocklens_custom_presets';

  // --- Preset Management ---

  static async savePreset(preset: CustomScannerPreset): Promise<void> {
    const presets = await this.getPresets();
    const existingIndex = presets.findIndex(p => p.id === preset.id);
    
    if (existingIndex !== -1) {
      presets[existingIndex] = preset;
    } else {
      presets.push(preset);
    }
    
    await chrome.storage.local.set({ [this.PRESET_KEY]: presets });
  }

  static async getPresets(): Promise<CustomScannerPreset[]> {
    const result = await chrome.storage.local.get(this.PRESET_KEY);
    return result[this.PRESET_KEY] || [];
  }

  static async deletePreset(id: string): Promise<void> {
    const presets = await this.getPresets();
    const filtered = presets.filter(p => p.id !== id);
    await chrome.storage.local.set({ [this.PRESET_KEY]: filtered });
  }

  static async getPreset(id: string): Promise<CustomScannerPreset | null> {
    const presets = await this.getPresets();
    return presets.find(p => p.id === id) || null;
  }

  // --- Scanner Execution ---

  /**
   * Runs a custom preset against a given scan report.
   * Filters signals based on user thresholds and recalculates score.
   */
  static async runCustomPreset(presetId: string, report: ScanReport): Promise<ScanReport> {
    const preset = await this.getPreset(presetId);
    if (!preset) {
      throw new Error(`Preset ${presetId} not found`);
    }

    // Filter signals based on enabled categories
    const filteredSignals: SignalResult[] = [];
    
    if (preset.enabledCategories.includes('momentum')) {
      filteredSignals.push(...report.signals.filter(s => 
        s.indicator && ['rsi', 'macd', 'stochastic', 'williams_r', 'cci', 'roc', 'awesome_oscillator', 'stoch_rsi'].includes(s.indicator)
      ));
    }
    
    if (preset.enabledCategories.includes('trend')) {
      filteredSignals.push(...report.signals.filter(s => 
        s.indicator && ['ma_cross', 'adx', 'parabolic_sar', 'vwap', 'aroon', 'supertrend', 'ichimoku', 'donchian', 'linear_regression'].includes(s.indicator)
      ));
    }
    
    if (preset.enabledCategories.includes('volume')) {
      filteredSignals.push(...report.signals.filter(s => 
        s.indicator && ['obv', 'acc_dist', 'mfi', 'volume_spike', 'chaikin_mf', 'vwap_deviation'].includes(s.indicator)
      ));
    }
    
    if (preset.enabledCategories.includes('volatility')) {
      filteredSignals.push(...report.signals.filter(s => 
        s.indicator && ['bb_squeeze', 'atr', 'keltner', 'hist_vol', 'atr_percent', 'vcp'].includes(s.indicator)
      ));
    }
    
    if (preset.enabledCategories.includes('price_action')) {
      filteredSignals.push(...report.signals.filter(s => 
        s.indicator && ['support_resistance', 'breakout', 'hh_hl', 'candlestick_pattern', 'inside_bar', 'double_top_bottom', 
         'head_shoulders', 'cup_handle', 'fvg', 'order_block'].includes(s.indicator)
      ));
    }

    // Apply custom thresholds
    const thresholdedSignals = filteredSignals.map(signal => {
      const threshold = preset.thresholds.find(t => t.indicator === signal.indicator);
      if (!threshold) return signal;

      let passes = false;
      
      if (signal.valueNumeric !== undefined) {
        if (threshold.operator === 'gt') passes = signal.valueNumeric > threshold.value;
        else if (threshold.operator === 'lt') passes = signal.valueNumeric < threshold.value;
        else if (threshold.operator === 'gte') passes = signal.valueNumeric >= threshold.value;
        else if (threshold.operator === 'lte') passes = signal.valueNumeric <= threshold.value;
        else if (threshold.operator === 'eq') passes = signal.valueNumeric === threshold.value;
      }

      // Override sentiment if threshold fails/passes
      if (passes) {
        return { ...signal, sentiment: (threshold.bullish ? 'bullish' : 'bearish') as 'bullish' | 'bearish' | 'neutral', comment: `Custom threshold met (${threshold.operator} ${threshold.value})` };
      } else {
        return { ...signal, sentiment: 'neutral' as 'bullish' | 'bearish' | 'neutral', comment: `Custom threshold not met (${threshold.operator} ${threshold.value})` };
      }
    });

    // Recalculate consensus score with custom weights
    let totalWeight = 0;
    let weightedScore = 0;

    (thresholdedSignals as any[]).forEach((signal: any) => {
      const weightConfig = preset.weights.find(w => w.indicator === (signal.indicator || signal.name));
      const weight = weightConfig ? weightConfig.weight : 1; // Default weight 1
      
      totalWeight += weight;
      
      if (signal.sentiment === 'bullish') {
        weightedScore += weight * 100;
      } else if (signal.sentiment === 'bearish') {
        weightedScore += weight * 0;
      } else {
        weightedScore += weight * 50; // Neutral = 50
      }
    });

    const customScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;

    return {
      ...report,
      signals: thresholdedSignals as SignalResult[],
      consensusScore: customScore,
      metadata: {
        ...report.metadata,
        customPresetId: preset.id,
        dataPoints: report.metadata?.dataPoints,
        startDate: report.metadata?.startDate,
        endDate: report.metadata?.endDate
      }
    };
  }

  // --- Default Presets ---

  static async initializeDefaultPresets(): Promise<void> {
    const existing = await this.getPresets();
    if (existing.length > 0) return; // Already initialized

    const defaults: CustomScannerPreset[] = [
      {
        id: 'conservative_long',
        name: 'Conservative Long',
        description: 'High conviction bullish setups only',
        enabledCategories: ['trend', 'volume', 'price_action'],
        thresholds: [
          { indicator: 'rsi', operator: 'gt', value: 50, bullish: true },
          { indicator: 'macd', operator: 'gt', value: 0, bullish: true },
          { indicator: 'volume_spike', operator: 'gte', value: 1.5, bullish: true },
          { indicator: 'adx', operator: 'gte', value: 25, bullish: true }
        ],
        weights: [
          { indicator: 'trend_structure', weight: 3 },
          { indicator: 'volume_confirmation', weight: 2 },
          { indicator: 'rsi', weight: 1 },
          { indicator: 'macd', weight: 1 }
        ]
      },
      {
        id: 'momentum_scalp',
        name: 'Momentum Scalp',
        description: 'Fast entries on momentum spikes',
        enabledCategories: ['momentum', 'volatility'],
        thresholds: [
          { indicator: 'rsi', operator: 'gt', value: 60, bullish: true },
          { indicator: 'roc', operator: 'gt', value: 3, bullish: true },
          { indicator: 'bb_squeeze', operator: 'eq', value: 1, bullish: true } // Squeeze firing
        ],
        weights: [
          { indicator: 'roc', weight: 3 },
          { indicator: 'rsi', weight: 2 },
          { indicator: 'stochastic', weight: 2 }
        ]
      },
      {
        id: 'reversal_hunter',
        name: 'Reversal Hunter',
        description: 'Catch tops and bottoms',
        enabledCategories: ['momentum', 'price_action'],
        thresholds: [
          { indicator: 'rsi', operator: 'lt', value: 30, bullish: true },
          { indicator: 'rsi', operator: 'gt', value: 70, bullish: false },
          { indicator: 'williams_r', operator: 'lt', value: -80, bullish: true },
          { indicator: 'candlestick_pattern', operator: 'eq', value: 1, bullish: true } // Pattern detected
        ],
        weights: [
          { indicator: 'candlestick_pattern', weight: 3 },
          { indicator: 'rsi', weight: 2 },
          { indicator: 'williams_r', weight: 2 }
        ]
      }
    ];

    for (const preset of defaults) {
      await this.savePreset(preset);
    }
  }
}
