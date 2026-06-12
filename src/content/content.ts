/**
 * StockLens Content Script
 * Injected into supported pages to detect tickers and show analysis overlay
 * Now includes Multi-Tab Screener functionality
 */

import { StockLensOverlay } from '../ui/overlay';
import { runScanner, initializeEngine, analyzeMTFConfluence } from '../engine/analysis_engine';
import { Timeframe, ScanReport } from '../engine/types';
import { TickerDetector } from '../detectors/TickerDetector';
import { ScreenerManager, ScreenerUI, ScreenerBuilderUI, ScreenerBuilderConfig } from '../screener';

class StockLensContentScript {
  private overlay: StockLensOverlay | null = null;
  private detector: TickerDetector;
  private screenerManager: ScreenerManager;
  private screenerUI: ScreenerUI;
  private screenerBuilder: ScreenerBuilderUI;
  private currentTicker: string | null = null;
  private currentTimeframe: Timeframe = '1D';
  private scanInterval: number | null = null;
  private initialized = false;
  private pageId: string;

  constructor() {
    this.detector = new TickerDetector();
    this.pageId = `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.screenerManager = new ScreenerManager();
    this.screenerUI = new ScreenerUI();
    this.screenerBuilder = new ScreenerBuilderUI();
    this.init();
  }

  private async init(): Promise<void> {
    console.log('[StockLens] Content script starting...');

    // Initialize WASM engine
    try {
      await initializeEngine();
      this.initialized = true;
      console.log('[StockLens] Engine initialized');
    } catch (error) {
      console.error('[StockLens] Failed to initialize engine:', error);
      return;
    }

    // Create overlay
    this.overlay = new StockLensOverlay();
    this.overlay.attach();

    // Setup screener UI
    this.screenerUI.attach();
    this.screenerBuilder.attach();
    this.setupScreenerCallbacks();

    // Listen for timeframe changes from overlay
    window.addEventListener('stocklens-timeframe-change', (e: any) => {
      this.currentTimeframe = e.detail.timeframe as Timeframe;
      if (this.currentTicker) {
        this.scanTicker(this.currentTicker);
      }
    });

    // Listen for screener toggle from keyboard shortcut or message
    window.addEventListener('stocklens-toggle-screener', () => {
      this.screenerUI.toggle();
    });

    // Start monitoring for ticker changes
    this.startTickerMonitoring();
  }

  private startTickerMonitoring(): void {
    const checkTicker = () => {
      const detectedTicker = this.detectTicker();
      
      if (detectedTicker && detectedTicker !== this.currentTicker) {
        console.log('[StockLens] Ticker detected:', detectedTicker);
        this.currentTicker = detectedTicker;
        this.scanTicker(detectedTicker);
      } else if (!detectedTicker && this.currentTicker) {
        console.log('[StockLens] Ticker no longer visible');
        this.currentTicker = null;
        this.overlay?.showError('No ticker detected');
      }
    };

    // Check immediately
    checkTicker();

    // Then check every 2 seconds for page navigation
    this.scanInterval = window.setInterval(checkTicker, 2000);

    // Also listen for URL changes (SPA navigation)
    let lastUrl = window.location.href;
    const urlObserver = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        setTimeout(checkTicker, 500); // Small delay for SPA rendering
      }
    });

    urlObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private detectTicker(): string | null {
    const detection = this.detector.detect();
    return detection ? detection.ticker : null;
  }

  private async scanTicker(ticker: string): Promise<void> {
    if (!this.overlay) return;

    this.overlay.showLoading();

    try {
      // Fetch OHLCV data from Yahoo Finance
      const ohlcv = await this.fetchYahooData(ticker, this.currentTimeframe);
      
      if (!ohlcv || ohlcv.length < 50) {
        throw new Error('Insufficient data');
      }

      // Run scanner
      const report = await runScanner(ticker, this.currentTimeframe, ohlcv);

      // Extract arrays for advanced pattern detection
      const highs = ohlcv.map(d => d.high);
      const lows = ohlcv.map(d => d.low);
      const closes = ohlcv.map(d => d.close);
      const volumes = ohlcv.map(d => d.volume);

      // Run advanced pattern detection (H&S, Cup&Handle, VCP)
      const { detectAdvancedPatterns } = await import('../engine/analysis_engine');
      const patterns = detectAdvancedPatterns(highs, lows, closes, volumes);
      
      // Merge patterns with main signals
      const allSignals = [...report.signals, ...patterns];

      // For multi-timeframe confluence, we'd fetch other timeframes too
      // (simplified here for demo)
      
      // Update overlay with reports array and setup card
      this.overlay.updateScanResults([report], report.setupCard || null);

      // Register this stock page with screener manager
      const ohlcvRecord: Record<Timeframe, any[]> = {
        '1D': [], '1W': [], '1M': [], '3M': [], '1Y': []
      };
      ohlcvRecord[this.currentTimeframe] = ohlcv;
      this.registerStockPage(ticker, report, ohlcvRecord);

      // Check for alerts
      this.checkAlerts(report);

    } catch (error) {
      console.error('[StockLens] Scan error:', error);
      this.overlay.showError('Failed to analyze. Try refreshing.');
    }
  }

  /**
   * Register current stock page with screener manager
   */
  private registerStockPage(
    ticker: string,
    report: ScanReport,
    ohlcvData: Record<Timeframe, any[]>
  ): void {
    const exchange = this.detectExchange();
    
    // Create complete OHLCV data record with all timeframes
    const completeOhlcv: Record<Timeframe, any[]> = {
      '1D': this.currentTimeframe === '1D' ? ohlcvData['1D'] || [] : [],
      '1W': this.currentTimeframe === '1W' ? ohlcvData['1W'] || [] : [],
      '1M': this.currentTimeframe === '1M' ? ohlcvData['1M'] || [] : [],
      '3M': this.currentTimeframe === '3M' ? ohlcvData['3M'] || [] : [],
      '1Y': this.currentTimeframe === '1Y' ? ohlcvData['1Y'] || [] : []
    };
    
    // Set the current timeframe data
    completeOhlcv[this.currentTimeframe] = ohlcvData[this.currentTimeframe] || [];
    
    this.screenerManager.addStockPage({
      id: this.pageId,
      ticker,
      exchange,
      url: window.location.href,
      lastUpdated: Date.now(),
      status: 'ready',
      report,
      ohlcvData: completeOhlcv
    });

    // Update screener UI with latest results
    const screeners = this.screenerManager.getAllScreeners();
    if (screeners.length > 0) {
      const allResults = this.screenerManager.runAllScreeners();
      const flatResults = Array.from(allResults.values()).flat();
      this.screenerUI.updateResults(flatResults, screeners);
    }
  }

  /**
   * Detect exchange from URL
   */
  private detectExchange(): string {
    const url = window.location.href;
    if (url.includes('tradingview.com')) return 'TradingView';
    if (url.includes('groww')) return 'Groww';
    if (url.includes('zerodha') || url.includes('kite')) return 'Zerodha';
    if (url.includes('nseindia')) return 'NSE';
    if (url.includes('yahoo')) return 'Yahoo';
    return 'Unknown';
  }

  /**
   * Setup callbacks for screener UI actions
   */
  private setupScreenerCallbacks(): void {
    // Handle screener builder save
    this.screenerBuilder.setOnSave((config: ScreenerBuilderConfig) => {
      const screener = this.screenerManager.createScreener(config.name, config.conditions);
      
      // Run screener and update UI
      const results = this.screenerManager.runScreener(screener.id);
      const screeners = this.screenerManager.getAllScreeners();
      this.screenerUI.updateResults(results, screeners);
      
      // Show the results panel
      this.screenerUI.show();
    });

    // Handle screener UI actions
    this.screenerUI.setOnScreenerAction((action: string, data?: any) => {
      switch (action) {
        case 'new_screener':
          this.screenerBuilder.show();
          break;
        
        case 'export_csv': {
          const screeners = this.screenerManager.getAllScreeners();
          if (screeners.length > 0) {
            const csv = this.screenerManager.exportToCSV(screeners[0].id);
            this.downloadCSV(csv, `${screeners[0].name}_results.csv`);
          }
          break;
        }
        
        case 'select_stock':
          if (data?.ticker) {
            console.log('[StockLens] User wants to view:', data.ticker);
            // Could navigate to that stock or highlight it
          }
          break;
      }
    });
  }

  /**
   * Download CSV file
   */
  private downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private async fetchYahooData(
    ticker: string, 
    timeframe: Timeframe
  ): Promise<{ time: number; open: number; high: number; low: number; close: number; volume: number }[]> {
    // Map timeframe to Yahoo interval
    const intervalMap: Record<Timeframe, string> = {
      '1D': '1d',
      '1W': '1wk',
      '1M': '1mo',
      '3M': '1mo',
      '1Y': '1mo'
    };

    const interval = intervalMap[timeframe];
    
    // Use Yahoo Finance API via background script to avoid CORS
    const response = await chrome.runtime.sendMessage({
      type: 'FETCH_YAHOO_DATA',
      ticker,
      interval
    });

    if (response.error) {
      throw new Error(response.error);
    }

    return response.data;
  }

  private checkAlerts(report: ScanReport): void {
    // Send alert check to background script
    chrome.runtime.sendMessage({
      type: 'CHECK_ALERTS',
      report
    });
  }

  public destroy(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
    this.overlay?.destroy();
  }
}

// Start content script when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new StockLensContentScript();
  });
} else {
  new StockLensContentScript();
}
