/**
 * StockLens Content Script
 * Injected into supported pages to detect tickers and show analysis overlay
 * 
 * AUTO-DETECTION FLOW:
 * 1. Runs immediately on page load (document_idle)
 * 2. Checks if current platform is supported
 * 3. Shows overlay with loading state instantly
 * 4. Detects ticker from DOM patterns
 * 5. Fetches data and displays analysis
 * 6. Monitors for navigation/ticker changes
 */

import { StockLensOverlay } from '../ui/overlay';
import { runScanner, initializeEngine, analyzeMTFConfluence } from '../engine/analysis_engine';
import { Timeframe, ScanReport } from '../engine/types';
import { TickerDetector } from '../detectors/TickerDetector';

class StockLensContentScript {
  private overlay: StockLensOverlay | null = null;
  private detector: TickerDetector;
  private currentTicker: string | null = null;
  private currentTimeframe: Timeframe = '1D';
  private scanInterval: number | null = null;
  private initialized = false;
  private retryCount = 0;
  private readonly MAX_RETRIES = 5;
  private readonly RETRY_DELAY_MS = 1000;

  constructor() {
    this.detector = new TickerDetector();
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

    // Create overlay immediately with loading state
    this.overlay = new StockLensOverlay();
    this.overlay.attach();
    this.overlay.showLoading('Detecting ticker...');

    // Listen for timeframe changes from overlay
    window.addEventListener('stocklens-timeframe-change', (e: any) => {
      this.currentTimeframe = e.detail.timeframe as Timeframe;
      if (this.currentTicker) {
        this.scanTicker(this.currentTicker);
      }
    });

    // Start monitoring for ticker changes with retry logic
    this.startTickerMonitoring();
    
    // Listen for visibility changes (tab switch back)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.currentTicker) {
        console.log('[StockLens] Tab became visible, refreshing data');
        this.scanTicker(this.currentTicker);
      }
    });
  }

  private startTickerMonitoring(): void {
    const checkTicker = () => {
      const detectedTicker = this.detectTicker();
      
      if (detectedTicker && detectedTicker !== this.currentTicker) {
        console.log('[StockLens] Ticker detected:', detectedTicker);
        this.currentTicker = detectedTicker;
        this.retryCount = 0; // Reset on successful detection
        this.scanTicker(detectedTicker);
      } else if (!detectedTicker && this.currentTicker) {
        console.log('[StockLens] Ticker no longer visible');
        this.currentTicker = null;
        this.overlay?.showError('No ticker detected');
      } else if (!detectedTicker && !this.currentTicker) {
        // Retry detection for slow-loading pages
        this.handleFailedDetection();
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
        console.log('[StockLens] URL changed, resetting detection');
        this.retryCount = 0;
        setTimeout(checkTicker, 500); // Small delay for SPA rendering
      }
    });

    urlObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', () => {
      console.log('[StockLens] Navigation detected, resetting');
      this.retryCount = 0;
      setTimeout(checkTicker, 500);
    });
  }
  
  private handleFailedDetection(): void {
    if (this.retryCount < this.MAX_RETRIES) {
      this.retryCount++;
      this.overlay?.showLoading(`Detecting ticker... (${this.retryCount}/${this.MAX_RETRIES})`);
      console.log(`[StockLens] Retry ${this.retryCount}/${this.MAX_RETRIES}`);
    } else {
      console.warn('[StockLens] Max retries reached');
      this.overlay?.showError('Could not auto-detect ticker. Please refresh or navigate to a stock page.');
    }
  }

  private detectTicker(): string | null {
    const detection = this.detector.detect();
    return detection ? detection.ticker : null;
  }

  private async scanTicker(ticker: string): Promise<void> {
    if (!this.overlay) return;

    this.overlay.showLoading(`Analyzing ${ticker}...`);

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

      // Check for alerts
      this.checkAlerts(report);
      
      console.log(`[StockLens] Analysis complete for ${ticker}`);

    } catch (error) {
      console.error('[StockLens] Scan error:', error);
      this.overlay.showError(`Failed to analyze ${ticker}. Try refreshing.`);
    }
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
