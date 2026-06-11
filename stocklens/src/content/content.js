// StockLens Content Script - Ticker Detection & Overlay Injection

import { initOverlay } from '../overlay/overlay.js';
import { detectTickerFromDomain } from '../utils/ticker-detector.js';

class StockLensContentScript {
  constructor() {
    this.currentTicker = null;
    this.overlay = null;
    this.observer = null;
    this.init();
  }

  async init() {
    console.log('[StockLens] Initializing content script...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }
    
    // Small delay to ensure dynamic content loads
    await this.sleep(1000);
    
    // Detect ticker from current page
    this.currentTicker = this.detectTicker();
    
    if (this.currentTicker) {
      console.log('[StockLens] Detected ticker:', this.currentTicker);
      
      // Inject overlay
      this.overlay = initOverlay(this.currentTicker);
      
      // Set up mutation observer for tab changes
      this.setupTabChangeObserver();
      
      // Notify background script
      this.notifyBackground();
    } else {
      console.log('[StockLens] No ticker detected on this page');
    }
  }

  detectTicker() {
    const domain = window.location.hostname;
    return detectTickerFromDomain(domain, document);
  }

  setupTabChangeObserver() {
    // Observe URL changes for SPA navigation
    let lastUrl = location.href;
    
    this.observer = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        this.handleUrlChange();
      }
    });
    
    this.observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: false
    });
  }

  async handleUrlChange() {
    console.log('[StockLens] URL changed, re-detecting ticker...');
    await this.sleep(500);
    
    const newTicker = this.detectTicker();
    
    if (newTicker && newTicker !== this.currentTicker) {
      this.currentTicker = newTicker;
      console.log('[StockLens] New ticker detected:', this.currentTicker);
      
      // Update overlay with new ticker
      if (this.overlay) {
        this.overlay.updateTicker(newTicker);
      }
      
      this.notifyBackground();
    }
  }

  notifyBackground() {
    chrome.runtime.sendMessage({
      type: 'TICKER_DETECTED',
      ticker: this.currentTicker,
      url: window.location.href
    }).catch(err => console.log('[StockLens] Background message failed:', err));
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize when script loads
new StockLensContentScript();
