/**
 * StockLens Background Service Worker
 * Handles cross-origin fetch requests and extension messaging
 */

import { YahooFinanceService } from './services/YahooFinanceService';

const dataService = new YahooFinanceService();

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse).catch(console.error);
  return true; // Keep channel open for async response
});

async function handleMessage(message: any, sender: chrome.runtime.MessageSender) {
  switch (message.type) {
    case 'FETCH_OHLCV':
      return await dataService.fetchOHLCV(
        message.ticker,
        message.timeframe,
        message.exchange
      );
    
    case 'FETCH_MULTI_TF':
      return await dataService.fetchMultiTimeframe(
        message.ticker,
        message.exchange
      );
    
    case 'CHECK_PLATFORM':
      return { supported: true };
    
    default:
      console.warn('[StockLens] Unknown message type:', message.type);
      return { error: 'Unknown message type' };
  }
}

// Set up periodic alarm for background scanning (Pro feature)
chrome.alarms.create('stocklens-scan', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'stocklens-scan') {
    // Could trigger watchlist scanning here for Pro users
    console.log('[StockLens] Background scan tick');
  }
});

// Notification handling for alerts (Pro feature)
chrome.notifications.onClicked.addListener((notificationId) => {
  console.log('[StockLens] Notification clicked:', notificationId);
  chrome.notifications.clear(notificationId);
});

console.log('[StockLens] Background service worker initialized');
