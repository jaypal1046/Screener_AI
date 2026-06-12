/**
 * StockLens Screener Builder UI
 * Allows users to create custom screeners with mathematical conditions
 */

import { FilterCondition, ScreenerFilter } from './ScreenerManager';
import { Timeframe } from '../engine/types';

export interface ScreenerBuilderConfig {
  name: string;
  conditions: FilterCondition[];
}

export class ScreenerBuilderUI {
  private host: HTMLElement;
  private shadow: ShadowRoot;
  private isVisible: boolean = false;
  private currentConfig: ScreenerBuilderConfig = { name: '', conditions: [] };
  private onSaveCallback?: (config: ScreenerBuilderConfig) => void;
  private onCloseCallback?: () => void;

  private availableIndicators = [
    { id: 'RSI', name: 'RSI (Relative Strength Index)', category: 'momentum', defaultTimeframe: '1D' as Timeframe },
    { id: 'MACD', name: 'MACD', category: 'trend', defaultTimeframe: '1D' as Timeframe },
    { id: 'Stochastic', name: 'Stochastic Oscillator', category: 'momentum', defaultTimeframe: '1D' as Timeframe },
    { id: 'ADX', name: 'ADX (Trend Strength)', category: 'trend', defaultTimeframe: '1D' as Timeframe },
    { id: 'CCI', name: 'CCI (Commodity Channel Index)', category: 'momentum', defaultTimeframe: '1D' as Timeframe },
    { id: 'Williams %R', name: 'Williams %R', category: 'momentum', defaultTimeframe: '1D' as Timeframe },
    { id: 'ATR', name: 'ATR (Volatility)', category: 'volatility', defaultTimeframe: '1D' as Timeframe },
    { id: 'Bollinger %B', name: 'Bollinger %B', category: 'volatility', defaultTimeframe: '1D' as Timeframe },
    { id: 'Volume Ratio', name: 'Volume Ratio', category: 'volume', defaultTimeframe: '1D' as Timeframe },
    { id: 'OBV', name: 'On-Balance Volume', category: 'volume', defaultTimeframe: '1D' as Timeframe },
    { id: 'MFI', name: 'Money Flow Index', category: 'volume', defaultTimeframe: '1D' as Timeframe },
    { id: 'ROC', name: 'Rate of Change', category: 'momentum', defaultTimeframe: '1D' as Timeframe },
    { id: 'Aroon', name: 'Aroon Indicator', category: 'trend', defaultTimeframe: '1D' as Timeframe },
    { id: 'Supertrend', name: 'Supertrend', category: 'trend', defaultTimeframe: '1D' as Timeframe }
  ];

  private operators = [
    { id: 'gt', name: '>', description: 'Greater than' },
    { id: 'lt', name: '<', description: 'Less than' },
    { id: 'gte', name: '≥', description: 'Greater than or equal' },
    { id: 'lte', name: '≤', description: 'Less than or equal' },
    { id: 'eq', name: '=', description: 'Equal to' },
    { id: 'between', name: 'Between', description: 'Value in range' },
    { id: 'crosses_above', name: 'Crosses Above', description: 'Crosses above threshold' },
    { id: 'crosses_below', name: 'Crosses Below', description: 'Crosses below threshold' }
  ];

  private timeframes: Timeframe[] = ['1D', '1W', '1M', '3M', '1Y'];

  constructor() {
    this.host = document.createElement('stocklens-screener-builder');
    this.shadow = this.host.attachShadow({ mode: 'open' });
    this.render();
  }

  public attach() {
    document.body.appendChild(this.host);
  }

  public detach() {
    this.host.remove();
  }

  public show(existingScreener?: ScreenerFilter) {
    this.isVisible = true;
    this.host.style.display = 'block';
    
    if (existingScreener) {
      this.currentConfig = {
        name: existingScreener.name,
        conditions: [...existingScreener.conditions]
      };
    } else {
      this.currentConfig = { name: '', conditions: [] };
    }
    
    this.render();
  }

  public hide() {
    this.isVisible = false;
    this.host.style.display = 'none';
  }

  public setOnSave(callback: (config: ScreenerBuilderConfig) => void) {
    this.onSaveCallback = callback;
  }

  public setOnClose(callback: () => void) {
    this.onCloseCallback = callback;
  }

  private render() {
    const conditionCount = this.currentConfig.conditions.length;
    
    this.shadow.innerHTML = `
      <style>
        :host {
          all: initial;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 700px;
          max-height: 85vh;
          z-index: 2147483647;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: ${this.isVisible ? 'block' : 'none'};
        }
        
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: -1;
        }
        
        .container {
          background: #1e293b;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          color: #f1f5f9;
          overflow: hidden;
          border: 1px solid #334155;
          display: flex;
          flex-direction: column;
          max-height: 85vh;
        }
        
        .header {
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }
        
        .title {
          font-weight: 700;
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .logo {
          width: 28px;
          height: 28px;
          background: white;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #06b6d4;
          font-weight: 900;
          font-size: 16px;
        }
        
        .close-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          cursor: pointer;
          font-size: 20px;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .close-btn:hover {
          background: rgba(255,255,255,0.3);
        }
        
        .content {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .input {
          width: 100%;
          padding: 10px 14px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 8px;
          color: #f1f5f9;
          font-size: 14px;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        
        .input:focus {
          outline: none;
          border-color: #06b6d4;
        }
        
        .conditions-list {
          border: 1px solid #334155;
          border-radius: 8px;
          overflow: hidden;
          margin-top: 10px;
        }
        
        .condition-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1.5fr 1fr 40px;
          gap: 8px;
          padding: 12px;
          background: #0f172a;
          border-bottom: 1px solid #334155;
          align-items: center;
        }
        
        .condition-row:last-child {
          border-bottom: none;
        }
        
        .condition-row:hover {
          background: #1e293b;
        }
        
        .select {
          padding: 8px 10px;
          background: #1e293b;
          border: 1px solid #475569;
          border-radius: 6px;
          color: #f1f5f9;
          font-size: 13px;
          width: 100%;
          box-sizing: border-box;
          cursor: pointer;
        }
        
        .select:focus {
          outline: none;
          border-color: #06b6d4;
        }
        
        .number-input {
          padding: 8px 10px;
          background: #1e293b;
          border: 1px solid #475569;
          border-radius: 6px;
          color: #f1f5f9;
          font-size: 13px;
          width: 100%;
          box-sizing: border-box;
        }
        
        .number-input:focus {
          outline: none;
          border-color: #06b6d4;
        }
        
        .remove-btn {
          background: #ef444433;
          border: 1px solid #ef444466;
          color: #ef4444;
          cursor: pointer;
          font-size: 16px;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .remove-btn:hover {
          background: #ef4444;
          color: white;
        }
        
        .add-condition-btn {
          width: 100%;
          padding: 12px;
          background: #06b6d433;
          border: 2px dashed #06b6d466;
          border-radius: 8px;
          color: #06b6d4;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
        }
        
        .add-condition-btn:hover {
          background: #06b6d4;
          color: white;
          border-style: solid;
        }
        
        .math-info {
          background: #0f172a;
          padding: 12px 16px;
          border-radius: 8px;
          margin-top: 16px;
          border-left: 4px solid #06b6d4;
        }
        
        .math-title {
          font-size: 12px;
          font-weight: 700;
          color: #94a3b8;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        
        .formula-display {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #cbd5e1;
          line-height: 1.6;
        }
        
        .formula-highlight {
          color: #22d3ee;
          font-weight: 600;
        }
        
        .footer {
          padding: 16px 20px;
          background: #0f172a;
          border-top: 1px solid #334155;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }
        
        .condition-count {
          font-size: 13px;
          color: #94a3b8;
        }
        
        .condition-count strong {
          color: #06b6d4;
        }
        
        .actions {
          display: flex;
          gap: 12px;
        }
        
        .btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        
        .btn-secondary {
          background: #334155;
          color: #f1f5f9;
        }
        
        .btn-secondary:hover {
          background: #475569;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          color: white;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px #06b6d466;
        }
        
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }
        
        .empty-conditions {
          padding: 30px;
          text-align: center;
          color: #64748b;
        }
        
        .empty-icon {
          font-size: 40px;
          margin-bottom: 12px;
          opacity: 0.5;
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
      
      <div class="overlay"></div>
      <div class="container">
        <div class="header">
          <div class="title">
            <div class="logo">Σ</div>
            Create Custom Screener
          </div>
          <button class="close-btn" id="closeBtn">×</button>
        </div>
        
        <div class="content">
          <div class="form-group">
            <label class="label">Screener Name</label>
            <input 
              type="text" 
              class="input" 
              id="screenerName" 
              placeholder="e.g., Oversold Stocks, Momentum Breakouts..."
              value="${this.currentConfig.name}"
            />
          </div>
          
          <div class="form-group">
            <label class="label">Conditions</label>
            <div class="conditions-list" id="conditionsList">
              ${this.renderConditions()}
            </div>
            
            <button class="add-condition-btn" id="addConditionBtn">
              <span>+</span> Add Condition
            </button>
          </div>
          
          <div class="math-info">
            <div class="math-title">📐 Mathematical Scoring Formula</div>
            <div class="formula-display">
              Match Score = (<span class="formula-highlight">${conditionCount}</span> matched conditions ÷ <span class="formula-highlight">${Math.max(conditionCount, 1)}</span> total conditions) × 100<br/>
              <br/>
              Stocks are ranked by match score: <span class="formula-highlight">100%</span> = Perfect Match, <span class="formula-highlight">0%</span> = No Match
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div class="condition-count">
            Total Conditions: <strong>${conditionCount}</strong>
          </div>
          <div class="actions">
            <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
            <button class="btn btn-primary" id="saveBtn" ${conditionCount === 0 ? 'disabled' : ''}>
              Save Screener
            </button>
          </div>
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  }
  
  private renderConditions(): string {
    if (this.currentConfig.conditions.length === 0) {
      return `
        <div class="empty-conditions">
          <div class="empty-icon">📊</div>
          <div>No conditions added yet. Click "Add Condition" to get started.</div>
        </div>
      `;
    }
    
    return this.currentConfig.conditions.map((condition, index) => {
      const indicatorOptions = this.availableIndicators.map(ind => 
        `<option value="${ind.id}" ${condition.indicator === ind.id ? 'selected' : ''}>${ind.name}</option>`
      ).join('');
      
      const operatorOptions = this.operators.map(op => 
        `<option value="${op.id}" ${condition.operator === op.id ? 'selected' : ''}>${op.name}</option>`
      ).join('');
      
      const timeframeOptions = this.timeframes.map(tf => 
        `<option value="${tf}" ${condition.timeframe === tf ? 'selected' : ''}>${tf}</option>`
      ).join('');
      
      const isBetween = condition.operator === 'between';
      const valueDisplay = isBetween 
        ? `${(condition.value as [number, number])[0]} - ${(condition.value as [number, number])[1]}`
        : condition.value.toString();
      
      return `
        <div class="condition-row" data-index="${index}">
          <select class="select indicator-select">
            ${indicatorOptions}
          </select>
          <select class="select operator-select">
            ${operatorOptions}
          </select>
          <input 
            type="text" 
            class="number-input value-input" 
            value="${valueDisplay}"
            placeholder="${isBetween ? 'min - max' : 'Value'}"
            data-operator="${condition.operator}"
          />
          <select class="select timeframe-select">
            ${timeframeOptions}
          </select>
          <button class="remove-btn" title="Remove condition">×</button>
        </div>
      `;
    }).join('');
  }
  
  private attachEventListeners() {
    const closeBtn = this.shadow.querySelector('#closeBtn');
    closeBtn?.addEventListener('click', () => {
      this.hide();
      this.onCloseCallback?.();
    });
    
    const cancelBtn = this.shadow.querySelector('#cancelBtn');
    cancelBtn?.addEventListener('click', () => {
      this.hide();
      this.onCloseCallback?.();
    });
    
    const addConditionBtn = this.shadow.querySelector('#addConditionBtn');
    addConditionBtn?.addEventListener('click', () => {
      this.addCondition();
    });
    
    const saveBtn = this.shadow.querySelector('#saveBtn');
    saveBtn?.addEventListener('click', () => {
      this.save();
    });
    
    const screenerNameInput = this.shadow.querySelector('#screenerName');
    screenerNameInput?.addEventListener('input', (e) => {
      this.currentConfig.name = (e.target as HTMLInputElement).value;
    });
    
    // Delegate events for dynamic content
    const conditionsList = this.shadow.querySelector('#conditionsList');
    conditionsList?.addEventListener('change', (e) => {
      const target = e.target as HTMLElement;
      const row = target.closest('.condition-row');
      if (!row) return;
      
      const index = parseInt(row.getAttribute('data-index') || '0');
      
      if (target.classList.contains('indicator-select')) {
        this.currentConfig.conditions[index].indicator = target.getAttribute('value') || '';
        // Update category
        const indicator = this.availableIndicators.find(i => i.id === this.currentConfig.conditions[index].indicator);
        if (indicator) {
          this.currentConfig.conditions[index].category = indicator.category as any;
        }
      } else if (target.classList.contains('operator-select')) {
        this.currentConfig.conditions[index].operator = target.getAttribute('value') as any;
        // Reset value for new operator
        const newOperator = target.getAttribute('value');
        if (newOperator === 'between') {
          this.currentConfig.conditions[index].value = [0, 100];
        } else {
          this.currentConfig.conditions[index].value = 50;
        }
        this.render();
      } else if (target.classList.contains('value-input')) {
        const value = (target as HTMLInputElement).value;
        const operator = this.currentConfig.conditions[index].operator;
        
        if (operator === 'between') {
          const parts = value.split('-').map(v => parseFloat(v.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            this.currentConfig.conditions[index].value = [parts[0], parts[1]] as [number, number];
          }
        } else {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            this.currentConfig.conditions[index].value = numValue;
          }
        }
      } else if (target.classList.contains('timeframe-select')) {
        this.currentConfig.conditions[index].timeframe = target.getAttribute('value') as Timeframe;
      }
    });
    
    conditionsList?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('remove-btn')) {
        const row = target.closest('.condition-row');
        if (row) {
          const index = parseInt(row.getAttribute('data-index') || '0');
          this.removeCondition(index);
        }
      }
    });
  }
  
  private addCondition() {
    const defaultIndicator = this.availableIndicators[0];
    const newCondition: FilterCondition = {
      indicator: defaultIndicator.id,
      operator: 'lt',
      value: 30,
      timeframe: defaultIndicator.defaultTimeframe,
      category: defaultIndicator.category as any
    };
    
    this.currentConfig.conditions.push(newCondition);
    this.render();
  }
  
  private removeCondition(index: number) {
    this.currentConfig.conditions.splice(index, 1);
    this.render();
  }
  
  private save() {
    const name = this.currentConfig.name.trim() || `Custom Screener ${Date.now()}`;
    
    if (this.currentConfig.conditions.length === 0) {
      alert('Please add at least one condition');
      return;
    }
    
    const config: ScreenerBuilderConfig = {
      name,
      conditions: this.currentConfig.conditions
    };
    
    this.onSaveCallback?.(config);
    this.hide();
  }
}
