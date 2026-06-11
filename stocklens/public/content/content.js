function w(t){let e=I(),n=e.attachShadow({mode:"open"}),s=e,a=document.createElement("style");a.textContent=U(),n.appendChild(a);let o=N(t,s);return n.appendChild(o),V(e,n.querySelector(".header")),document.body.appendChild(e),S(t,n),{updateTicker:r=>{T(r,n)},destroy:()=>{e.remove()}}}function I(){let t=document.createElement("div");return t.id="stocklens-overlay",t.style.position="fixed",t.style.top="80px",t.style.right="20px",t.style.zIndex="2147483647",t.style.width="380px",t.style.maxHeight="80vh",t.style.overflow="auto",t}function N(t,e){let n=document.createElement("div");return n.className="root",n.innerHTML=`
    <div class="header">
      <div class="ticker-info">
        <span class="ticker-symbol">${t}</span>
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
  `,n.querySelectorAll(".timeframe-btn").forEach(a=>{a.addEventListener("click",o=>{n.querySelectorAll(".timeframe-btn").forEach(p=>p.classList.remove("active")),o.target.classList.add("active");let r=o.target.dataset.period,i=n.querySelector(".ticker-symbol").textContent;S(i,n.getRootNode(),r)})}),n.querySelector(".close-btn").addEventListener("click",()=>{e&&e.remove()}),n.querySelectorAll(".signal-row").forEach(a=>{a.addEventListener("mouseenter",()=>{let o=a.querySelector(".signal-tooltip");o&&(o.style.opacity="1")}),a.addEventListener("mouseleave",()=>{let o=a.querySelector(".signal-tooltip");o&&(o.style.opacity="0")})}),n}function U(){return`
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
  `}function V(t,e){let n=!1,s,a,o,r;e.addEventListener("mousedown",i=>{n=!0,s=i.clientX,a=i.clientY,o=t.offsetLeft,r=t.offsetTop,e.style.cursor="grabbing",i.preventDefault()}),document.addEventListener("mousemove",i=>{if(!n)return;let p=i.clientX-s,l=i.clientY-a;t.style.left=`${o+p}px`,t.style.top=`${r+l}px`,t.style.right="auto"}),document.addEventListener("mouseup",()=>{n=!1,e.style.cursor="move"})}async function S(t,e,n="1M"){let s=e.querySelector(".loading-indicator");s.style.display="inline";try{let a=await chrome.runtime.sendMessage({type:"FETCH_DATA",ticker:t,period:Z(n)});if(a.success)T(t,e,a.data);else throw new Error(a.error||"Failed to fetch data")}catch(a){console.error("[StockLens] Load error:",a),showError(e,a.message)}finally{s.style.display="none"}}function Z(t){let e={"1D":{period:"5d",interval:"5m"},"1W":{period:"1mo",interval:"1d"},"1M":{period:"3mo",interval:"1d"},"3M":{period:"6mo",interval:"1d"},"1Y":{period:"2y",interval:"1wk"}};return e[t]||e["1M"]}function T(t,e,n){let s=e.querySelector(".ticker-symbol");if(s.textContent=t,!n){H(e);return}let{ohlcv:a,indicators:o}=n,r=a.data[a.data.length-1],i=Y(o,a.data);j(e,i),u(e,"rsi",i.rsi.value,i.rsi.indicator),u(e,"macd",i.macd.value,i.macd.indicator),u(e,"stoch",i.stoch.value,i.stoch.indicator),u(e,"bb",i.bb.value,i.bb.indicator),u(e,"atr",i.atr.value,i.atr.indicator),u(e,"obv",i.obv.value,i.obv.indicator),u(e,"vol-spike",i.volSpike.value,i.volSpike.indicator),u(e,"support-resistance",i.supportResistance.value,i.supportResistance.indicator),u(e,"pattern",i.pattern.value,i.pattern.indicator);let p=e.querySelector(".last-updated");p.textContent=`Updated: ${new Date().toLocaleTimeString()}`}function Y(t,e){let n=e.length-1,s=t.rsi[n],a=s>=70?{value:s.toFixed(1),indicator:"bearish"}:s<=30?{value:s.toFixed(1),indicator:"bullish"}:{value:s.toFixed(1),indicator:"neutral"},o=t.macd.line[n],r=t.macd.signalLine[n],p=t.macd.histogram[n]>0?{value:o.toFixed(2),indicator:"bullish"}:{value:o.toFixed(2),indicator:"bearish"},l=t.stochastic?.k[n],b=t.stochastic?.d[n],c;l===null||b===null||l===void 0?c={value:"--",indicator:"neutral"}:l>=80&&l>b?c={value:`${l.toFixed(1)}`,indicator:"bearish"}:l<=20&&l<b?c={value:`${l.toFixed(1)}`,indicator:"bullish"}:c={value:`${l.toFixed(1)}`,indicator:"neutral"};let x=e[n].close,C=t.bollingerBands.upper[n],E=t.bollingerBands.lower[n],G=t.bollingerBands.middle[n],v;x<=E?v={value:"At Lower",indicator:"bullish"}:x>=C?v={value:"At Upper",indicator:"bearish"}:v={value:"Mid-Range",indicator:"neutral"};let A={value:t.atr[n].toFixed(2),indicator:"neutral"},m=t.obv.slice(-10),y=m[m.length-1]>m[0]?"rising":"falling",M={value:y,indicator:y==="rising"?"bullish":"bearish"},k=e.map(g=>g.volume),B=k.slice(-20).reduce((g,P)=>g+P,0)/20,f=k[n]/B,z=f>=2?{value:`${(f*100).toFixed(0)}%`,indicator:"bullish"}:{value:`${(f*100).toFixed(0)}%`,indicator:"neutral"},D=e.slice(-20).map(g=>g.high),F=e.slice(-20).map(g=>g.low),O=Math.max(...D),$={value:`S:${Math.min(...F).toFixed(0)} R:${O.toFixed(0)}`,indicator:"neutral"};return{rsi:a,macd:p,stoch:c,bb:v,atr:A,obv:M,volSpike:z,supportResistance:$,pattern:{value:"None detected",indicator:"neutral"}}}function j(t,e){let n=Object.values(e),s=n.filter(c=>c.indicator==="bullish").length,a=n.filter(c=>c.indicator==="bearish").length,o=n.filter(c=>c.indicator==="neutral").length,r=s+a+o,i=t.querySelector(".score-value"),p=t.querySelector(".score-label"),l=Math.round(s/r*10);i.textContent=`${l}/10`,i.style.color=l>=6?"#22c55e":l<=4?"#ef4444":"#fbbf24";let b=t.querySelector(".consensus-breakdown");b.innerHTML=`
    <span class="bullish">Bullish: <strong>${s}</strong></span>
    <span class="neutral">Neutral: <strong>${o}</strong></span>
    <span class="bearish">Bearish: <strong>${a}</strong></span>
  `}function u(t,e,n,s){let a=t.querySelector(`[data-signal="${e}"]`);if(!a)return;let o=a.querySelector(".signal-value"),r=a.querySelector(".signal-indicator");o.textContent=n,r.textContent=s,r.className=`signal-indicator ${s}`}function H(t){t.querySelectorAll(".signal-row").forEach(n=>{n.querySelector(".signal-value").textContent="--",n.querySelector(".signal-indicator").textContent="--",n.querySelector(".signal-indicator").className="signal-indicator neutral"})}function q(t,e){let s={"www.tradingview.com":R,"groww.in":W,"zerodha.com":_,"www.nseindia.com":K,"in.finance.yahoo.com":L,"finance.yahoo.com":L}[t];return s?s(e):X(e)}function R(t){let e=["[data-symbol]",".tv-symbol-picker__title","#header-toolbar-symbol-search",'[aria-label="Symbol"]'];for(let a of e){let o=t.querySelector(a);if(o){let r=o.getAttribute("data-symbol")||o.textContent||o.value;if(r)return d(r)}}let s=new URLSearchParams(window.location.search).get("symbol");return s?d(s.split(":").pop()):null}function W(t){let e=window.location.pathname.split("/");if(e.includes("stocks")&&e.length>2){let s=e.indexOf("stocks")+1;if(e[s])return d(e[s])}let n=t.querySelector('h1, .stock-name, [data-testid="stock-name"]');if(n){let a=n.textContent.match(/\(([A-Z\-\.0-9]+)\)/);if(a)return a[1]}return null}function _(t){let e=window.location.pathname.split("/");if(e.includes("quote")||e.includes("orders")){let s=e.lastIndexOf("quotes")+1;if(s>0&&e[s])return d(e[s])}let n=t.querySelector(".instrument-name, h2, .stock-symbol");if(n){let a=n.textContent.match(/([A-Z\-\.0-9]+)/);if(a)return d(a[1])}return null}function K(t){let n=new URLSearchParams(window.location.search).get("symbol");if(n)return d(n);let s=t.querySelector("h1, .stock-header, .company-name");if(s){let o=s.textContent.match(/^([A-Z\-\.0-9]+)/);if(o)return d(o[1])}return null}function L(t){let e=window.location.pathname.split("/");if(e.includes("quote")&&e.length>2){let s=e.indexOf("quote")+1;if(e[s]){let a=e[s].split(".")[0];return d(a)}}let n=t.querySelector('h1, .quote-header-title, [data-testid="qsp-stock-name"]');if(n){let a=n.textContent.match(/([A-Z\-\.0-9]+)(\.NS|\.BO)?/);if(a)return d(a[1])}return null}function X(t){let e=[/\b([A-Z]{2,6})\b/,/\b([A-Z]{2,4}\.[A-Z]{2})\b/],n=t.title||"";for(let s of e){let a=n.match(s);if(a)return d(a[1])}return null}function d(t){if(!t)return null;let e=t.trim().toUpperCase().replace(/^[NSEBSE]:/i,"").replace(/\.(NS|BO|NSI)$/i,"").replace(/[^A-Z0-9\-\.]/g,"");return e.length>=2&&e.length<=10&&/[A-Z]/.test(e)?e:null}var h=class{constructor(){this.currentTicker=null,this.overlay=null,this.observer=null,this.init()}async init(){console.log("[StockLens] Initializing content script..."),document.readyState==="loading"&&await new Promise(e=>document.addEventListener("DOMContentLoaded",e)),await this.sleep(1e3),this.currentTicker=this.detectTicker(),this.currentTicker?(console.log("[StockLens] Detected ticker:",this.currentTicker),this.overlay=w(this.currentTicker),this.setupTabChangeObserver(),this.notifyBackground()):console.log("[StockLens] No ticker detected on this page")}detectTicker(){let e=window.location.hostname;return q(e,document)}setupTabChangeObserver(){let e=location.href;this.observer=new MutationObserver(()=>{location.href!==e&&(e=location.href,this.handleUrlChange())}),this.observer.observe(document.body,{subtree:!0,childList:!0,attributes:!1})}async handleUrlChange(){console.log("[StockLens] URL changed, re-detecting ticker..."),await this.sleep(500);let e=this.detectTicker();e&&e!==this.currentTicker&&(this.currentTicker=e,console.log("[StockLens] New ticker detected:",this.currentTicker),this.overlay&&this.overlay.updateTicker(e),this.notifyBackground())}notifyBackground(){chrome.runtime.sendMessage({type:"TICKER_DETECTED",ticker:this.currentTicker,url:window.location.href}).catch(e=>console.log("[StockLens] Background message failed:",e))}sleep(e){return new Promise(n=>setTimeout(n,e))}};new h;
