/**
 * StockLens Content Script
 * Injected into supported pages to detect tickers and show analysis overlay
 */

import { StockLensOverlay } from '../ui/overlay';
import { runScanner, initializeEngine, analyzeMTFConfluence } from '../engine/analysis_engine';
import { Timeframe, ScanReport } from '../engine/types';

// Supported sites and their ticker detection patterns
const SITE_DETECTORS: Record<string, (doc: Document) => string | null> = {
  'in.tradingview.com': (doc) => {
    // TradingView: Look for symbol in header or URL
    const urlMatch = window.location.pathname.match(/\/charts\/([A-Z0-9.:]+)/i);
    if (urlMatch) return urlMatch[1].split(':')[0];
    
    const titleEl = doc.querySelector('h1[data-symbol-title]');
    if (titleEl) return titleEl.getAttribute('data-symbol-title');
    
    return null;
  },
  
  'groww.in': (doc) => {
    // Groww: Look for stock name/symbol in header
    const h1 = doc.querySelector('h1');
    if (h1) {
      const text = h1.textContent?.trim() || '';
      const match = text.match(/([A-Z]+)/);
      if (match) return match[1];
    }
    return null;
  },
  
  'zerodha.com': (doc) => {
    // Zerodha Kite: Look for instrument in header
    const h1 = doc.querySelector('.instrument-name');
    if (h1) {
      const text = h1.textContent?.trim() || '';
      const match = text.match(/([A-Z]+)/);
      if (match) return match[1];
    }
    return null;
  },
  
  'nseindia.com': (doc) => {
    // NSE India: Look for quote symbol
    const h1 = doc.querySelector('h1');
    if (h1) {
      const text = h1.textContent?.trim() || '';
      const match = text.match(/([A-Z]+)/);
      if (match) return match[1];
    }
    return null;
  },
  
  'finance.yahoo.com': (doc) => {
    // Yahoo Finance: Symbol is usually in URL or h1
    const urlMatch = window.location.pathname.match(/\/quote\/([A-Z0-9.-]+)/i);
    if (urlMatch) return urlMatch[1];
    
    const h1 = doc.querySelector('h1');
    if (h1) {
      const text = h1.textContent?.trim() || '';
      const match = text.match(/([A-Z0-9.-]+)/);
      if (match) return match[1];
    }
    return null;
  }
};

class StockLensContentScript {
  private overlay: StockLensOverlay | null = null;
  private currentTicker: string | null = null;
  private currentTimeframe: Timeframe = '1D';
  private scanInterval: number | null = null;
  private initialized = false;

  constructor() {
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

    // Listen for timeframe changes from overlay
    window.addEventListener('stocklens-timeframe-change', (e: any) => {
      this.currentTimeframe = e.detail.timeframe as Timeframe;
      if (this.currentTicker) {
        this.scanTicker(this.currentTicker);
      }
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
    const hostname = window.location.hostname;
    
    // Find matching detector
    for (const [domain, detector] of Object.entries(SITE_DETECTORS)) {
      if (hostname.includes(domain)) {
        return detector(document);
      }
    }

    return null;
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

      // Check for alerts
      this.checkAlerts(report);

    } catch (error) {
      console.error('[StockLens] Scan error:', error);
      this.overlay.showError('Failed to analyze. Try refreshing.');
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
