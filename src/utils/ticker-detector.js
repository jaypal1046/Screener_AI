// Ticker Detection Utilities for Different Platforms

export function detectTickerFromDomain(domain, doc) {
  const detectors = {
    'www.tradingview.com': detectTradingView,
    'groww.in': detectGroww,
    'zerodha.com': detectZerodha,
    'www.nseindia.com': detectNSE,
    'in.finance.yahoo.com': detectYahooFinance,
    'finance.yahoo.com': detectYahooFinance
  };

  const detector = detectors[domain];
  if (detector) {
    return detector(doc);
  }

  // Fallback: try to find any stock symbol pattern
  return detectGenericTicker(doc);
}

function detectTradingView(doc) {
  // TradingView stores ticker in multiple places
  const selectors = [
    '[data-symbol]',
    '.tv-symbol-picker__title',
    '#header-toolbar-symbol-search',
    '[aria-label="Symbol"]'
  ];

  for (const selector of selectors) {
    const el = doc.querySelector(selector);
    if (el) {
      const text = el.getAttribute('data-symbol') || el.textContent || el.value;
      if (text) {
        return cleanTicker(text);
      }
    }
  }

  // Check URL pattern: tradingview.com/chart/?symbol=NSE:RELIANCE
  const urlParams = new URLSearchParams(window.location.search);
  const symbol = urlParams.get('symbol');
  if (symbol) {
    // Remove exchange prefix (NSE:, BSE:, etc.)
    return cleanTicker(symbol.split(':').pop());
  }

  return null;
}

function detectGroww(doc) {
  // Groww URLs are typically: groww.in/stocks/RELIANCE
  const pathParts = window.location.pathname.split('/');
  if (pathParts.includes('stocks') && pathParts.length > 2) {
    const tickerIndex = pathParts.indexOf('stocks') + 1;
    if (pathParts[tickerIndex]) {
      return cleanTicker(pathParts[tickerIndex]);
    }
  }

  // Look for title or heading
  const titleEl = doc.querySelector('h1, .stock-name, [data-testid="stock-name"]');
  if (titleEl) {
    const text = titleEl.textContent;
    // Extract ticker from text like "Reliance Industries Ltd. (RELIANCE)"
    const match = text.match(/\(([A-Z\-\.0-9]+)\)/);
    if (match) {
      return match[1];
    }
  }

  return null;
}

function detectZerodha(doc) {
  // Zerodha Kite URLs: kite.zerodha.com/market/quote/quotes/RELIANCE
  const pathParts = window.location.pathname.split('/');
  if (pathParts.includes('quote') || pathParts.includes('orders')) {
    const quoteIndex = pathParts.lastIndexOf('quotes') + 1;
    if (quoteIndex > 0 && pathParts[quoteIndex]) {
      return cleanTicker(pathParts[quoteIndex]);
    }
  }

  // Look for instrument name
  const titleEl = doc.querySelector('.instrument-name, h2, .stock-symbol');
  if (titleEl) {
    const text = titleEl.textContent;
    const match = text.match(/([A-Z\-\.0-9]+)/);
    if (match) {
      return cleanTicker(match[1]);
    }
  }

  return null;
}

function detectNSE(doc) {
  // NSE India URLs: nseindia.com/get-quote/equity?symbol=RELIANCE
  const urlParams = new URLSearchParams(window.location.search);
  const symbol = urlParams.get('symbol');
  if (symbol) {
    return cleanTicker(symbol);
  }

  // Look for quote page elements
  const titleEl = doc.querySelector('h1, .stock-header, .company-name');
  if (titleEl) {
    const text = titleEl.textContent;
    // NSE often shows "RELIANCE - Equity Watch"
    const match = text.match(/^([A-Z\-\.0-9]+)/);
    if (match) {
      return cleanTicker(match[1]);
    }
  }

  return null;
}

function detectYahooFinance(doc) {
  // Yahoo Finance URLs: finance.yahoo.com/quote/RELIANCE.NS
  const pathParts = window.location.pathname.split('/');
  if (pathParts.includes('quote') && pathParts.length > 2) {
    const tickerIndex = pathParts.indexOf('quote') + 1;
    if (pathParts[tickerIndex]) {
      // Remove exchange suffix (.NS, .BO, etc.)
      let ticker = pathParts[tickerIndex].split('.')[0];
      return cleanTicker(ticker);
    }
  }

  // Look for header element
  const titleEl = doc.querySelector('h1, .quote-header-title, [data-testid="qsp-stock-name"]');
  if (titleEl) {
    const text = titleEl.textContent;
    const match = text.match(/([A-Z\-\.0-9]+)(\.NS|\.BO)?/);
    if (match) {
      return cleanTicker(match[1]);
    }
  }

  return null;
}

function detectGenericTicker(doc) {
  // Generic fallback patterns
  const patterns = [
    /\b([A-Z]{2,6})\b/,  // 2-6 uppercase letters
    /\b([A-Z]{2,4}\.[A-Z]{2})\b/,  // With exchange suffix
  ];

  const title = doc.title || '';
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return cleanTicker(match[1]);
    }
  }

  return null;
}

function cleanTicker(raw) {
  if (!raw) return null;
  
  // Remove common prefixes/suffixes and clean up
  let cleaned = raw
    .trim()
    .toUpperCase()
    .replace(/^[NSEBSE]:/i, '')  // Remove exchange prefix
    .replace(/\.(NS|BO|NSI)$/i, '')  // Remove Yahoo exchange suffix
    .replace(/[^A-Z0-9\-\.]/g, '');  // Remove special chars except - and .

  // Validate: should be 2-10 chars, mostly letters
  if (cleaned.length >= 2 && cleaned.length <= 10 && /[A-Z]/.test(cleaned)) {
    return cleaned;
  }

  return null;
}
