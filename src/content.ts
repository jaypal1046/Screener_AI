/**
 * StockLens Content Script
 * Main entry point for the extension on supported pages
 */

import { TickerDetector } from './detectors/TickerDetector';
import { YahooFinanceService } from './services/YahooFinanceService';
import { SmartEngine } from './engine/SmartEngine';
import { StockLensOverlay } from './ui/overlay';
import { ScreenerManager, ScreenerUI } from './screener';
import { ScanReport, SetupCard, Timeframe, OHLCV, SignalResult, ScanReportMetadata } from './engine/types';

class StockLensContentScript {
  private detector: TickerDetector;
  private dataService: YahooFinanceService;
  private smartEngine: SmartEngine;
  private overlay: StockLensOverlay | null = null;
  private screenerManager: ScreenerManager | null = null;
  private screenerUI: ScreenerUI | null = null;
  private currentPageId: string | null = null;
  private currentTicker: string | null = null;
  private scanInterval: number | null = null;

  constructor() {
    this.detector = new TickerDetector();
    this.dataService = new YahooFinanceService();
    this.smartEngine = new SmartEngine();
    this.screenerManager = new ScreenerManager();
    this.screenerUI = new ScreenerUI();

    console.log('[StockLens] Content script initialized with Screener');
  }

  public async init() {
    // Check if platform is supported
    if (!this.detector.isSupportedPlatform()) {
      console.log('[StockLens] Not running on supported platform');
      return;
    }

    // Initialize overlay
    this.overlay = new StockLensOverlay();
    this.overlay.attach();

    // Initialize screener UI
    if (this.screenerUI) {
      this.screenerUI.attach();
      this.screenerUI.setOnScreenerAction((action, data) => this.handleScreenerAction(action, data));
    }

    // Initial scan
    await this.scan();

    // Set up periodic rescans (every 60 seconds)
    this.scanInterval = window.setInterval(() => this.scan(), 60000);

    // Listen for URL changes (SPA navigation)
    this.setupNavigationListener();

    console.log('[StockLens] Ready - scanning active with Screener');
  }

  private async scan() {
    const detection = this.detector.detect();
    
    if (!detection) {
      console.log('[StockLens] Could not detect ticker');
      this.updateOverlay([], null);
      return;
    }

    // Skip if same ticker
    if (detection.ticker === this.currentTicker) {
      return;
    }

    this.currentTicker = detection.ticker;
    console.log(`[StockLens] Scanning ${detection.ticker} on ${detection.platform}`);

    try {
      // Fetch multi-timeframe data
      const ohlcvData = await this.dataService.fetchMultiTimeframe(
        detection.ticker,
        detection.exchange === 'NSE' ? 'NS' : 'NS'
      );

      // Generate scan reports for each timeframe
      const reports: ScanReport[] = [];
      
      for (const [tf, ohlcv] of Object.entries(ohlcvData) as [Timeframe, OHLCV[]][]) {
        if (ohlcv.length === 0) continue;

        const report = await this.generateScanReport(detection.ticker, tf, ohlcv);
        reports.push(report);
      }

      // Calculate consensus and setup
      const latestPrice = ohlcvData['1D']?.[ohlcvData['1D'].length - 1]?.close || 0;
      const setupCard = this.smartEngine.generateAutoSetup(reports, latestPrice);

      // Update overlay
      this.updateOverlay(reports, setupCard);

      // Register with screener manager for multi-tab scanning
      this.registerCurrentPage(detection, ohlcvData, reports[0]);

    } catch (error) {
      console.error('[StockLens] Scan error:', error);
      this.updateOverlay([], null);
    }
  }

  private async generateScanReport(
    ticker: string,
    timeframe: Timeframe,
    ohlcv: OHLCV[]
  ): Promise<ScanReport> {
    // In production, this calls the WASM module
    // For now, we'll use placeholder logic
    
    const latestCandle = ohlcv[ohlcv.length - 1];
    
    // Placeholder signals - will be replaced by WASM calls
    const signals: SignalResult[] = [
      {
        name: 'rsi',
        indicator: 'rsi',
        category: 'momentum',
        value: 50,
        thresholds: { bullish: 30, bearish: 70 },
        signal: 'NEUTRAL' as const,
        strength: 50,
        timestamp: Date.now(),
        timeframe,
        sentiment: 'neutral',
        metadata: { description: 'RSI(14) in neutral zone' }
      },
      {
        name: 'macd',
        indicator: 'macd',
        category: 'momentum',
        value: 0.5,
        thresholds: { bullish: 0, bearish: 0 },
        signal: 'BULL' as const,
        strength: 65,
        timestamp: Date.now(),
        timeframe,
        sentiment: 'bullish',
        metadata: { description: 'MACD above signal line' }
      },
      {
        name: 'ma_crossover',
        indicator: 'ma_crossover',
        category: 'trend',
        value: 1,
        thresholds: { bullish: 0.5, bearish: -0.5 },
        signal: 'BULL' as const,
        strength: 80,
        timestamp: Date.now(),
        timeframe,
        sentiment: 'bullish',
        metadata: { description: '50 EMA crossed above 200 EMA' }
      },
      {
        name: 'volume_spike',
        indicator: 'volume_spike',
        category: 'volume',
        value: 1.8,
        thresholds: { bullish: 1.5, bearish: 0.5 },
        signal: 'BULL' as const,
        strength: 70,
        timestamp: Date.now(),
        timeframe,
        sentiment: 'bullish',
        metadata: { description: 'Volume 1.8x average' }
      },
      {
        name: 'bb_squeeze',
        indicator: 'bb_squeeze',
        category: 'volatility',
        value: 0,
        thresholds: { bullish: 0, bearish: 0 },
        signal: 'NEUTRAL' as const,
        strength: 50,
        timestamp: Date.now(),
        timeframe,
        sentiment: 'neutral',
        metadata: { description: 'Bollinger Bands expanding after squeeze' }
      },
      {
        name: 'support_resistance',
        indicator: 'support_resistance',
        category: 'price_action',
        value: latestCandle.close,
        thresholds: { bullish: latestCandle.low * 0.98, bearish: latestCandle.high * 1.02 },
        signal: 'NEUTRAL' as const,
        strength: 50,
        timestamp: Date.now(),
        timeframe,
        sentiment: 'neutral',
        metadata: { 
          description: 'Key levels identified',
          levels: [latestCandle.low * 0.98, latestCandle.high * 1.02]
        }
      }
    ];

    return {
      ticker,
      timeframe,
      lastUpdated: Date.now(),
      currentPrice: latestCandle.close,
      consensusScore: 65,
      signals,
      setupCard: null,
      metadata: {
        dataPoints: ohlcv.length,
        startDate: new Date(ohlcv[0].time).toISOString().split('T')[0],
        endDate: new Date(latestCandle.time).toISOString().split('T')[0]
      }
    };
  }

  private updateOverlay(reports: ScanReport[], setup: SetupCard | null) {
    if (!this.overlay) return;
    this.overlay.update(reports, setup);
  }

  private setupNavigationListener() {
    // Handle SPA navigation (TradingView, Groww, etc.)
    let lastUrl = window.location.href;
    
    const observer = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.log('[StockLens] URL changed, rescanning...');
        setTimeout(() => this.scan(), 1000);
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true
    });

    // Also listen for popstate (browser back/forward)
    window.addEventListener('popstate', () => {
      console.log('[StockLens] Navigation detected, rescanning...');
      setTimeout(() => this.scan(), 1000);
    });
  }

  /**
   * Handle screener UI actions
   */
  private handleScreenerAction(action: string, data?: any) {
    console.log(`[StockLens] Screener action: ${action}`, data);

    switch (action) {
      case 'new_screener':
        this.createDemoScreener();
        break;
      case 'export_csv':
        this.exportScreenerResults();
        break;
      case 'select_stock':
        // Could navigate to the selected stock or highlight it
        console.log(`[StockLens] Selected stock: ${data?.ticker}`);
        break;
    }
  }

  /**
   * Create a demo screener with common conditions
   */
  private createDemoScreener() {
    if (!this.screenerManager) return;

    const conditions: import('./screener').FilterCondition[] = [
      {
        indicator: 'rsi',
        operator: 'lt',
        value: 30,
        timeframe: '1D',
        category: 'momentum'
      },
      {
        indicator: 'volume_spike',
        operator: 'gt',
        value: 1.5,
        timeframe: '1D',
        category: 'volume'
      },
      {
        indicator: 'ma_crossover',
        operator: 'gt',
        value: 0,
        timeframe: '1D',
        category: 'trend'
      }
    ];

    this.screenerManager.createScreener('Momentum Breakout', conditions);
    
    // Show the screener UI
    if (this.screenerUI) {
      this.screenerUI.show();
      
      // Run the screener and update UI
      const results = this.screenerManager.runScreener(
        this.screenerManager.getAllScreeners()[0]?.id || ''
      );
      const screeners = this.screenerManager.getAllScreeners();
      this.screenerUI.updateResults(results, screeners);
    }
  }

  /**
   * Export screener results to CSV
   */
  private exportScreenerResults() {
    if (!this.screenerManager) return;

    const screeners = this.screenerManager.getAllScreeners();
    if (screeners.length === 0) {
      alert('No screeners available to export');
      return;
    }

    const csvContent = this.screenerManager.exportToCSV(screeners[0].id);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stocklens_screener_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Register current page with screener manager
   */
  private registerCurrentPage(detection: any, ohlcvData: Record<Timeframe, OHLCV[]>, report: ScanReport) {
    if (!this.screenerManager) return;

    const pageId = `${detection.ticker}_${Date.now()}`;
    this.currentPageId = pageId;

    const stockPage: import('./screener').StockPage = {
      id: pageId,
      ticker: detection.ticker,
      exchange: detection.exchange,
      url: window.location.href,
      lastUpdated: Date.now(),
      status: 'ready',
      report,
      ohlcvData
    };

    this.screenerManager.addStockPage(stockPage);
    this.screenerManager.updateStockPageData(pageId, ohlcvData, report);

    // Update screener UI if visible
    if (this.screenerUI && this.screenerManager.getAllScreeners().length > 0) {
      const results = this.screenerManager.runAllScreeners();
      const allResults: import('./screener').ScreenerResult[] = [];
      results.forEach(r => allResults.push(...r));
      const screeners = this.screenerManager.getAllScreeners();
      this.screenerUI.updateResults(allResults, screeners);
    }
  }

  public destroy() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
    if (this.overlay) {
      this.overlay.detach();
    }
    if (this.screenerUI) {
      this.screenerUI.detach();
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new StockLensContentScript();
    app.init();
  });
} else {
  const app = new StockLensContentScript();
  app.init();
}
