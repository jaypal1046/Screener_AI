function X(a){let s=B(),e=s.attachShadow({mode:"open"}),i=s,t=document.createElement("style");t.textContent=T(),e.appendChild(t);let l=D(a,i);return e.appendChild(l),V(s,e.querySelector(".header")),document.body.appendChild(s),h(a,e),{updateTicker:r=>{k(r,e)},destroy:()=>{s.remove()}}}function B(){let a=document.createElement("div");return a.id="stocklens-overlay",a.style.position="fixed",a.style.top="80px",a.style.right="20px",a.style.zIndex="2147483647",a.style.width="380px",a.style.maxHeight="80vh",a.style.overflow="auto",a}function D(a,s){let e=document.createElement("div");return e.className="root",e.innerHTML=`
    <div class="header">
      <div class="ticker-info">
        <span class="ticker-symbol">${a}</span>
        <span class="loading-indicator">Loading...</span>
      </div>
      <div class="controls">
        <button class="timeframe-btn" data-period="1D">1D</button>
        <button class="timeframe-btn" data-period="1W">1W</button>
        <button class="timeframe-btn active" data-period="1M">1M</button>
        <button class="timeframe-btn" data-period="3M">3M</button>
        <button class="timeframe-btn" data-period="1Y">1Y</button>
        <button class="close-btn" title="Close">\xD7</button>
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
        <h3 class="section-title">\u{1F4CA} Momentum</h3>
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
        <h3 class="section-title">\u{1F4C8} Volatility</h3>
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
        <h3 class="section-title">\u{1F4C9} Volume</h3>
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
        <h3 class="section-title">\u{1F4B9} Price Action</h3>
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
  `,e.querySelectorAll(".timeframe-btn").forEach(t=>{t.addEventListener("click",l=>{e.querySelectorAll(".timeframe-btn").forEach(p=>p.classList.remove("active")),l.target.classList.add("active");let r=l.target.dataset.period,n=e.querySelector(".ticker-symbol").textContent;h(n,e.getRootNode(),r)})}),e.querySelector(".close-btn").addEventListener("click",()=>{s&&s.remove()}),e.querySelectorAll(".signal-row").forEach(t=>{t.addEventListener("mouseenter",()=>{let l=t.querySelector(".signal-tooltip");l&&(l.style.opacity="1")}),t.addEventListener("mouseleave",()=>{let l=t.querySelector(".signal-tooltip");l&&(l.style.opacity="0")})}),e}function T(){return`
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
  `}function V(a,s){let e=!1,i,t,l,r;s.addEventListener("mousedown",n=>{e=!0,i=n.clientX,t=n.clientY,l=a.offsetLeft,r=a.offsetTop,s.style.cursor="grabbing",n.preventDefault()}),document.addEventListener("mousemove",n=>{if(!e)return;let p=n.clientX-i,o=n.clientY-t;a.style.left=`${l+p}px`,a.style.top=`${r+o}px`,a.style.right="auto"}),document.addEventListener("mouseup",()=>{e=!1,s.style.cursor="move"})}async function h(a,s,e="1M"){let i=s.querySelector(".loading-indicator");i.style.display="inline";try{let t=await chrome.runtime.sendMessage({type:"FETCH_DATA",ticker:a,period:I(e)});if(t.success)k(a,s,t.data);else throw new Error(t.error||"Failed to fetch data")}catch(t){console.error("[StockLens] Load error:",t),showError(s,t.message)}finally{i.style.display="none"}}function I(a){let s={"1D":{period:"5d",interval:"5m"},"1W":{period:"1mo",interval:"1d"},"1M":{period:"3mo",interval:"1d"},"3M":{period:"6mo",interval:"1d"},"1Y":{period:"2y",interval:"1wk"}};return s[a]||s["1M"]}function k(a,s,e){let i=s.querySelector(".ticker-symbol");if(i.textContent=a,!e){U(s);return}let{ohlcv:t,indicators:l}=e,r=t.data[t.data.length-1],n=N(l,t.data);O(s,n),d(s,"rsi",n.rsi.value,n.rsi.indicator),d(s,"macd",n.macd.value,n.macd.indicator),d(s,"stoch",n.stoch.value,n.stoch.indicator),d(s,"bb",n.bb.value,n.bb.indicator),d(s,"atr",n.atr.value,n.atr.indicator),d(s,"obv",n.obv.value,n.obv.indicator),d(s,"vol-spike",n.volSpike.value,n.volSpike.indicator),d(s,"support-resistance",n.supportResistance.value,n.supportResistance.indicator),d(s,"pattern",n.pattern.value,n.pattern.indicator);let p=s.querySelector(".last-updated");p.textContent=`Updated: ${new Date().toLocaleTimeString()}`}function N(a,s){let e=s.length-1,i=a.rsi[e],t=i>=70?{value:i.toFixed(1),indicator:"bearish"}:i<=30?{value:i.toFixed(1),indicator:"bullish"}:{value:i.toFixed(1),indicator:"neutral"},l=a.macd.line[e],r=a.macd.signalLine[e],p=a.macd.histogram[e]>0?{value:l.toFixed(2),indicator:"bullish"}:{value:l.toFixed(2),indicator:"bearish"},o=a.stochastic?.k[e],g=a.stochastic?.d[e],c;o===null||g===null||o===void 0?c={value:"--",indicator:"neutral"}:o>=80&&o>g?c={value:`${o.toFixed(1)}`,indicator:"bearish"}:o<=20&&o<g?c={value:`${o.toFixed(1)}`,indicator:"bullish"}:c={value:`${o.toFixed(1)}`,indicator:"neutral"};let m=s[e].close,S=a.bollingerBands.upper[e],w=a.bollingerBands.lower[e],Y=a.bollingerBands.middle[e],v;m<=w?v={value:"At Lower",indicator:"bullish"}:m>=S?v={value:"At Upper",indicator:"bearish"}:v={value:"Mid-Range",indicator:"neutral"};let L={value:a.atr[e].toFixed(2),indicator:"neutral"},b=a.obv.slice(-10),x=b[b.length-1]>b[0]?"rising":"falling",q={value:x,indicator:x==="rising"?"bullish":"bearish"},y=s.map(u=>u.volume),C=y.slice(-20).reduce((u,A)=>u+A,0)/20,f=y[e]/C,E=f>=2?{value:`${(f*100).toFixed(0)}%`,indicator:"bullish"}:{value:`${(f*100).toFixed(0)}%`,indicator:"neutral"},M=s.slice(-20).map(u=>u.high),z=s.slice(-20).map(u=>u.low),$=Math.max(...M),F={value:`S:${Math.min(...z).toFixed(0)} R:${$.toFixed(0)}`,indicator:"neutral"};return{rsi:t,macd:p,stoch:c,bb:v,atr:L,obv:q,volSpike:E,supportResistance:F,pattern:{value:"None detected",indicator:"neutral"}}}function O(a,s){let e=Object.values(s),i=e.filter(c=>c.indicator==="bullish").length,t=e.filter(c=>c.indicator==="bearish").length,l=e.filter(c=>c.indicator==="neutral").length,r=i+t+l,n=a.querySelector(".score-value"),p=a.querySelector(".score-label"),o=Math.round(i/r*10);n.textContent=`${o}/10`,n.style.color=o>=6?"#22c55e":o<=4?"#ef4444":"#fbbf24";let g=a.querySelector(".consensus-breakdown");g.innerHTML=`
    <span class="bullish">Bullish: <strong>${i}</strong></span>
    <span class="neutral">Neutral: <strong>${l}</strong></span>
    <span class="bearish">Bearish: <strong>${t}</strong></span>
  `}function d(a,s,e,i){let t=a.querySelector(`[data-signal="${s}"]`);if(!t)return;let l=t.querySelector(".signal-value"),r=t.querySelector(".signal-indicator");l.textContent=e,r.textContent=i,r.className=`signal-indicator ${i}`}function U(a){a.querySelectorAll(".signal-row").forEach(e=>{e.querySelector(".signal-value").textContent="--",e.querySelector(".signal-indicator").textContent="--",e.querySelector(".signal-indicator").className="signal-indicator neutral"})}export{X as initOverlay};
