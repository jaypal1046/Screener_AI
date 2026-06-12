/**
 * StockLens Multi-Tab Stock Screener Manager
 * Manages multiple stock pages, extracts live data, and creates custom screeners
 */

import { ScanReport, OHLCV, Timeframe, SignalResult, CustomScannerPreset } from '../engine/types';
import { SmartEngine } from '../engine/SmartEngine';

export interface StockPage {
  id: string;
  ticker: string;
  exchange: string;
  url: string;
  tabId?: number; // Chrome tab ID if opened
  lastUpdated: number;
  status: 'loading' | 'ready' | 'error';
  report?: ScanReport;
  ohlcvData?: Record<Timeframe, OHLCV[]>;
}

export interface ScreenerFilter {
  id: string;
  name: string;
  conditions: FilterCondition[];
  enabled: boolean;
}

export interface FilterCondition {
  indicator: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'between' | 'crosses_above' | 'crosses_below';
  value: number | [number, number]; // Single value or range for 'between'
  timeframe: Timeframe;
  category: 'momentum' | 'trend' | 'volume' | 'volatility' | 'price_action';
}

export interface ScreenerResult {
  ticker: string;
  matchScore: number; // 0-100 how well it matches
  matchedConditions: number;
  totalConditions: number;
  failedConditions: FailedCondition[];
  report?: ScanReport;
}

export interface FailedCondition {
  condition: FilterCondition;
  actualValue: number;
  expectedValue: number | [number, number];
}

export class ScreenerManager {
  private stockPages: Map<string, StockPage>;
  private screenerFilters: Map<string, ScreenerFilter>;
  private smartEngine: SmartEngine;
  private onUpdateCallback?: (results: ScreenerResult[]) => void;

  constructor() {
    this.stockPages = new Map();
    this.screenerFilters = new Map();
    this.smartEngine = new SmartEngine();
  }

  /**
   * Add a stock page to monitor
   */
  public addStockPage(page: StockPage): void {
    this.stockPages.set(page.id, page);
    console.log(`[ScreenerManager] Added stock page: ${page.ticker}`);
  }

  /**
   * Remove a stock page
   */
  public removeStockPage(pageId: string): void {
    this.stockPages.delete(pageId);
    console.log(`[ScreenerManager] Removed stock page: ${pageId}`);
  }

  /**
   * Update stock page data from live webpage
   */
  public updateStockPageData(
    pageId: string,
    ohlcvData: Record<Timeframe, OHLCV[]>,
    report: ScanReport
  ): void {
    const page = this.stockPages.get(pageId);
    if (!page) {
      console.warn(`[ScreenerManager] Page ${pageId} not found`);
      return;
    }

    page.ohlcvData = ohlcvData;
    page.report = report;
    page.lastUpdated = Date.now();
    page.status = 'ready';

    // Auto-run screeners if any are active
    if (this.screenerFilters.size > 0) {
      this.runAllScreeners();
    }
  }

  /**
   * Create a new custom screener filter
   */
  public createScreener(name: string, conditions: FilterCondition[]): ScreenerFilter {
    const filter: ScreenerFilter = {
      id: `screener_${Date.now()}`,
      name,
      conditions,
      enabled: true
    };

    this.screenerFilters.set(filter.id, filter);
    console.log(`[ScreenerManager] Created screener: ${name} with ${conditions.length} conditions`);
    
    // Run immediately if we have stock pages
    if (this.stockPages.size > 0) {
      this.runScreener(filter.id);
    }

    return filter;
  }

  /**
   * Update existing screener
   */
  public updateScreener(screenerId: string, updates: Partial<ScreenerFilter>): void {
    const screener = this.screenerFilters.get(screenerId);
    if (!screener) {
      throw new Error(`Screener ${screenerId} not found`);
    }

    Object.assign(screener, updates);
    console.log(`[ScreenerManager] Updated screener: ${screener.name}`);

    if (screener.enabled) {
      this.runScreener(screenerId);
    }
  }

  /**
   * Delete a screener
   */
  public deleteScreener(screenerId: string): void {
    this.screenerFilters.delete(screenerId);
    console.log(`[ScreenerManager] Deleted screener: ${screenerId}`);
  }

  /**
   * Get all screeners
   */
  public getAllScreeners(): ScreenerFilter[] {
    return Array.from(this.screenerFilters.values());
  }

  /**
   * Run a specific screener against all monitored stocks
   */
  public runScreener(screenerId: string): ScreenerResult[] {
    const screener = this.screenerFilters.get(screenerId);
    if (!screener || !screener.enabled) {
      console.warn(`[ScreenerManager] Screener ${screenerId} not found or disabled`);
      return [];
    }

    const results: ScreenerResult[] = [];

    for (const [, page] of this.stockPages) {
      if (!page.report || page.status !== 'ready') {
        continue;
      }

      const result = this.evaluateScreener(page, screener);
      results.push(result);
    }

    // Sort by match score (highest first)
    results.sort((a, b) => b.matchScore - a.matchScore);

    console.log(`[ScreenerManager] Screener "${screener.name}" found ${results.filter(r => r.matchScore === 100).length} perfect matches`);

    // Notify callback
    if (this.onUpdateCallback) {
      this.onUpdateCallback(results);
    }

    return results;
  }

  /**
   * Run all active screeners
   */
  public runAllScreeners(): Map<string, ScreenerResult[]> {
    const allResults = new Map<string, ScreenerResult[]>();

    for (const [id, screener] of this.screenerFilters) {
      if (screener.enabled) {
        const results = this.runScreener(id);
        allResults.set(id, results);
      }
    }

    return allResults;
  }

  /**
   * Evaluate a single stock page against a screener
   */
  private evaluateScreener(page: StockPage, screener: ScreenerFilter): ScreenerResult {
    if (!page.report) {
      return {
        ticker: page.ticker,
        matchScore: 0,
        matchedConditions: 0,
        totalConditions: screener.conditions.length,
        failedConditions: []
      };
    }

    const failedConditions: FailedCondition[] = [];
    let matchedCount = 0;

    for (const condition of screener.conditions) {
      const signal = this.findSignalByIndicator(page.report!, condition.indicator, condition.timeframe);
      
      if (!signal) {
        // Signal not available, count as failed
        failedConditions.push({
          condition,
          actualValue: 0,
          expectedValue: condition.value
        });
        continue;
      }

      const isMatch = this.evaluateCondition(signal, condition);
      
      if (isMatch) {
        matchedCount++;
      } else {
        failedConditions.push({
          condition,
          actualValue: signal.value,
          expectedValue: condition.value
        });
      }
    }

    const matchScore = screener.conditions.length > 0
      ? Math.round((matchedCount / screener.conditions.length) * 100)
      : 0;

    return {
      ticker: page.ticker,
      matchScore,
      matchedConditions: matchedCount,
      totalConditions: screener.conditions.length,
      failedConditions,
      report: page.report
    };
  }

  /**
   * Find a specific signal in the report
   */
  private findSignalByIndicator(
    report: ScanReport,
    indicatorName: string,
    timeframe: Timeframe
  ): SignalResult | undefined {
    // Filter signals by timeframe and indicator name
    return report.signals.find(
      sig => sig.indicator === indicatorName && sig.timeframe === timeframe
    );
  }

  /**
   * Evaluate a single condition against a signal
   */
  private evaluateCondition(signal: SignalResult, condition: FilterCondition): boolean {
    const value = signal.value;

    switch (condition.operator) {
      case 'gt':
        return value > (condition.value as number);
      
      case 'lt':
        return value < (condition.value as number);
      
      case 'gte':
        return value >= (condition.value as number);
      
      case 'lte':
        return value <= (condition.value as number);
      
      case 'eq':
        return Math.abs(value - (condition.value as number)) < 0.001;
      
      case 'between': {
        const [min, max] = condition.value as [number, number];
        return value >= min && value <= max;
      }
      
      case 'crosses_above':
        // Requires previous value - would need historical comparison
        // For now, check if current value just crossed above threshold
        return value > (condition.value as number) && 
               signal.strength > 50; // Heuristic: strong momentum
      
      case 'crosses_below':
        return value < (condition.value as number) && 
               signal.strength > 50;
      
      default:
        return false;
    }
  }

  /**
   * Set callback for when screener results update
   */
  public setOnUpdate(callback: (results: ScreenerResult[]) => void): void {
    this.onUpdateCallback = callback;
  }

  /**
   * Get all monitored stock pages
   */
  public getAllStockPages(): StockPage[] {
    return Array.from(this.stockPages.values());
  }

  /**
   * Get summary statistics
   */
  public getSummary(): {
    totalStocks: number;
    readyStocks: number;
    activeScreeners: number;
    lastUpdated: number | null;
  } {
    const pages = Array.from(this.stockPages.values());
    return {
      totalStocks: pages.length,
      readyStocks: pages.filter(p => p.status === 'ready').length,
      activeScreeners: Array.from(this.screenerFilters.values()).filter(s => s.enabled).length,
      lastUpdated: pages.length > 0 
        ? Math.max(...pages.map(p => p.lastUpdated)) 
        : null
    };
  }

  /**
   * Export screener results to CSV
   */
  public exportToCSV(screenerId: string): string {
    const results = this.runScreener(screenerId);
    const screener = this.screenerFilters.get(screenerId);
    
    if (!screener) {
      throw new Error(`Screener ${screenerId} not found`);
    }

    const headers = [
      'Ticker',
      'Match Score (%)',
      'Matched Conditions',
      'Total Conditions',
      'Current Price',
      ...screener.conditions.map(c => `${c.indicator} (${c.timeframe})`)
    ];

    const rows = results.map(result => {
      const row: string[] = [
        result.ticker,
        result.matchScore.toString(),
        result.matchedConditions.toString(),
        result.totalConditions.toString(),
        result.report?.currentPrice.toString() || 'N/A'
      ];

      // Add indicator values
      for (const condition of screener.conditions) {
        const signal = result.report?.signals.find(
          s => s.indicator === condition.indicator && s.timeframe === condition.timeframe
        );
        row.push(signal ? signal.value.toFixed(2) : 'N/A');
      }

      return row.join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Clear all data
   */
  public clearAll(): void {
    this.stockPages.clear();
    this.screenerFilters.clear();
    console.log('[ScreenerManager] Cleared all data');
  }
}
