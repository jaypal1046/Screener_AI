/**
 * StockLens Background Service Worker
 * Handles data fetching, alerts, and cross-tab communication
 */

import { ScanReport, AlertConfig, WatchlistItem } from '../engine/types';

// Cache for Yahoo Finance data
const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

// Active alerts
let alertConfigs: AlertConfig[] = [];

// Load alerts from storage on startup
chrome.storage.local.get(['alerts'], (result) => {
  if (result.alerts) {
    alertConfigs = result.alerts;
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse).catch(err => {
    console.error('[StockLens] Background error:', err);
    sendResponse({ error: err.message });
  });

  return true; // Keep channel open for async response
});

async function handleMessage(message: any, sender: chrome.runtime.MessageSender): Promise<any> {
  switch (message.type) {
    case 'FETCH_YAHOO_DATA':
      return fetchYahooData(message.ticker, message.interval);
    
    case 'CHECK_ALERTS':
      return checkAlerts(message.report);
    
    case 'SAVE_ALERT':
      return saveAlert(message.alert);
    
    case 'GET_WATCHLIST':
      return getWatchlist();
    
    case 'ADD_TO_WATCHLIST':
      return addToWatchlist(message.item);
    
    default:
      throw new Error(`Unknown message type: ${message.type}`);
  }
}

/**
 * Fetch OHLCV data from Yahoo Finance API
 * Uses Chrome's fetch with no-cors workaround via background script
 */
async function fetchYahooData(ticker: string, interval: string): Promise<any[]> {
  const cacheKey = `${ticker}_${interval}`;
  const cached = dataCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[StockLens] Using cached data for', ticker);
    return cached.data;
  }

  console.log('[StockLens] Fetching data for', ticker, 'interval:', interval);

  try {
    // Yahoo Finance API endpoint
    const period2 = Math.floor(Date.now() / 1000);
    const period1 = period2 - getPeriodSeconds(interval);
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=${interval}&period1=${period1}&period2=${period2}`;
    
    // Use fetch directly - Yahoo allows CORS from extensions in some cases
    // If this fails, we'd need a proxy server
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    
    if (!json.chart?.result?.[0]) {
      throw new Error('No data available');
    }

    const result = json.chart.result[0];
    const quotes = result.indicators.quote[0];
    const timestamps = result.timestamp;

    // Transform to our format
    const data = timestamps.map((t: number, i: number) => ({
      time: t * 1000, // Convert to milliseconds
      open: quotes.open[i],
      high: quotes.high[i],
      low: quotes.low[i],
      close: quotes.close[i],
      volume: quotes.volume[i]
    })).filter((d: any) => d.open !== null && d.close !== null); // Filter out null values

    // Cache the result
    dataCache.set(cacheKey, { data, timestamp: Date.now() });

    return data;

  } catch (error: any) {
    console.error('[StockLens] Fetch error:', error);
    
    // Try fallback: use mock data for demo purposes
    if (error.message.includes('CORS') || error.message.includes('Network')) {
      console.log('[StockLens] Falling back to mock data');
      return generateMockData(ticker);
    }
    
    throw error;
  }
}

/**
 * Get period in seconds based on interval
 */
function getPeriodSeconds(interval: string): number {
  const now = Math.floor(Date.now() / 1000);
  
  switch (interval) {
    case '1d': return 30 * 24 * 60 * 60; // 30 days
    case '1wk': return 52 * 7 * 24 * 60 * 60; // 52 weeks
    case '1mo': return 12 * 30 * 24 * 60 * 60; // 12 months
    default: return 30 * 24 * 60 * 60;
  }
}

/**
 * Generate mock data for demo/testing when API fails
 */
function generateMockData(ticker: string): any[] {
  const data: any[] = [];
  const now = Date.now();
  let price = 100 + Math.random() * 900; // Random starting price
  
  for (let i = 100; i >= 0; i--) {
    const change = (Math.random() - 0.5) * 20;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 10;
    const low = Math.min(open, close) - Math.random() * 10;
    const volume = Math.floor(100000 + Math.random() * 900000);
    
    data.push({
      time: now - (i * 24 * 60 * 60 * 1000),
      open,
      high,
      low,
      close,
      volume
    });
    
    price = close;
  }
  
  return data;
}

/**
 * Check if scan results trigger any alerts
 */
async function checkAlerts(report: ScanReport): Promise<void> {
  const triggeredAlerts: AlertConfig[] = [];
  
  for (const alert of alertConfigs) {
    if (!alert.enabled || alert.ticker !== report.ticker) continue;
    
    let triggered = false;
    
    switch (alert.condition) {
      case 'score_above':
        if (alert.threshold && report.consensusScore > alert.threshold) {
          triggered = true;
        }
        break;
      
      case 'score_below':
        if (alert.threshold && report.consensusScore < alert.threshold) {
          triggered = true;
        }
        break;
      
      case 'pattern_detected':
        if (alert.patternName) {
          const patternFound = report.signals.some(
            (s: any) => s.isBinary && s.detected && s.name === alert.patternName
          );
          if (patternFound) triggered = true;
        }
        break;
    }
    
    if (triggered) {
      triggeredAlerts.push(alert);
      alert.triggeredAt = Date.now();
      
      // Show browser notification
      showNotification(alert, report);
    }
  }
  
  // Save updated alerts
  if (triggeredAlerts.length > 0) {
    chrome.storage.local.set({ alerts: alertConfigs });
  }
}

/**
 * Show browser notification for triggered alert
 */
function showNotification(alert: AlertConfig, report: ScanReport): void {
  const title = `🔔 ${alert.ticker} Alert`;
  const message = `Score: ${report.consensusScore}/100 - ${getSignalDescription(alert.condition)}`;
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title,
    message,
    priority: 2
  }, (notificationId) => {
    console.log('[StockLens] Notification shown:', notificationId);
  });
}

function getSignalDescription(condition: string): string {
  switch (condition) {
    case 'score_above': return 'Bullish signal detected';
    case 'score_below': return 'Bearish signal detected';
    case 'pattern_detected': return 'Pattern breakout';
    default: return 'Alert triggered';
  }
}

/**
 * Save alert configuration
 */
async function saveAlert(alert: AlertConfig): Promise<void> {
  const existingIndex = alertConfigs.findIndex(a => a.id === alert.id);
  
  if (existingIndex >= 0) {
    alertConfigs[existingIndex] = alert;
  } else {
    alertConfigs.push(alert);
  }
  
  await chrome.storage.local.set({ alerts: alertConfigs });
}

/**
 * Get watchlist from storage
 */
async function getWatchlist(): Promise<WatchlistItem[]> {
  const result = await chrome.storage.local.get(['watchlist']);
  return result.watchlist || [];
}

/**
 * Add item to watchlist
 */
async function addToWatchlist(item: WatchlistItem): Promise<void> {
  const watchlist = await getWatchlist();
  
  const existingIndex = watchlist.findIndex(w => w.ticker === item.ticker);
  if (existingIndex >= 0) {
    watchlist[existingIndex] = { ...item, addedAt: watchlist[existingIndex].addedAt };
  } else {
    watchlist.push({ ...item, addedAt: Date.now() });
  }
  
  await chrome.storage.local.set({ watchlist });
}

// Periodic cleanup of old cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of dataCache.entries()) {
    if (now - value.timestamp > CACHE_TTL * 2) {
      dataCache.delete(key);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes

console.log('[StockLens] Background service worker started');
