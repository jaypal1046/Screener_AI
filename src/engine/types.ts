/**
 * StockLens Type Definitions
 * Comprehensive types for all scanner modules, signals, and features
 */

export type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y';

export type SignalCategory = 
  | 'momentum' 
  | 'trend' 
  | 'volume' 
  | 'volatility' 
  | 'price_action';

export type SignalType = 
  // Momentum
  | 'buy' | 'sell' | 'bullish' | 'bearish' | 'oversold_reversal' | 'overbought_reversal'
  // Trend
  | 'golden_cross' | 'death_cross' | 'trend_up' | 'trend_down' | 'breakout_up' | 'breakdown_down'
  // Volatility
  | 'squeeze_start' | 'squeeze_end' | 'high_volatility' | 'low_volatility'
  // Volume
  | 'accumulation' | 'distribution' | 'volume_spike' | 'obv_uptrend' | 'obv_downtrend'
  // Pattern
  | 'engulfing_bull' | 'engulfing_bear' | 'doji' | 'hammer' | 'shooting_star' 
  | 'inside_bar' | 'double_top' | 'double_bottom' | 'head_shoulders' | 'fvg_bull' | 'fvg_bear'
  | 'order_block_bull' | 'order_block_bear' | 'cup_handle' | 'pin_bar'
  // Neutral
  | 'neutral' | 'wait';

/**
 * Thresholds for determining Bullish/Bearish signals
 */
export interface SignalThresholds {
  bullish: number;
  bearish: number;
  neutral?: number;
}

/**
 * Individual signal result from an indicator
 */
export interface SignalResult {
  name: string;
  category: SignalCategory;
  value: number;
  thresholds: SignalThresholds;
  signal: 'BULL' | 'BEAR' | 'NEUTRAL';
  strength: number; // 0-100
  isBinary?: boolean; // For pattern detection (true/false)
  detected?: boolean; // If binary, was pattern found?
  metadata?: Record<string, any>; // Extra info (e.g., crossover details)
  timestamp: number;
  timeframe: Timeframe;
  // Additional fields for advanced features
  indicator?: string; // Alias for name, used in some modules
  sentiment?: 'bullish' | 'bearish' | 'neutral'; // Derived sentiment
  valueNumeric?: number; // Numeric value for threshold comparison
}

/**
 * Auto-generated trade setup based on signals
 */
export interface SetupCard {
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  entryZone: [number, number]; // [low, high]
  stopLoss: number;
  target1: number;
  target2: number;
  riskRewardRatio: number;
  confidence: number; // 0-100
  reasoning: string[];
  // Additional fields for UI compatibility
  entry?: number; // Alias for entryZone[0], used in some UI components
  target?: number; // Alias for target1, used in some UI components
  riskReward?: number; // Alias for riskRewardRatio, used in some UI components
}

/**
 * Multi-timeframe confluence analysis
 */
export interface MTFConfluence {
  shortTerm: 'BULL' | 'BEAR' | 'NEUTRAL';
  mediumTerm: 'BULL' | 'BEAR' | 'NEUTRAL';
  longTerm: 'BULL' | 'BEAR' | 'NEUTRAL';
  alignment: 'STRONG_BULL' | 'STRONG_BEAR' | 'MIXED' | 'CONFLICT';
}

/**
 * Full scan report for a ticker/timeframe
 */
export interface ScanReport {
  ticker: string;
  timeframe: Timeframe;
  lastUpdated: number;
  currentPrice: number;
  consensusScore: number; // 0-100 overall score
  signals: SignalResult[];
  setupCard: SetupCard | null;
  mtfConfluence?: MTFConfluence; // Populated if multi-timeframe scan
  metadata?: ScanReportMetadata;
}

export interface ScanReportMetadata {
  dataSource?: string;
  indicatorCount?: number;
  dataPoints?: number;
  startDate?: string;
  endDate?: string;
}

export interface OHLCV {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorInput {
  opens: number[];
  highs: number[];
  lows: number[];
  closes: number[];
  volumes: number[];
}

/**
 * User preferences stored in chrome.storage
 */
export interface UserPreferences {
  enabledIndicators: string[]; // List of indicator names to show
  timeframes: Timeframe[]; // Which timeframes to scan
  alertThreshold: number; // Notify if score > X
  theme: 'light' | 'dark' | 'system';
  proFeaturesEnabled: boolean;
}

/**
 * Watchlist item
 */
export interface WatchlistItem {
  ticker: string;
  name: string;
  sector?: string;
  addedAt: number;
  lastScan?: ScanReport;
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  id: string;
  ticker: string;
  condition: 'score_above' | 'score_below' | 'pattern_detected' | 'crossover';
  threshold?: number;
  patternName?: string;
  enabled: boolean;
  triggeredAt?: number;
}

/**
 * Pattern detection result with additional metadata
 */
export interface PatternSignal extends Omit<SignalResult, 'patternType'> {
  patternType: 
    | 'Engulfing' 
    | 'Doji' 
    | 'PinBar' 
    | 'InsideBar'
    | 'HeadAndShoulders'
    | 'InverseHeadAndShoulders'
    | 'CupAndHandle'
    | 'DoubleTop'
    | 'DoubleBottom'
    | 'FairValueGap'
    | 'OrderBlock'
    | 'VCP';
  neckline?: number;
  target?: number;
  breakoutPoint?: number;
  confidence: number;
}

/**
 * Backtest result from WASM engine
 */
export interface BacktestResult {
  totalTrades: number;
  winningTrades: number;
  winRate: number;
  finalEquity: number;
  returnPct: number;
}

// --- Pro Features Types (Paper Trading, History, Custom Scanners) ---

export interface TradeJournalEntry {
  id: string;
  ticker: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  entryDate: number;
  exitDate?: number;
  pnl?: number;
  setupNote: string;
  outcome?: 'WIN' | 'LOSS' | 'BREAKEVEN' | 'OPEN';
  screenshotDataUrl?: string;
}

export interface SignalHistoryEntry {
  id: string;
  ticker: string;
  timeframe: Timeframe;
  timestamp: number;
  consensusScore: number;
  signalType: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  keyIndicators: string[];
  outcome?: 'SUCCESS' | 'FAILED' | 'PENDING';
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  rsiPeriod: number;
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
  atrPeriod: number;
  volumeSpikeMultiplier: number;
  alertThreshold: number;
  enableNotifications: boolean;
  showAdvancedPatterns: boolean;
}

export interface WatchlistItemExtended extends WatchlistItem {
  lastScore?: number;
  lastScanTime?: number;
}

export interface ExtendedBacktestResult extends BacktestResult {
  strategyName: string;
  losses: number;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio?: number;
  equityCurve: number[];
}

// --- Custom Scanner Builder Types ---

export interface CustomScannerPreset {
  id: string;
  name: string;
  description: string;
  enabledCategories: Array<'momentum' | 'trend' | 'volume' | 'volatility' | 'price_action'>;
  thresholds: CustomThreshold[];
  weights: CustomWeight[];
}

export interface CustomThreshold {
  indicator: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
  value: number;
  bullish: boolean;
}

export interface CustomWeight {
  indicator: string;
  weight: number;
}

// Extended ScanReport metadata for custom scanners
export interface ScanReportMetadata {
  dataPoints?: number;
  startDate?: string;
  endDate?: string;
  customPresetId?: string; // For custom scanner presets
}
