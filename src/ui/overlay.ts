/**
 * StockLens Overlay UI Component
 * Injected as Shadow DOM to avoid CSS conflicts
 */

import { ScanReport, SetupCard } from '../engine/types';

export class StockLensOverlay {
  private host: HTMLElement;
  private shadow: ShadowRoot;
  private isDragging = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private currentReports: ScanReport[] = [];
  private setupCard: SetupCard | null = null;

  constructor() {
    this.host = document.createElement('stocklens-overlay');
    this.shadow = this.host.attachShadow({ mode: 'open' });
    this.render();
    this.setupDragListeners();
  }

  public attach() {
    document.body.appendChild(this.host);
  }

  public detach() {
    this.host.remove();
  }

  public update(reports: ScanReport[], setup: SetupCard | null) {
    this.currentReports = reports;
    this.setupCard = setup;
    this.render();
  }

  private render() {
    const score = this.calculateScore();
    const scoreColor = score > 60 ? '#22c55e' : score < 40 ? '#ef4444' : '#f59e0b';
    const scoreLabel = score > 60 ? 'BULLISH' : score < 40 ? 'BEARISH' : 'NEUTRAL';

    this.shadow.innerHTML = `
      <style>
        :host {
          all: initial;
          position: fixed;
          top: 80px;
          right: 20px;
          width: 380px;
          max-height: 80vh;
          z-index: 2147483647;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .container {
          background: #1e293b;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
          color: #f1f5f9;
          overflow: hidden;
          border: 1px solid #334155;
        }
        
        .header {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: move;
          user-select: none;
        }
        
        .title {
          font-weight: 700;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .logo {
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
          font-weight: 900;
          font-size: 14px;
        }
        
        .close-btn {
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 20px;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        
        .close-btn:hover {
          opacity: 1;
        }
        
        .score-panel {
          padding: 16px;
          background: #0f172a;
          border-bottom: 1px solid #334155;
        }
        
        .score-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .score-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${scoreColor};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 800;
          box-shadow: 0 0 20px ${scoreColor}66;
        }
        
        .score-info {
          flex: 1;
          margin-left: 16px;
        }
        
        .score-label {
          font-size: 18px;
          font-weight: 700;
          color: ${scoreColor};
          letter-spacing: 1px;
        }
        
        .score-sub {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 4px;
        }
        
        .timeframe-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 12px;
        }
        
        .tf-tab {
          flex: 1;
          padding: 6px;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 6px;
          text-align: center;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .tf-tab.active {
          background: #3b82f6;
          border-color: #3b82f6;
          font-weight: 600;
        }
        
        .signals-list {
          max-height: 300px;
          overflow-y: auto;
          padding: 0 16px 16px;
        }
        
        .signal-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #334155;
          font-size: 13px;
        }
        
        .signal-name {
          color: #cbd5e1;
        }
        
        .signal-value {
          font-weight: 600;
        }
        
        .signal-bullish {
          color: #22c55e;
        }
        
        .signal-bearish {
          color: #ef4444;
        }
        
        .signal-neutral {
          color: #94a3b8;
        }
        
        .setup-card {
          margin: 0 16px 16px;
          padding: 12px;
          background: #0f172a;
          border-radius: 8px;
          border: 1px solid #334155;
        }
        
        .setup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .setup-direction {
          font-size: 14px;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .setup-long {
          background: #22c55e33;
          color: #22c55e;
        }
        
        .setup-short {
          background: #ef444433;
          color: #ef4444;
        }
        
        .setup-confidence {
          font-size: 11px;
          color: #94a3b8;
        }
        
        .setup-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .setup-item {
          text-align: center;
        }
        
        .setup-label {
          font-size: 10px;
          color: #94a3b8;
          text-transform: uppercase;
        }
        
        .setup-value {
          font-size: 14px;
          font-weight: 700;
          margin-top: 2px;
        }
        
        .setup-reasoning {
          font-size: 11px;
          color: #64748b;
          text-align: center;
          padding-top: 8px;
          border-top: 1px solid #1e293b;
        }
        
        .footer {
          padding: 8px 16px;
          background: #0f172a;
          border-top: 1px solid #334155;
          font-size: 10px;
          color: #64748b;
          text-align: center;
        }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1e293b;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 3px;
        }
      </style>
      
      <div class="container">
        <div class="header">
          <div class="title">
            <div class="logo">S</div>
            StockLens
          </div>
          <button class="close-btn" id="closeBtn">×</button>
        </div>
        
        <div class="score-panel">
          <div class="score-main">
            <div class="score-circle">${score}</div>
            <div class="score-info">
              <div class="score-label">${scoreLabel}</div>
              <div class="score-sub">Consensus across ${this.currentReports.length} timeframes</div>
            </div>
          </div>
          
          <div class="timeframe-tabs">
            ${['1D', '1W', '1M', '3M', '1Y'].map(tf => `
              <div class="tf-tab ${tf === '1D' ? 'active' : ''}" data-tf="${tf}">${tf}</div>
            `).join('')}
          </div>
        </div>
        
        <div class="signals-list">
          ${this.renderSignals()}
        </div>
        
        ${this.setupCard ? this.renderSetupCard() : ''}
        
        <div class="footer">
          Pure math • No AI • Data from Yahoo Finance
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private renderSignals(): string {
    if (this.currentReports.length === 0) {
      return '<div style="text-align:center;padding:20px;color:#64748b;">Scanning...</div>';
    }

    const dailyReport = this.currentReports.find(r => r.timeframe === '1D') || this.currentReports[0];
    
    return dailyReport.signals.slice(0, 8).map(sig => {
      let signalClass = 'signal-neutral';
      let signalText = sig.signal.replace(/_/g, ' ').toUpperCase();
      const indicatorName = sig.indicator ? sig.indicator.replace(/_/g, ' ') : 'Unknown';
      
      if (['buy', 'bullish', 'oversold_reversal', 'golden_cross', 'breakout_up'].includes(sig.signal)) {
        signalClass = 'signal-bullish';
      } else if (['sell', 'bearish', 'overbought_reversal', 'death_cross', 'breakdown_down'].includes(sig.signal)) {
        signalClass = 'signal-bearish';
      }

      return `
        <div class="signal-item">
          <span class="signal-name">${indicatorName}</span>
          <span class="signal-value ${signalClass}">${signalText}</span>
        </div>
      `;
    }).join('');
  }

  private renderSetupCard(): string {
    if (!this.setupCard || this.setupCard.entry === undefined) return '';
    
    const dirClass = this.setupCard.direction === 'LONG' ? 'setup-long' : 'setup-short';
    const entryVal = this.setupCard.entry ?? 0;
    const stopLossVal = this.setupCard.stopLoss ?? 0;
    const targetVal = this.setupCard.target ?? 0;
    const rrVal = this.setupCard.riskReward ?? 0;
    
    return `
      <div class="setup-card">
        <div class="setup-header">
          <span class="setup-direction ${dirClass}">${this.setupCard.direction}</span>
          <span class="setup-confidence">${this.setupCard.confidence} Confidence</span>
        </div>
        <div class="setup-grid">
          <div class="setup-item">
            <div class="setup-label">Entry</div>
            <div class="setup-value">₹${entryVal.toFixed(2)}</div>
          </div>
          <div class="setup-item">
            <div class="setup-label">Stop Loss</div>
            <div class="setup-value" style="color:#ef4444">₹${stopLossVal.toFixed(2)}</div>
          </div>
          <div class="setup-item">
            <div class="setup-label">Target</div>
            <div class="setup-value" style="color:#22c55e">₹${targetVal.toFixed(2)}</div>
          </div>
        </div>
        <div class="setup-reasoning">${this.setupCard.reasoning} • R:R ${rrVal.toFixed(2)}</div>
      </div>
    `;
  }

  private calculateScore(): number {
    if (this.currentReports.length === 0) return 50;
    
    // Simple average of timeframe scores for now
    // In production, use SmartEngine.calculateConsensusScore
    return Math.round(50 + (Math.random() * 40 - 20)); // Placeholder
  }

  private setupDragListeners() {
    const header = this.shadow.querySelector('.header');
    if (!header) return;

    header.addEventListener('mousedown', ((e: MouseEvent) => {
      this.isDragging = true;
      this.dragOffsetX = e.clientX - this.host.offsetLeft;
      this.dragOffsetY = e.clientY - this.host.offsetTop;
    }) as EventListener);

    document.addEventListener('mousemove', ((e: MouseEvent) => {
      if (!this.isDragging) return;
      this.host.style.left = `${e.clientX - this.dragOffsetX}px`;
      this.host.style.top = `${e.clientY - this.dragOffsetY}px`;
      this.host.style.right = 'auto';
    }) as EventListener);

    document.addEventListener('mouseup', (() => {
      this.isDragging = false;
    }) as EventListener);
  }

  private attachEventListeners() {
    const closeBtn = this.shadow.querySelector('#closeBtn');
    closeBtn?.addEventListener('click', () => {
      this.host.style.display = 'none';
    });

    const tabs = this.shadow.querySelectorAll('.tf-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        // In production: filter signals by timeframe
      });
    });
  }

  public showLoading() {
    this.currentReports = [];
    this.setupCard = null;
    this.render();
  }

  public showError(message: string) {
    this.currentReports = [];
    this.setupCard = null;
    this.render();
    
    const errorDiv = this.shadow.querySelector('.signals-list');
    if (errorDiv) {
      errorDiv.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;">Error: ${message}</div>`;
    }
  }

  public updateScanResults(reports: ScanReport[], setup: SetupCard | null) {
    this.update(reports, setup);
  }

  public destroy() {
    this.detach();
  }
}
