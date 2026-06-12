/**
 * StockLens Screener UI Component
 * Displays screener results in a floating panel with mathematical precision
 */

import { ScreenerResult, ScreenerFilter, FilterCondition, StockPage } from './ScreenerManager';
import { Timeframe } from '../engine/types';

export class ScreenerUI {
  private host: HTMLElement;
  private shadow: ShadowRoot;
  private isVisible: boolean = false;
  private currentResults: ScreenerResult[] = [];
  private currentScreeners: ScreenerFilter[] = [];
  private onScreenerAction?: (action: string, data?: any) => void;

  constructor() {
    this.host = document.createElement('stocklens-screener-ui');
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

  public show() {
    this.isVisible = true;
    this.host.style.display = 'block';
    this.render();
  }

  public hide() {
    this.isVisible = false;
    this.host.style.display = 'none';
  }

  public toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public updateResults(results: ScreenerResult[], screeners: ScreenerFilter[]) {
    this.currentResults = results;
    this.currentScreeners = screeners;
    this.render();
  }

  public setOnScreenerAction(callback: (action: string, data?: any) => void) {
    this.onScreenerAction = callback;
  }

  private render() {
    const perfectMatches = this.currentResults.filter(r => r.matchScore === 100);
    const partialMatches = this.currentResults.filter(r => r.matchScore > 0 && r.matchScore < 100);

    this.shadow.innerHTML = `
      <style>
        :host {
          all: initial;
          position: fixed;
          top: 80px;
          left: 20px;
          width: 450px;
          max-height: 80vh;
          z-index: 2147483646;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: ${this.isVisible ? 'block' : 'none'};
        }
        
        .container {
          background: #1e293b;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
          color: #f1f5f9;
          overflow: hidden;
          border: 1px solid #334155;
          display: flex;
          flex-direction: column;
          max-height: 80vh;
        }
        
        .header {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: move;
          user-select: none;
          flex-shrink: 0;
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
          color: #8b5cf6;
          font-weight: 900;
          font-size: 14px;
        }
        
        .header-actions {
          display: flex;
          gap: 8px;
        }
        
        .icon-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          cursor: pointer;
          font-size: 16px;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .icon-btn:hover {
          background: rgba(255,255,255,0.3);
        }
        
        .stats-bar {
          padding: 12px 16px;
          background: #0f172a;
          border-bottom: 1px solid #334155;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          flex-shrink: 0;
        }
        
        .stat-item {
          text-align: center;
        }
        
        .stat-value {
          font-size: 20px;
          font-weight: 800;
          color: #22c55e;
        }
        
        .stat-label {
          font-size: 10px;
          color: #94a3b8;
          text-transform: uppercase;
          margin-top: 2px;
        }
        
        .content {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }
        
        .section {
          border-bottom: 1px solid #334155;
        }
        
        .section-header {
          padding: 12px 16px;
          background: #1e293b;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1;
        }
        
        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .badge-perfect {
          background: #22c55e;
          color: white;
        }
        
        .badge-partial {
          background: #f59e0b;
          color: white;
        }
        
        .result-item {
          padding: 12px 16px;
          border-bottom: 1px solid #334155;
          transition: background 0.2s;
          cursor: pointer;
        }
        
        .result-item:hover {
          background: #334155;
        }
        
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .result-ticker {
          font-size: 16px;
          font-weight: 700;
          color: #f1f5f9;
        }
        
        .result-score {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .score-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 800;
        }
        
        .score-100 {
          background: #22c55e;
          color: white;
          box-shadow: 0 0 12px #22c55e66;
        }
        
        .score-high {
          background: #84cc16;
          color: white;
        }
        
        .score-medium {
          background: #f59e0b;
          color: white;
        }
        
        .score-low {
          background: #ef4444;
          color: white;
        }
        
        .conditions-bar {
          display: flex;
          gap: 4px;
          margin-top: 8px;
          flex-wrap: wrap;
        }
        
        .condition-pill {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
        }
        
        .condition-pass {
          background: #22c55e33;
          color: #22c55e;
          border: 1px solid #22c55e66;
        }
        
        .condition-fail {
          background: #ef444433;
          color: #ef4444;
          border: 1px solid #ef444466;
        }
        
        .result-details {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #475569;
          font-size: 11px;
          color: #94a3b8;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        
        .detail-label {
          color: #64748b;
        }
        
        .detail-value {
          color: #cbd5e1;
          font-weight: 600;
        }
        
        .empty-state {
          padding: 40px 16px;
          text-align: center;
          color: #64748b;
        }
        
        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        
        .empty-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #94a3b8;
        }
        
        .empty-subtitle {
          font-size: 12px;
          line-height: 1.5;
        }
        
        .math-display {
          font-family: 'Courier New', monospace;
          background: #0f172a;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 11px;
          margin-top: 8px;
          border-left: 3px solid #8b5cf6;
        }
        
        .formula {
          color: #a78bfa;
        }
        
        .variable {
          color: #22d3ee;
        }
        
        .operator {
          color: #f472b6;
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
            <div class="logo">Σ</div>
            Stock Screener
          </div>
          <div class="header-actions">
            <button class="icon-btn" id="newScreenerBtn" title="New Screener">+</button>
            <button class="icon-btn" id="exportBtn" title="Export CSV">⬇</button>
            <button class="icon-btn" id="closeBtn" title="Close">×</button>
          </div>
        </div>
        
        <div class="stats-bar">
          <div class="stat-item">
            <div class="stat-value">${perfectMatches.length}</div>
            <div class="stat-label">Perfect Matches</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${partialMatches.length}</div>
            <div class="stat-label">Partial Matches</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${this.currentScreeners.length}</div>
            <div class="stat-label">Active Screeners</div>
          </div>
        </div>
        
        <div class="content">
          ${this.renderResultsSection('Perfect Matches (100%)', perfectMatches, 'perfect')}
          ${this.renderResultsSection('Partial Matches', partialMatches, 'partial')}
          ${this.currentResults.length === 0 ? this.renderEmptyState() : ''}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private renderResultsSection(title: string, results: ScreenerResult[], type: 'perfect' | 'partial'): string {
    if (results.length === 0) return '';

    const badgeClass = type === 'perfect' ? 'badge-perfect' : 'badge-partial';
    const countLabel = type === 'perfect' ? '100%' : `${results.length}`;

    return `
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            ${title}
            <span class="badge ${badgeClass}">${countLabel}</span>
          </div>
        </div>
        ${results.map(result => this.renderResultItem(result)).join('')}
      </div>
    `;
  }

  private renderResultItem(result: ScreenerResult): string {
    const scoreClass = result.matchScore === 100 ? 'score-100' : 
                       result.matchScore >= 75 ? 'score-high' :
                       result.matchScore >= 50 ? 'score-medium' : 'score-low';

    const passedConditions = result.totalConditions - result.failedConditions.length;
    
    // Generate condition pills
    const conditionPills = result.report?.signals.slice(0, 5).map((sig, idx) => {
      const failed = result.failedConditions.find(fc => fc.condition.indicator === sig.indicator);
      const pillClass = failed ? 'condition-fail' : 'condition-pass';
      const status = failed ? '✗' : '✓';
      return `<span class="condition-pill ${pillClass}">${status} ${sig.indicator}</span>`;
    }).join('') || '';

    // Mathematical formula display
    const mathDisplay = result.totalConditions > 0 ? `
      <div class="math-display">
        <span class="formula">Match Score</span> = 
        <span class="variable">${passedConditions}</span>
        <span class="operator">÷</span>
        <span class="variable">${result.totalConditions}</span>
        <span class="operator">×</span>
        <span class="variable">100</span>
        <span class="operator">=</span>
        <span class="variable">${result.matchScore}%</span>
      </div>
    ` : '';

    const priceDisplay = result.report ? `₹${result.report.currentPrice.toFixed(2)}` : 'N/A';

    return `
      <div class="result-item" data-ticker="${result.ticker}">
        <div class="result-header">
          <div class="result-ticker">${result.ticker}</div>
          <div class="result-score">
            <div class="score-circle ${scoreClass}">${result.matchScore}</div>
          </div>
        </div>
        
        <div class="conditions-bar">
          ${conditionPills}
        </div>
        
        ${mathDisplay}
        
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">Price:</span>
            <span class="detail-value">${priceDisplay}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Matched:</span>
            <span class="detail-value">${passedConditions}/${result.totalConditions} conditions</span>
          </div>
          ${result.failedConditions.length > 0 ? `
            <div class="detail-row">
              <span class="detail-label">Failed:</span>
              <span class="detail-value">${result.failedConditions.map(fc => fc.condition.indicator).join(', ')}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private renderEmptyState(): string {
    return `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <div class="empty-title">No Results Yet</div>
        <div class="empty-subtitle">
          Open stock pages and create screeners to see matches here.<br>
          Click + to create a new screener.
        </div>
      </div>
    `;
  }

  private setupDragListeners() {
    const header = this.shadow.querySelector('.header');
    if (!header) return;

    header.addEventListener('mousedown', ((e: MouseEvent) => {
      const rect = this.host.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      const onMove = (moveEvent: MouseEvent) => {
        this.host.style.left = `${moveEvent.clientX - offsetX}px`;
        this.host.style.top = `${moveEvent.clientY - offsetY}px`;
        this.host.style.right = 'auto';
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }) as EventListener);
  }

  private attachEventListeners() {
    const closeBtn = this.shadow.querySelector('#closeBtn');
    closeBtn?.addEventListener('click', () => {
      this.hide();
    });

    const newScreenerBtn = this.shadow.querySelector('#newScreenerBtn');
    newScreenerBtn?.addEventListener('click', () => {
      if (this.onScreenerAction) {
        this.onScreenerAction('new_screener');
      }
    });

    const exportBtn = this.shadow.querySelector('#exportBtn');
    exportBtn?.addEventListener('click', () => {
      if (this.onScreenerAction) {
        this.onScreenerAction('export_csv');
      }
    });

    // Click on result items
    const resultItems = this.shadow.querySelectorAll('.result-item');
    resultItems.forEach(item => {
      item.addEventListener('click', () => {
        const ticker = item.getAttribute('data-ticker');
        if (ticker && this.onScreenerAction) {
          this.onScreenerAction('select_stock', { ticker });
        }
      });
    });
  }
}
