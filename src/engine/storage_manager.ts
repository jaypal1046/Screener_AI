/**
 * StorageManager
 * Handles persistence for Paper Trade Journal, Signal History, and User Settings.
 * Uses Chrome Storage Local API.
 */

import { TradeJournalEntry, SignalHistoryEntry, UserSettings, WatchlistItem } from './types';

export class StorageManager {
  private static readonly KEYS = {
    SETTINGS: 'stocklens_settings',
    JOURNAL: 'stocklens_journal',
    HISTORY: 'stocklens_history',
    WATCHLIST: 'stocklens_watchlist',
  };

  // --- Settings Management ---

  static async getSettings(): Promise<UserSettings> {
    const result = await chrome.storage.local.get(this.KEYS.SETTINGS);
    return result[this.KEYS.SETTINGS] || this.getDefaultSettings();
  }

  static async saveSettings(settings: Partial<UserSettings>): Promise<void> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    await chrome.storage.local.set({ [this.KEYS.SETTINGS]: updated });
  }

  private static getDefaultSettings(): UserSettings {
    return {
      theme: 'dark',
      rsiPeriod: 14,
      macdFast: 12,
      macdSlow: 26,
      macdSignal: 9,
      atrPeriod: 14,
      volumeSpikeMultiplier: 2.0,
      alertThreshold: 70, // Consensus score trigger
      enableNotifications: true,
      showAdvancedPatterns: true,
    };
  }

  // --- Paper Trade Journal ---

  static async addTradeEntry(entry: TradeJournalEntry): Promise<void> {
    const journal = await this.getJournal();
    journal.unshift(entry); // Add to top
    // Keep last 100 entries to prevent storage bloat
    if (journal.length > 100) journal.pop();
    await chrome.storage.local.set({ [this.KEYS.JOURNAL]: journal });
  }

  static async getJournal(): Promise<TradeJournalEntry[]> {
    const result = await chrome.storage.local.get(this.KEYS.JOURNAL);
    return result[this.KEYS.JOURNAL] || [];
  }

  static async updateTradeEntry(id: string, updates: Partial<TradeJournalEntry>): Promise<void> {
    const journal = await this.getJournal();
    const index = journal.findIndex((t) => t.id === id);
    if (index !== -1) {
      journal[index] = { ...journal[index], ...updates };
      await chrome.storage.local.set({ [this.KEYS.JOURNAL]: journal });
    }
  }

  static async deleteTradeEntry(id: string): Promise<void> {
    const journal = await this.getJournal();
    const filtered = journal.filter((t) => t.id !== id);
    await chrome.storage.local.set({ [this.KEYS.JOURNAL]: filtered });
  }

  // --- Signal History (For Backtesting/Review) ---

  static async logSignal(signal: SignalHistoryEntry): Promise<void> {
    const history = await this.getSignalHistory();
    // Prevent duplicate logs for same ticker/timeframe within 5 mins
    const exists = history.some(
      (h) => h.ticker === signal.ticker && h.timeframe === signal.timeframe && 
             (Date.now() - h.timestamp < 300000)
    );
    
    if (!exists) {
      history.unshift(signal);
      if (history.length > 500) history.pop();
      await chrome.storage.local.set({ [this.KEYS.HISTORY]: history });
    }
  }

  static async getSignalHistory(ticker?: string): Promise<SignalHistoryEntry[]> {
    const result = await chrome.storage.local.get(this.KEYS.HISTORY);
    let history: SignalHistoryEntry[] = result[this.KEYS.HISTORY] || [];
    if (ticker) {
      history = history.filter((h: SignalHistoryEntry) => h.ticker === ticker);
    }
    return history;
  }

  // --- Watchlist Management ---

  static async getWatchlist(): Promise<WatchlistItem[]> {
    const result = await chrome.storage.local.get(this.KEYS.WATCHLIST);
    return result[this.KEYS.WATCHLIST] || [];
  }

  static async addToWatchlist(item: WatchlistItem): Promise<void> {
    const list = await this.getWatchlist();
    if (!list.some((i) => i.ticker === item.ticker)) {
      list.push(item);
      await chrome.storage.local.set({ [this.KEYS.WATCHLIST]: list });
    }
  }

  static async removeFromWatchlist(ticker: string): Promise<void> {
    const list = await this.getWatchlist();
    const filtered = list.filter((i) => i.ticker !== ticker);
    await chrome.storage.local.set({ [this.KEYS.WATCHLIST]: filtered });
  }

  // --- Bulk Export (For PDF/CSV generation) ---
  
  static async exportData(): Promise<string> {
    const data = {
      settings: await this.getSettings(),
      journal: await this.getJournal(),
      history: await this.getSignalHistory(),
      watchlist: await this.getWatchlist(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }
}
