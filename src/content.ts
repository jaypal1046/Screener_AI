/**
 * StockLens Content Script
 * Main entry point for the extension on supported pages
 * 
 * AUTO-DETECTION FLOW:
 * 1. Runs immediately on page load (document_idle)
 * 2. Checks if current platform is supported
 * 3. Shows overlay with loading state instantly
 * 4. Detects ticker from DOM patterns
 * 5. Fetches data and displays analysis
 * 6. Monitors for navigation/ticker changes
 */

import { TickerDetector } from './detectors/TickerDetector';
import { YahooFinanceService } from './services/YahooFinanceService';
import { SmartEngine } from './engine/SmartEngine';
import { StockLensOverlay } from './ui/overlay';
import { ScanReport, SetupCard, Timeframe, OHLCV, SignalResult, ScanReportMetadata } from './engine/types';

class StockLensContentScript {
  private detector: TickerDetector;
  private dataService: YahooFinanceService;
  private smartEngine: SmartEngine;
  private overlay: StockLensOverlay | null = null;
  private currentTicker: string | null = null;
  private scanInterval: number | null = null;
  private navigationObserver: MutationObserver | null = null;
  private retryCount = 0;
  private readonly MAX_RETRIES = 5;
  private readonly RETRY_DELAY_MS = 1000;

  constructor() {
    this.detector = new TickerDetector();
    this.dataService = new YahooFinanceService();
    this.smartEngine = new SmartEngine();
    
    console.log('[StockLens] Content script initialized');
  }

  public async init() {
    // Check if platform is supported
    if (!this.detector.isSupportedPlatform()) {
      console.log('[StockLens] Not running on supported platform');
      return;
    }

    console.log('[StockLens] Supported platform detected, initializing...');

    // Initialize overlay immediately with loading state
    this.overlay = new StockLensOverlay();
    this.overlay.attach();
    this.overlay.showLoading('Detecting ticker...');

    // Initial scan with retry logic
    await this.scanWithRetry();

    // Set up periodic rescans (every 60 seconds) for price updates
    this.scanInterval = window.setInterval(() => this.scan(), 60000);

    // Listen for URL changes (SPA navigation)
    this.setupNavigationListener();

    // Listen for visibility changes (tab switch back)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.currentTicker) {
        console.log('[StockLens] Tab became visible, refreshing data');
        this.scan();
      }
    });

    console.log('[StockLens] Ready - scanning active');
  }

  /**
   * Scan with retry logic for slow-loading pages
   */
  private async scanWithRetry() {
    const detection = this.detector.detect();
    
    if (!detection) {
      console.log(`[StockLens] Could not detect ticker (attempt ${this.retryCount + 1}/${this.MAX_RETRIES})`);
      
      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        this.overlay?.showLoading(`Detecting ticker... (${this.retryCount}/${this.MAX_RETRIES})`);
        
        // Retry with exponential backoff
        setTimeout(() => this.scanWithRetry(), this.RETRY_DELAY_MS * this.retryCount);
      } else {
        console.warn('[StockLens] Max retries reached, showing manual input option');
        this.overlay?.showError('Could not auto-detect ticker. Please refresh or navigate to a stock page.');
      }
      return;
    }

    // Reset retry count on success
    this.retryCount = 0;
    await this.scan();
  }

  private async scan() {
    const detection = this.detector.detect();
    
    if (!detection) {
      console.log('[StockLens] Could not detect ticker');
      if (this.currentTicker) {
        // Ticker was detected before but now isn't - user might have navigated away
        this.updateOverlay([], null);
      }
      return;
    }

    // Skip if same ticker (no change)
    if (detection.ticker === this.currentTicker) {
      return;
    }

    this.currentTicker = detection.ticker;
    console.log(`[StockLens] Scanning ${detection.ticker} on ${detection.platform} (${detection.exchange})`);

    try {
      // Show loading state with ticker name
      this.overlay?.showLoading(`Analyzing ${detection.ticker}...`);

      // Fetch multi-timeframe data
      const ohlcvData = await this.dataService.fetchMultiTimeframe(
        detection.ticker,
        detection.exchange === 'NSE' ? 'NS' : detection.exchange === 'BSE' ? 'BO' : 'NS'
      );

      // Generate scan reports for each timeframe
      const reports: ScanReport[] = [];
      
      for (const [tf, ohlcv] of Object.entries(ohlcvData) as [Timeframe, OHLCV[]][]) {
        if (ohlcv.length === 0) continue;

        const report = await this.generateScanReport(detection.ticker, tf, ohlcv);
        reports.push(report);
      }

      if (reports.length === 0) {
        throw new Error('No data available for any timeframe');
      }

      // Calculate consensus and setup
      const latestPrice = ohlcvData['1D']?.[ohlcvData['1D'].length - 1]?.close || 0;
      const setupCard = this.smartEngine.generateAutoSetup(reports, latestPrice);

      // Update overlay
      this.updateOverlay(reports, setupCard);

      console.log(`[StockLens] Analysis complete for ${detection.ticker}`);

    } catch (error) {
      console.error('[StockLens] Scan error:', error);
      this.overlay?.showError(`Failed to analyze ${detection.ticker}. Try refreshing.`);
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
        // Reset retry count for new page
        this.retryCount = 0;
        setTimeout(() => this.scanWithRetry(), 1000);
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true
    });

    // Also listen for popstate (browser back/forward)
    window.addEventListener('popstate', () => {
      console.log('[StockLens] Navigation detected, rescanning...');
      this.retryCount = 0;
      setTimeout(() => this.scanWithRetry(), 1000);
    });
  }

  public destroy() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
    if (this.overlay) {
      this.overlay.detach();
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
