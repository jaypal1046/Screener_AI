/**
 * Ticker Detector Module
 * Pattern-matches DOM elements across supported platforms to extract stock symbols
 */

export interface TickerDetectionResult {
  ticker: string;
  exchange: string;
  confidence: number;
  platform: string;
}

export class TickerDetector {
  private static readonly PLATFORM_PATTERNS = {
    tradingview: {
      urlPattern: /tradingview\.com/,
      selectors: [
        '.symbol-title',
        '#header-toolbar-symbol .tv-symbol-field',
        '[data-symbol]'
      ],
      cleanFn: (text: string) => text.replace(/[^A-Z0-9\-]/g, '').toUpperCase()
    },
    groww: {
      urlPattern: /groww\.io/,
      selectors: [
        'h1.stock-name',
        '.stock-detail-header h1',
        '[data-testid="stock-name"]'
      ],
      cleanFn: (text: string) => {
        const match = text.match(/([A-Z]+)/);
        return match ? match[1] : '';
      }
    },
    zerodha: {
      urlPattern: /kite\.zerodha\.com/,
      selectors: [
        '.instrument-name',
        '#quotes .name',
        '.quote-wrapper .symbol'
      ],
      cleanFn: (text: string) => {
        const parts = text.split(' ');
        return parts[0].replace(/[^A-Z0-9]/g, '').toUpperCase();
      }
    },
    nse: {
      urlPattern: /nseindia\.com/,
      selectors: [
        '.symbol-info',
        '#details-section h2',
        '.stock-header .symbol'
      ],
      cleanFn: (text: string) => text.replace(/[^A-Z0-9]/g, '').toUpperCase()
    },
    yahoo: {
      urlPattern: /finance\.yahoo\.com/,
      selectors: [
        'h1[data-testid="quoteHeader"]',
        '.quote-header-info',
        '[data-symbol]'
      ],
      cleanFn: (text: string) => {
        const match = text.match(/([A-Z\-]+)/);
        return match ? match[1] : '';
      }
    }
  };

  public detect(): TickerDetectionResult | null {
    const url = window.location.href;
    
    // Detect platform
    let platform = '';
    for (const [name, config] of Object.entries(TickerDetector.PLATFORM_PATTERNS)) {
      if (config.urlPattern.test(url)) {
        platform = name;
        break;
      }
    }

    if (!platform) {
      console.log('[StockLens] Unsupported platform');
      return null;
    }

    const config = TickerDetector.PLATFORM_PATTERNS[platform as keyof typeof TickerDetector.PLATFORM_PATTERNS];
    
    // Try each selector
    for (const selector of config.selectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          const text = element.textContent?.trim() || '';
          const cleaned = config.cleanFn(text);
          
          if (cleaned && cleaned.length >= 2) {
            return {
              ticker: cleaned,
              exchange: this.inferExchange(cleaned),
              confidence: 0.9,
              platform
            };
          }
        }
      } catch (e) {
        continue;
      }
    }

    // Fallback: try to extract from URL
    const urlTicker = this.extractFromURL(url);
    if (urlTicker) {
      return {
        ticker: urlTicker,
        exchange: this.inferExchange(urlTicker),
        confidence: 0.7,
        platform
      };
    }

    return null;
  }

  private extractFromURL(url: string): string | null {
    // TradingView: /charts/NSE:RELIANCE
    const tvMatch = url.match(/\/(?:NSE|BSE):([A-Z\-]+)/i);
    if (tvMatch) return tvMatch[1].toUpperCase();

    // Yahoo: /quote/RELIANCE.NS
    const yahooMatch = url.match(/\/quote\/([A-Z\-]+)\./i);
    if (yahooMatch) return yahooMatch[1].toUpperCase();

    // Groww/Zerodha: /stocks/RELIANCE
    const stockMatch = url.match(/\/stocks\/([A-Z\-]+)/i);
    if (stockMatch) return stockMatch[1].toUpperCase();

    return null;
  }

  private inferExchange(ticker: string): string {
    // Common Indian stock patterns
    if (['NIFTY', 'BANKNIFTY', 'FINNIFTY'].includes(ticker)) {
      return 'NSE';
    }
    
    // Tech stocks often end in specific patterns
    if (['INFY', 'TCS', 'WIPRO', 'HCLTECH'].includes(ticker)) {
      return 'NSE';
    }
    
    // Default to NSE for Indian context
    return 'NSE';
  }

  public isSupportedPlatform(): boolean {
    const url = window.location.href;
    return Object.values(TickerDetector.PLATFORM_PATTERNS).some(
      config => config.urlPattern.test(url)
    );
  }
}
