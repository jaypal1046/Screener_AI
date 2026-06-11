/**
 * ReportGenerator
 * Generates PDF and CSV reports for Paper Trading Journal and Signal History.
 * Uses simple string templating for CSV and basic HTML-to-PDF structure.
 */

import { TradeJournalEntry, SignalHistoryEntry } from './types';
import { StorageManager } from './storage_manager';

export class ReportGenerator {
  
  // --- CSV Generation ---

  static generateJournalCSV(entries: TradeJournalEntry[]): string {
    const headers = ['Date', 'Ticker', 'Type', 'Entry Price', 'Exit Price', 'Quantity', 'P&L', 'Setup Note', 'Outcome'];
    const rows = entries.map(e => [
      new Date(e.entryDate).toLocaleDateString(),
      e.ticker,
      e.type,
      e.entryPrice.toString(),
      e.exitPrice?.toString() || '-',
      e.quantity.toString(),
      e.pnl?.toFixed(2) || 'Open',
      `"${e.setupNote || ''}"`,
      e.outcome || 'Open'
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  static generateHistoryCSV(entries: SignalHistoryEntry[]): string {
    const headers = ['Timestamp', 'Ticker', 'Timeframe', 'Consensus Score', 'Signal Type', 'Key Indicators'];
    const rows = entries.map(e => [
      new Date(e.timestamp).toLocaleString(),
      e.ticker,
      e.timeframe,
      e.consensusScore.toString(),
      e.signalType,
      `"${e.keyIndicators.join('; ')}"`
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  // --- PDF Generation (HTML Template) ---
  // Note: In a real extension, you'd use a library like jsPDF or html2pdf.
  // Here we generate a clean HTML structure that can be printed to PDF via browser's native print dialog.

  static generateJournalHTML(entries: TradeJournalEntry[], ticker?: string): string {
    const filtered = ticker ? entries.filter(e => e.ticker === ticker) : entries;
    const totalPnL = filtered.reduce((sum, e) => sum + (e.pnl || 0), 0);
    const wins = filtered.filter(e => (e.pnl || 0) > 0).length;
    const winRate = filtered.length > 0 ? ((wins / filtered.length) * 100).toFixed(1) : '0';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #333; }
          h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
          .stats { display: flex; gap: 20px; margin: 20px 0; background: #f3f4f6; padding: 20px; border-radius: 8px; }
          .stat-box { text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
          .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f9fafb; font-weight: 600; }
          .positive { color: #059669; font-weight: bold; }
          .negative { color: #dc2626; font-weight: bold; }
          .neutral { color: #6b7280; }
        </style>
      </head>
      <body>
        <h1>StockLens Paper Trade Journal</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        
        <div class="stats">
          <div class="stat-box">
            <div class="stat-value">${filtered.length}</div>
            <div class="stat-label">Total Trades</div>
          </div>
          <div class="stat-box">
            <div class="stat-value ${totalPnL >= 0 ? 'positive' : 'negative'}">₹${totalPnL.toFixed(2)}</div>
            <div class="stat-label">Net P&L</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${winRate}%</div>
            <div class="stat-label">Win Rate</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Ticker</th>
              <th>Type</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Qty</th>
              <th>P&L</th>
              <th>Setup</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(e => `
              <tr>
                <td>${new Date(e.entryDate).toLocaleDateString()}</td>
                <td><strong>${e.ticker}</strong></td>
                <td>${e.type}</td>
                <td>₹${e.entryPrice}</td>
                <td>${e.exitPrice ? '₹' + e.exitPrice : '-'}</td>
                <td>${e.quantity}</td>
                <td class="${e.pnl && e.pnl > 0 ? 'positive' : e.pnl && e.pnl < 0 ? 'negative' : 'neutral'}">
                  ${e.pnl ? '₹' + e.pnl.toFixed(2) : 'Open'}
                </td>
                <td>${e.setupNote || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }

  static generateAnalysisHTML(ticker: string, score: number, signals: any[], setup?: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
          .score-badge { background: ${score > 70 ? '#059669' : score > 40 ? '#d97706' : '#dc2626'}; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; font-size: 18px; }
          .section { margin: 30px 0; }
          .signal-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
          .signal-card { background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #ccc; }
          .signal-card.bullish { border-left-color: #059669; }
          .signal-card.bearish { border-left-color: #dc2626; }
          .signal-card.neutral { border-left-color: #6b7280; }
          .setup-box { background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin-top: 20px; }
          .setup-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .setup-label { font-weight: 600; color: #1e40af; }
          .setup-value { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${ticker} Analysis Report</h1>
          <div class="score-badge">Score: ${score}/100</div>
        </div>
        <p>Generated: ${new Date().toLocaleString()}</p>

        ${setup ? `
        <div class="setup-box">
          <h3>🎯 Auto Setup Card</h3>
          <div class="setup-row"><span class="setup-label">Direction:</span> <span class="setup-value">${setup.direction}</span></div>
          <div class="setup-row"><span class="setup-label">Entry Zone:</span> <span class="setup-value">₹${setup.entryMin} - ₹${setup.entryMax}</span></div>
          <div class="setup-row"><span class="setup-label">Stop Loss:</span> <span class="setup-value" style="color:#dc2626">₹${setup.stopLoss}</span></div>
          <div class="setup-row"><span class="setup-label">Target 1:</span> <span class="setup-value" style="color:#059669">₹${setup.target1}</span></div>
          <div class="setup-row"><span class="setup-label">Target 2:</span> <span class="setup-value" style="color:#059669">₹${setup.target2}</span></div>
          <div class="setup-row"><span class="setup-label">Risk:Reward:</span> <span class="setup-value">${setup.riskReward}</span></div>
        </div>
        ` : ''}

        <div class="section">
          <h3>📊 Signal Breakdown</h3>
          <div class="signal-grid">
            ${signals.map((s: any) => `
              <div class="signal-card ${s.sentiment || 'neutral'}">
                <div style="font-weight:bold; margin-bottom:5px;">${s.name}</div>
                <div style="font-size:13px; color:#666;">${s.value}</div>
                <div style="font-size:12px; color:#999; margin-top:5px;">${s.comment || ''}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // --- Trigger Download ---

  static downloadFile(content: string, filename: string, type: 'csv' | 'html') {
    const blob = new Blob([content], { type: type === 'csv' ? 'text/csv' : 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- High-Level Export Functions ---

  static async exportJournalCSV(ticker?: string) {
    const journal = await StorageManager.getJournal();
    const csv = this.generateJournalCSV(ticker ? journal.filter(j => j.ticker === ticker) : journal);
    this.downloadFile(csv, `stocklens_journal_${ticker || 'all'}_${Date.now()}.csv`, 'csv');
  }

  static async exportJournalPDF(ticker?: string) {
    const journal = await StorageManager.getJournal();
    const html = this.generateJournalHTML(ticker ? journal.filter(j => j.ticker === ticker) : journal, ticker);
    this.openPrintWindow(html, `stocklens_journal_${ticker || 'all'}`);
  }

  static async exportAnalysisPDF(ticker: string, score: number, signals: any[], setup?: any) {
    const html = this.generateAnalysisHTML(ticker, score, signals, setup);
    this.openPrintWindow(html, `stocklens_analysis_${ticker}`);
  }

  private static openPrintWindow(html: string, filename: string) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  }
}
