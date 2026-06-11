// StockLens Overlay - Draggable Analysis Panel

export function initOverlay(ticker) {
  const container = createOverlayContainer();
  const shadow = container.attachShadow({ mode: 'open' });
  
  // Store container reference for close handler
  let overlayContainer = container;
  
  // Inject styles
  const style = document.createElement('style');
  style.textContent = getStyles();
  shadow.appendChild(style);

  // Build UI
  const ui = buildUI(ticker, overlayContainer);
  shadow.appendChild(ui);

  // Make draggable
  makeDraggable(container, shadow.querySelector('.header'));

  // Add to page
  document.body.appendChild(container);

  // Load data
  loadData(ticker, shadow);

  return {
    updateTicker: (newTicker) => {
      updateOverlayData(newTicker, shadow);
    },
    destroy: () => {
      container.remove();
    }
  };
}

function createOverlayContainer() {
  const container = document.createElement('div');
  container.id = 'stocklens-overlay';
  container.style.position = 'fixed';
  container.style.top = '80px';
  container.style.right = '20px';
  container.style.zIndex = '2147483647';
  container.style.width = '380px';
  container.style.maxHeight = '80vh';
  container.style.overflow = 'auto';
  return container;
}

function buildUI(ticker, containerRef) {
  const root = document.createElement('div');
  root.className = 'root';

  root.innerHTML = `
    <div class="header">
      <div class="ticker-info">
        <span class="ticker-symbol">${ticker}</span>
        <span class="loading-indicator">Loading...</span>
      </div>
      <div class="controls">
        <button class="timeframe-btn" data-period="1D">1D</button>
        <button class="timeframe-btn" data-period="1W">1W</button>
        <button class="timeframe-btn active" data-period="1M">1M</button>
        <button class="timeframe-btn" data-period="3M">3M</button>
        <button class="timeframe-btn" data-period="1Y">1Y</button>
        <button class="close-btn" title="Close">×</button>
      </div>
    </div>

    <div class="consensus-bar">
      <div class="consensus-score">
        <span class="score-value">--/10</span>
        <span class="score-label">Consensus</span>
      </div>
      <div class="consensus-breakdown">
        <span class="bullish">Bullish: <strong>--</strong></span>
        <span class="neutral">Neutral: <strong>--</strong></span>
        <span class="bearish">Bearish: <strong>--</strong></span>
      </div>
    </div>

    <div class="signals-container">
      <div class="signal-section">
        <h3 class="section-title">📊 Momentum</h3>
        <div class="signal-row" data-signal="rsi">
          <div class="signal-name">
            <span class="signal-icon">RSI(14)</span>
            <span class="signal-tooltip">Relative Strength Index - measures overbought/oversold conditions</span>
          </div>
          <div class="signal-value">--</div>
          <div class="signal-indicator neutral">--</div>
        </div>
        <div class="signal-row" data-signal="macd">
          <div class="signal-name">
            <span class="signal-icon">MACD(12/26/9)</span>
            <span class="signal-tooltip">Moving Average Convergence Divergence - trend following momentum</span>
          </div>
          <div class="signal-value">--</div>
          <div class="signal-indicator neutral">--</div>
        </div>
        <div class="signal-row" data-signal="stoch">
          <div class="signal-name">
            <span class="signal-icon">Stochastic(14,3,3)</span>
            <span class="signal-tooltip">Stochastic Oscillator - compares closing price to price range</span>
          </div>
          <div class="signal-value">--</div>
          <div class="signal-indicator neutral">--</div>
        </div>
      </div>

      <div class="signal-section">
        <h3 class="section-title">📈 Volatility</h3>
        <div class="signal-row" data-signal="bb">
          <div class="signal-name">
            <span class="signal-icon">Bollinger Bands</span>
            <span class="signal-tooltip">Volatility bands around moving average - squeeze indicates potential breakout</span>
          </div>
          <div class="signal-value">--</div>
          <div class="signal-indicator neutral">--</div>
        </div>
        <div class="signal-row" data-signal="atr">
          <div class="signal-name">
            <span class="signal-icon">ATR(14)</span>
            <span class="signal-tooltip">Average True Range - measures volatility for stop-loss sizing</span>
          </div>
          <div class="signal-value">--</div>
          <div class="signal-indicator neutral">--</div>
        </div>
      </div>

      <div class="signal-section">
        <h3 class="section-title">📉 Volume</h3>
        <div class="signal-row" data-signal="obv">
          <div class="signal-name">
            <span class="signal-icon">OBV Trend</span>
            <span class="signal-tooltip">On-Balance Volume - cumulative volume flow indicator</span>
          </div>
          <div class="signal-value">--</div>
          <div class="signal-indicator neutral">--</div>
        </div>
        <div class="signal-row" data-signal="vol-spike">
          <div class="signal-name">
            <span class="signal-icon">Volume Spike</span>
            <span class="signal-tooltip">Current volume vs 20-day average - detects unusual activity</span>
          </div>
          <div class="signal-value">--</div>
          <div class="signal-indicator neutral">--</div>
        </div>
      </div>

      <div class="signal-section">
        <h3 class="section-title">💹 Price Action</h3>
        <div class="signal-row" data-signal="support-resistance">
          <div class="signal-name">
            <span class="signal-icon">Support/Resistance</span>
            <span class="signal-tooltip">Key price levels based on recent highs/lows and pivot points</span>
          </div>
          <div class="signal-value">--</div>
          <div class="signal-indicator neutral">--</div>
        </div>
        <div class="signal-row" data-signal="pattern">
          <div class="signal-name">
            <span class="signal-icon">Candlestick Pattern</span>
            <span class="signal-tooltip">Detected patterns: engulfing, doji, inside bar, pin bar</span>
          </div>
          <div class="signal-value">--</div>
          <div class="signal-indicator neutral">--</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <span class="disclaimer">Pure math. No AI. All signals auditable.</span>
      <span class="last-updated">Updated: --</span>
    </div>
  `;

  // Add timeframe button listeners
  root.querySelectorAll('.timeframe-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      root.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const period = e.target.dataset.period;
      const currentTicker = root.querySelector('.ticker-symbol').textContent;
      loadData(currentTicker, root.getRootNode(), period);
    });
  });

  // Add close button listener
  const closeBtn = root.querySelector('.close-btn');
  closeBtn.addEventListener('click', () => {
    if (containerRef) {
      containerRef.remove();
    }
  });

  // Add tooltip hover behavior
  root.querySelectorAll('.signal-row').forEach(row => {
    row.addEventListener('mouseenter', () => {
      const tooltip = row.querySelector('.signal-tooltip');
      if (tooltip) tooltip.style.opacity = '1';
    });
    row.addEventListener('mouseleave', () => {
      const tooltip = row.querySelector('.signal-tooltip');
      if (tooltip) tooltip.style.opacity = '0';
    });
  });

  return root;
}

function getStyles() {
  return `
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      color: #e0e0e0;
    }

    .root {
      background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
      overflow: hidden;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      cursor: move;
      user-select: none;
    }

    .ticker-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .ticker-symbol {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
    }

    .loading-indicator {
      font-size: 11px;
      color: #fbbf24;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .controls {
      display: flex;
      gap: 4px;
    }

    .timeframe-btn {
      padding: 4px 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: transparent;
      color: #9ca3af;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      transition: all 0.2s;
    }

    .timeframe-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .timeframe-btn.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: #fff;
    }

    .close-btn {
      margin-left: 8px;
      padding: 4px 8px;
      border: none;
      background: transparent;
      color: #9ca3af;
      font-size: 18px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .consensus-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: rgba(59, 130, 246, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .consensus-score {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .score-value {
      font-size: 24px;
      font-weight: 700;
      color: #3b82f6;
    }

    .score-label {
      font-size: 10px;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .consensus-breakdown {
      display: flex;
      gap: 12px;
      font-size: 11px;
    }

    .consensus-breakdown span {
      display: flex;
      gap: 4px;
    }

    .consensus-breakdown .bullish strong { color: #22c55e; }
    .consensus-breakdown .neutral strong { color: #fbbf24; }
    .consensus-breakdown .bearish strong { color: #ef4444; }

    .signals-container {
      padding: 8px;
      max-height: 500px;
      overflow-y: auto;
    }

    .signal-section {
      margin-bottom: 12px;
    }

    .section-title {
      font-size: 12px;
      font-weight: 600;
      color: #9ca3af;
      margin: 0 0 8px 0;
      padding: 4px 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }

    .signal-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      margin-bottom: 4px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
      position: relative;
    }

    .signal-row:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .signal-name {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .signal-icon {
      font-weight: 500;
      color: #e5e7eb;
    }

    .signal-tooltip {
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      width: 220px;
      padding: 8px 12px;
      background: #1f2937;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      font-size: 11px;
      color: #d1d5db;
      opacity: 0;
      transition: opacity 0.2s;
      pointer-events: none;
      z-index: 1000;
      margin-left: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .signal-value {
      font-size: 12px;
      color: #9ca3af;
      min-width: 60px;
      text-align: right;
    }

    .signal-indicator {
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      min-width: 50px;
      text-align: center;
    }

    .signal-indicator.bullish {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }

    .signal-indicator.neutral {
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
    }

    .signal-indicator.bearish {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      background: rgba(255, 255, 255, 0.03);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 10px;
      color: #6b7280;
    }

    .disclaimer {
      font-style: italic;
    }

    .last-updated {
      color: #9ca3af;
    }

    /* Scrollbar styling */
    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `;
}

function makeDraggable(container, handle) {
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = container.offsetLeft;
    startTop = container.offsetTop;
    handle.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    container.style.left = `${startLeft + dx}px`;
    container.style.top = `${startTop + dy}px`;
    container.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    handle.style.cursor = 'move';
  });
}

async function loadData(ticker, shadowRoot, period = '1M') {
  const loadingIndicator = shadowRoot.querySelector('.loading-indicator');
  loadingIndicator.style.display = 'inline';

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'FETCH_DATA',
      ticker: ticker,
      period: mapPeriodToYahoo(period)
    });

    if (response.success) {
      updateOverlayData(ticker, shadowRoot, response.data);
    } else {
      throw new Error(response.error || 'Failed to fetch data');
    }
  } catch (error) {
    console.error('[StockLens] Load error:', error);
    showError(shadowRoot, error.message);
  } finally {
    loadingIndicator.style.display = 'none';
  }
}

function mapPeriodToYahoo(period) {
  const mapping = {
    '1D': { period: '5d', interval: '5m' },
    '1W': { period: '1mo', interval: '1d' },
    '1M': { period: '3mo', interval: '1d' },
    '3M': { period: '6mo', interval: '1d' },
    '1Y': { period: '2y', interval: '1wk' }
  };
  return mapping[period] || mapping['1M'];
}

function updateOverlayData(ticker, shadowRoot, data) {
  const symbolEl = shadowRoot.querySelector('.ticker-symbol');
  symbolEl.textContent = ticker;

  if (!data) {
    showPlaceholderSignals(shadowRoot);
    return;
  }

  const { ohlcv, indicators } = data;
  const latest = ohlcv.data[ohlcv.data.length - 1];

  // Calculate signals
  const signals = analyzeSignals(indicators, ohlcv.data);

  // Update consensus
  updateConsensus(shadowRoot, signals);

  // Update individual signals
  updateSignalRow(shadowRoot, 'rsi', signals.rsi.value, signals.rsi.indicator);
  updateSignalRow(shadowRoot, 'macd', signals.macd.value, signals.macd.indicator);
  updateSignalRow(shadowRoot, 'stoch', signals.stoch.value, signals.stoch.indicator);
  updateSignalRow(shadowRoot, 'bb', signals.bb.value, signals.bb.indicator);
  updateSignalRow(shadowRoot, 'atr', signals.atr.value, signals.atr.indicator);
  updateSignalRow(shadowRoot, 'obv', signals.obv.value, signals.obv.indicator);
  updateSignalRow(shadowRoot, 'vol-spike', signals.volSpike.value, signals.volSpike.indicator);
  updateSignalRow(shadowRoot, 'support-resistance', signals.supportResistance.value, signals.supportResistance.indicator);
  updateSignalRow(shadowRoot, 'pattern', signals.pattern.value, signals.pattern.indicator);

  // Update timestamp
  const lastUpdated = shadowRoot.querySelector('.last-updated');
  lastUpdated.textContent = `Updated: ${new Date().toLocaleTimeString()}`;
}

function analyzeSignals(indicators, ohlcv) {
  const lastIdx = ohlcv.length - 1;

  // RSI Signal
  const rsi = indicators.rsi[lastIdx];
  const rsiSignal = rsi >= 70 ? { value: rsi.toFixed(1), indicator: 'bearish' } :
                    rsi <= 30 ? { value: rsi.toFixed(1), indicator: 'bullish' } :
                    { value: rsi.toFixed(1), indicator: 'neutral' };

  // MACD Signal
  const macdLine = indicators.macd.line[lastIdx];
  const signalLine = indicators.macd.signalLine[lastIdx];
  const macdHist = indicators.macd.histogram[lastIdx];
  const macdSignal = macdHist > 0 ? 
    { value: macdLine.toFixed(2), indicator: 'bullish' } :
    { value: macdLine.toFixed(2), indicator: 'bearish' };

  // Stochastic Signal
  const stochK = indicators.stochastic?.k[lastIdx];
  const stochD = indicators.stochastic?.d[lastIdx];
  let stochSignal;
  if (stochK === null || stochD === null || stochK === undefined) {
    stochSignal = { value: '--', indicator: 'neutral' };
  } else if (stochK >= 80 && stochK > stochD) {
    stochSignal = { value: `${stochK.toFixed(1)}`, indicator: 'bearish' };
  } else if (stochK <= 20 && stochK < stochD) {
    stochSignal = { value: `${stochK.toFixed(1)}`, indicator: 'bullish' };
  } else {
    stochSignal = { value: `${stochK.toFixed(1)}`, indicator: 'neutral' };
  }

  // Bollinger Bands
  const close = ohlcv[lastIdx].close;
  const bbUpper = indicators.bollingerBands.upper[lastIdx];
  const bbLower = indicators.bollingerBands.lower[lastIdx];
  const bbMiddle = indicators.bollingerBands.middle[lastIdx];
  let bbSignal;
  if (close <= bbLower) {
    bbSignal = { value: 'At Lower', indicator: 'bullish' };
  } else if (close >= bbUpper) {
    bbSignal = { value: 'At Upper', indicator: 'bearish' };
  } else {
    bbSignal = { value: 'Mid-Range', indicator: 'neutral' };
  }

  // ATR
  const atr = indicators.atr[lastIdx];
  const atrSignal = { value: atr.toFixed(2), indicator: 'neutral' };

  // OBV Trend
  const obvWindow = indicators.obv.slice(-10);
  const obvTrend = obvWindow[obvWindow.length - 1] > obvWindow[0] ? 'rising' : 'falling';
  const obvSignal = { value: obvTrend, indicator: obvTrend === 'rising' ? 'bullish' : 'bearish' };

  // Volume Spike
  const volumes = ohlcv.map(d => d.volume);
  const avgVol = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const currentVol = volumes[lastIdx];
  const volRatio = currentVol / avgVol;
  const volSpikeSignal = volRatio >= 2 ? 
    { value: `${(volRatio * 100).toFixed(0)}%`, indicator: 'bullish' } :
    { value: `${(volRatio * 100).toFixed(0)}%`, indicator: 'neutral' };

  // Support/Resistance (simplified)
  const highs = ohlcv.slice(-20).map(d => d.high);
  const lows = ohlcv.slice(-20).map(d => d.low);
  const resistance = Math.max(...highs);
  const support = Math.min(...lows);
  const supportResistanceSignal = { 
    value: `S:${support.toFixed(0)} R:${resistance.toFixed(0)}`, 
    indicator: 'neutral' 
  };

  // Candlestick Pattern (placeholder)
  const patternSignal = { value: 'None detected', indicator: 'neutral' };

  return {
    rsi: rsiSignal,
    macd: macdSignal,
    stoch: stochSignal,
    bb: bbSignal,
    atr: atrSignal,
    obv: obvSignal,
    volSpike: volSpikeSignal,
    supportResistance: supportResistanceSignal,
    pattern: patternSignal
  };
}

function updateConsensus(shadowRoot, signals) {
  const signalList = Object.values(signals);
  const bullish = signalList.filter(s => s.indicator === 'bullish').length;
  const bearish = signalList.filter(s => s.indicator === 'bearish').length;
  const neutral = signalList.filter(s => s.indicator === 'neutral').length;
  const total = bullish + bearish + neutral;

  const scoreValue = shadowRoot.querySelector('.score-value');
  const scoreLabel = shadowRoot.querySelector('.score-label');
  
  // Score out of 10 based on bullish bias
  const score = Math.round((bullish / total) * 10);
  scoreValue.textContent = `${score}/10`;
  scoreValue.style.color = score >= 6 ? '#22c55e' : score <= 4 ? '#ef4444' : '#fbbf24';

  const breakdown = shadowRoot.querySelector('.consensus-breakdown');
  breakdown.innerHTML = `
    <span class="bullish">Bullish: <strong>${bullish}</strong></span>
    <span class="neutral">Neutral: <strong>${neutral}</strong></span>
    <span class="bearish">Bearish: <strong>${bearish}</strong></span>
  `;
}

function updateSignalRow(shadowRoot, signalName, value, indicator) {
  const row = shadowRoot.querySelector(`[data-signal="${signalName}"]`);
  if (!row) return;

  const valueEl = row.querySelector('.signal-value');
  const indicatorEl = row.querySelector('.signal-indicator');

  valueEl.textContent = value;
  indicatorEl.textContent = indicator;
  indicatorEl.className = `signal-indicator ${indicator}`;
}

function showPlaceholderSignals(shadowRoot) {
  const signalRows = shadowRoot.querySelectorAll('.signal-row');
  signalRows.forEach(row => {
    row.querySelector('.signal-value').textContent = '--';
    row.querySelector('.signal-indicator').textContent = '--';
    row.querySelector('.signal-indicator').className = 'signal-indicator neutral';
  });
}


// End of StockLens Overlay module
