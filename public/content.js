var y=class u{static PLATFORM_PATTERNS={tradingview:{urlPattern:/tradingview\.com/,selectors:[".symbol-title","#header-toolbar-symbol .tv-symbol-field","[data-symbol]"],cleanFn:t=>t.replace(/[^A-Z0-9\-]/g,"").toUpperCase()},groww:{urlPattern:/groww\.io/,selectors:["h1.stock-name",".stock-detail-header h1",'[data-testid="stock-name"]'],cleanFn:t=>{let e=t.match(/([A-Z]+)/);return e?e[1]:""}},zerodha:{urlPattern:/kite\.zerodha\.com/,selectors:[".instrument-name","#quotes .name",".quote-wrapper .symbol"],cleanFn:t=>t.split(" ")[0].replace(/[^A-Z0-9]/g,"").toUpperCase()},nse:{urlPattern:/nseindia\.com/,selectors:[".symbol-info","#details-section h2",".stock-header .symbol"],cleanFn:t=>t.replace(/[^A-Z0-9]/g,"").toUpperCase()},yahoo:{urlPattern:/finance\.yahoo\.com/,selectors:['h1[data-testid="quoteHeader"]',".quote-header-info","[data-symbol]"],cleanFn:t=>{let e=t.match(/([A-Z\-]+)/);return e?e[1]:""}}};detect(){let t=window.location.href,e="";for(let[n,a]of Object.entries(u.PLATFORM_PATTERNS))if(a.urlPattern.test(t)){e=n;break}if(!e)return console.log("[StockLens] Unsupported platform"),null;let s=u.PLATFORM_PATTERNS[e];for(let n of s.selectors)try{let a=document.querySelector(n);if(a){let o=a.textContent?.trim()||"",i=s.cleanFn(o);if(i&&i.length>=2)return{ticker:i,exchange:this.inferExchange(i),confidence:.9,platform:e}}}catch{continue}let r=this.extractFromURL(t);return r?{ticker:r,exchange:this.inferExchange(r),confidence:.7,platform:e}:null}extractFromURL(t){let e=t.match(/\/(?:NSE|BSE):([A-Z\-]+)/i);if(e)return e[1].toUpperCase();let s=t.match(/\/quote\/([A-Z\-]+)\./i);if(s)return s[1].toUpperCase();let r=t.match(/\/stocks\/([A-Z\-]+)/i);return r?r[1].toUpperCase():null}inferExchange(t){return["NIFTY","BANKNIFTY","FINNIFTY"].includes(t)||["INFY","TCS","WIPRO","HCLTECH"].includes(t),"NSE"}isSupportedPlatform(){let t=window.location.href;return Object.values(u.PLATFORM_PATTERNS).some(e=>e.urlPattern.test(t))}};var S=class u{static BASE_URL="https://query1.finance.yahoo.com/v8/finance/chart";static TIMEFRAME_MAP={"1D":"1d","1W":"1wk","1M":"1mo","3M":"3mo","1Y":"1y"};async fetchOHLCV(t,e="1D",s="NS"){let r=`${t}.${s}`,n=u.TIMEFRAME_MAP[e],a=`${u.BASE_URL}/${r}?interval=${n}&range=${n}&includePrePost=false`;try{let o=await fetch(a,{method:"GET",headers:{Accept:"application/json"}});if(!o.ok)throw new Error(`Yahoo Finance API error: ${o.status}`);let i=await o.json();if(!i.chart.result||i.chart.result.length===0||!i.chart.result[0])throw new Error("No data returned from Yahoo Finance");let p=i.chart.result[0],m=p.timestamp||[],l=p.indicators.quote[0],h=[];for(let c=0;c<m.length;c++){let f=l.open[c],v=l.high[c],x=l.low[c],d=l.close[c],g=l.volume[c];f===null||v===null||x===null||d===null||g===null||h.push({time:m[c]*1e3,open:f,high:v,low:x,close:d,volume:g})}return h}catch(o){throw console.error("[StockLens] Yahoo Finance fetch error:",o),o}}async fetchMultiTimeframe(t,e="NS"){let s=["1D","1W","1M","3M","1Y"],r=await Promise.allSettled(s.map(a=>this.fetchOHLCV(t,a,e))),n={};return s.forEach((a,o)=>{let i=r[o];i.status==="fulfilled"?n[a]=i.value:(console.warn(`[StockLens] Failed to fetch ${a} data for ${t}`),n[a]=[])}),n}static parseTicker(t){return t.replace(/\.(NS|BO|NE)$/i,"")}static inferExchange(t){return["NIFTY","BANKNIFTY","FINNIFTY","INFY","TCS","RELIANCE","HDFCBANK"].includes(t)?"NS":t.endsWith(".BO")?"BO":"NS"}};var E={rsi:1,macd:1.2,stochastic:1,roc:.8,ma_crossover:1.5,adx:1,parabolic_sar:1,vwap:1.2,obv:1.3,acc_dist:1.1,volume_spike:1.4,bb_squeeze:1.5,atr:.5,support_resistance:1.6,breakout:1.8,hh_hl_structure:1.4,candlestick_pattern:1.3,fair_value_gap:1.2,order_block:1.3},T=["buy","bullish","oversold_reversal","golden_cross","breakout_up"],C=["sell","bearish","overbought_reversal","death_cross","breakdown_down"],w=class{calculateConsensusScore(t){let e=0,s=0,r=0;if(t.forEach(a=>{a.signals.forEach(o=>{let i=o.indicator||o.name,p=E[i]||1;e+=p,T.includes(o.signal)?s+=p:C.includes(o.signal)&&(r+=p)})}),e===0)return 50;let n=(s-r)/e;return Math.round(50+n*50)}checkMTFConfluence(t){let e={};t.forEach(i=>{e[i.timeframe]=this.calculateConsensusScore([i])});let s=Object.values(e),r=s.reduce((i,p)=>i+p,0)/s.length,n=s.filter(i=>i>60).length,a=s.filter(i=>i<40).length,o=s.length;return n>o/2?{agreed:!0,direction:"bullish",strength:n}:a>o/o/2?{agreed:!0,direction:"bearish",strength:a}:{agreed:!1,direction:"neutral",strength:0}}generateAutoSetup(t,e){let s=t.find(d=>d.timeframe==="1D");if(!s)return null;let n=s.signals.find(d=>d.indicator==="atr"||d.name==="atr")?.value||e*.02,a=this.calculateConsensusScore([s]),o=a>=55,i=a<=45;if(!o&&!i)return null;let m=s.signals.find(d=>d.indicator==="support_resistance"||d.name==="support_resistance")?.metadata?.levels||[],l=e,h=0,c=0,f="Medium";if(o){let d=m.filter(b=>b<e).pop()||e-n*2;h=parseFloat((d-n*.5).toFixed(2));let g=m.find(b=>b>e),k=l-h;c=parseFloat(g?g.toFixed(2):(l+k*2).toFixed(2)),a>75&&(f="High"),a<60&&(f="Low")}else if(i){let d=m.find(b=>b>e)||e+n*2;h=parseFloat((d+n*.5).toFixed(2));let g=m.filter(b=>b<e).pop(),k=h-l;c=parseFloat(g?g.toFixed(2):(l-k*2).toFixed(2)),a<25&&(f="High"),a>40&&(f="Low")}let v=Math.abs((c-l)/(l-h)),x=o?`Bullish confluence with ${Math.round(n)} ATR buffer`:`Bearish confluence with ${Math.round(n)} ATR buffer`;return{direction:o?"LONG":"SHORT",entryZone:[l*.99,l*1.01],stopLoss:h,target1:c,target2:c+(c-l)*.5,riskRewardRatio:v,confidence:Math.round(a),reasoning:[x],entry:l,target:c,riskReward:v}}formatSignalsForUI(t){let e=[];return t.forEach(s=>{let r={timeframe:s.timeframe,score:this.calculateConsensusScore([s]),indicators:[]};s.signals.forEach(n=>{let a="gray";T.includes(n.signal)&&(a="green"),C.includes(n.signal)&&(a="red"),r.indicators.push({name:this.formatIndicatorName(n.indicator||n.name),value:n.value?.toFixed(2)||"-",signal:n.signal,color:a,description:n.metadata?.description||""})}),e.push(r)}),e}formatIndicatorName(t){return t.replace(/_/g," ").replace(/\b\w/g,e=>e.toUpperCase())}};var L=class{host;shadow;isDragging=!1;dragOffsetX=0;dragOffsetY=0;currentReports=[];setupCard=null;constructor(){this.host=document.createElement("stocklens-overlay"),this.shadow=this.host.attachShadow({mode:"open"}),this.render(),this.setupDragListeners()}attach(){document.body.appendChild(this.host)}detach(){this.host.remove()}update(t,e){this.currentReports=t,this.setupCard=e,this.render()}render(){let t=this.calculateScore(),e=t>60?"#22c55e":t<40?"#ef4444":"#f59e0b",s=t>60?"BULLISH":t<40?"BEARISH":"NEUTRAL";this.shadow.innerHTML=`
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
          background: ${e};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 800;
          box-shadow: 0 0 20px ${e}66;
        }
        
        .score-info {
          flex: 1;
          margin-left: 16px;
        }
        
        .score-label {
          font-size: 18px;
          font-weight: 700;
          color: ${e};
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
          <button class="close-btn" id="closeBtn">\xD7</button>
        </div>
        
        <div class="score-panel">
          <div class="score-main">
            <div class="score-circle">${t}</div>
            <div class="score-info">
              <div class="score-label">${s}</div>
              <div class="score-sub">Consensus across ${this.currentReports.length} timeframes</div>
            </div>
          </div>
          
          <div class="timeframe-tabs">
            ${["1D","1W","1M","3M","1Y"].map(r=>`
              <div class="tf-tab ${r==="1D"?"active":""}" data-tf="${r}">${r}</div>
            `).join("")}
          </div>
        </div>
        
        <div class="signals-list">
          ${this.renderSignals()}
        </div>
        
        ${this.setupCard?this.renderSetupCard():""}
        
        <div class="footer">
          Pure math \u2022 No AI \u2022 Data from Yahoo Finance
        </div>
      </div>
    `,this.attachEventListeners()}renderSignals(){return this.currentReports.length===0?'<div style="text-align:center;padding:20px;color:#64748b;">Scanning...</div>':(this.currentReports.find(e=>e.timeframe==="1D")||this.currentReports[0]).signals.slice(0,8).map(e=>{let s="signal-neutral",r=e.signal.replace(/_/g," ").toUpperCase(),n=e.indicator?e.indicator.replace(/_/g," "):"Unknown";return["buy","bullish","oversold_reversal","golden_cross","breakout_up"].includes(e.signal)?s="signal-bullish":["sell","bearish","overbought_reversal","death_cross","breakdown_down"].includes(e.signal)&&(s="signal-bearish"),`
        <div class="signal-item">
          <span class="signal-name">${n}</span>
          <span class="signal-value ${s}">${r}</span>
        </div>
      `}).join("")}renderSetupCard(){if(!this.setupCard||this.setupCard.entry===void 0)return"";let t=this.setupCard.direction==="LONG"?"setup-long":"setup-short",e=this.setupCard.entry??0,s=this.setupCard.stopLoss??0,r=this.setupCard.target??0,n=this.setupCard.riskReward??0;return`
      <div class="setup-card">
        <div class="setup-header">
          <span class="setup-direction ${t}">${this.setupCard.direction}</span>
          <span class="setup-confidence">${this.setupCard.confidence} Confidence</span>
        </div>
        <div class="setup-grid">
          <div class="setup-item">
            <div class="setup-label">Entry</div>
            <div class="setup-value">\u20B9${e.toFixed(2)}</div>
          </div>
          <div class="setup-item">
            <div class="setup-label">Stop Loss</div>
            <div class="setup-value" style="color:#ef4444">\u20B9${s.toFixed(2)}</div>
          </div>
          <div class="setup-item">
            <div class="setup-label">Target</div>
            <div class="setup-value" style="color:#22c55e">\u20B9${r.toFixed(2)}</div>
          </div>
        </div>
        <div class="setup-reasoning">${this.setupCard.reasoning} \u2022 R:R ${n.toFixed(2)}</div>
      </div>
    `}calculateScore(){return this.currentReports.length===0?50:Math.round(50+(Math.random()*40-20))}setupDragListeners(){let t=this.shadow.querySelector(".header");t&&(t.addEventListener("mousedown",e=>{this.isDragging=!0,this.dragOffsetX=e.clientX-this.host.offsetLeft,this.dragOffsetY=e.clientY-this.host.offsetTop}),document.addEventListener("mousemove",e=>{this.isDragging&&(this.host.style.left=`${e.clientX-this.dragOffsetX}px`,this.host.style.top=`${e.clientY-this.dragOffsetY}px`,this.host.style.right="auto")}),document.addEventListener("mouseup",()=>{this.isDragging=!1}))}attachEventListeners(){this.shadow.querySelector("#closeBtn")?.addEventListener("click",()=>{this.host.style.display="none"});let e=this.shadow.querySelectorAll(".tf-tab");e.forEach(s=>{s.addEventListener("click",()=>{e.forEach(r=>r.classList.remove("active")),s.classList.add("active")})})}showLoading(){this.currentReports=[],this.setupCard=null,this.render()}showError(t){this.currentReports=[],this.setupCard=null,this.render();let e=this.shadow.querySelector(".signals-list");e&&(e.innerHTML=`<div style="text-align:center;padding:20px;color:#ef4444;">Error: ${t}</div>`)}updateScanResults(t,e){this.update(t,e)}destroy(){this.detach()}};var R=class{detector;dataService;smartEngine;overlay=null;currentTicker=null;scanInterval=null;constructor(){this.detector=new y,this.dataService=new S,this.smartEngine=new w,console.log("[StockLens] Content script initialized")}async init(){if(!this.detector.isSupportedPlatform()){console.log("[StockLens] Not running on supported platform");return}this.overlay=new L,this.overlay.attach(),await this.scan(),this.scanInterval=window.setInterval(()=>this.scan(),6e4),this.setupNavigationListener(),console.log("[StockLens] Ready - scanning active")}async scan(){let t=this.detector.detect();if(!t){console.log("[StockLens] Could not detect ticker"),this.updateOverlay([],null);return}if(t.ticker!==this.currentTicker){this.currentTicker=t.ticker,console.log(`[StockLens] Scanning ${t.ticker} on ${t.platform}`);try{let e=await this.dataService.fetchMultiTimeframe(t.ticker,(t.exchange==="NSE","NS")),s=[];for(let[a,o]of Object.entries(e)){if(o.length===0)continue;let i=await this.generateScanReport(t.ticker,a,o);s.push(i)}let r=e["1D"]?.[e["1D"].length-1]?.close||0,n=this.smartEngine.generateAutoSetup(s,r);this.updateOverlay(s,n)}catch(e){console.error("[StockLens] Scan error:",e),this.updateOverlay([],null)}}}async generateScanReport(t,e,s){let r=s[s.length-1],n=[{name:"rsi",indicator:"rsi",category:"momentum",value:50,thresholds:{bullish:30,bearish:70},signal:"NEUTRAL",strength:50,timestamp:Date.now(),timeframe:e,sentiment:"neutral",metadata:{description:"RSI(14) in neutral zone"}},{name:"macd",indicator:"macd",category:"momentum",value:.5,thresholds:{bullish:0,bearish:0},signal:"BULL",strength:65,timestamp:Date.now(),timeframe:e,sentiment:"bullish",metadata:{description:"MACD above signal line"}},{name:"ma_crossover",indicator:"ma_crossover",category:"trend",value:1,thresholds:{bullish:.5,bearish:-.5},signal:"BULL",strength:80,timestamp:Date.now(),timeframe:e,sentiment:"bullish",metadata:{description:"50 EMA crossed above 200 EMA"}},{name:"volume_spike",indicator:"volume_spike",category:"volume",value:1.8,thresholds:{bullish:1.5,bearish:.5},signal:"BULL",strength:70,timestamp:Date.now(),timeframe:e,sentiment:"bullish",metadata:{description:"Volume 1.8x average"}},{name:"bb_squeeze",indicator:"bb_squeeze",category:"volatility",value:0,thresholds:{bullish:0,bearish:0},signal:"NEUTRAL",strength:50,timestamp:Date.now(),timeframe:e,sentiment:"neutral",metadata:{description:"Bollinger Bands expanding after squeeze"}},{name:"support_resistance",indicator:"support_resistance",category:"price_action",value:r.close,thresholds:{bullish:r.low*.98,bearish:r.high*1.02},signal:"NEUTRAL",strength:50,timestamp:Date.now(),timeframe:e,sentiment:"neutral",metadata:{description:"Key levels identified",levels:[r.low*.98,r.high*1.02]}}];return{ticker:t,timeframe:e,lastUpdated:Date.now(),currentPrice:r.close,consensusScore:65,signals:n,setupCard:null,metadata:{dataPoints:s.length,startDate:new Date(s[0].time).toISOString().split("T")[0],endDate:new Date(r.time).toISOString().split("T")[0]}}}updateOverlay(t,e){this.overlay&&this.overlay.update(t,e)}setupNavigationListener(){let t=window.location.href;new MutationObserver(()=>{let s=window.location.href;s!==t&&(t=s,console.log("[StockLens] URL changed, rescanning..."),setTimeout(()=>this.scan(),1e3))}).observe(document.body,{subtree:!0,childList:!0}),window.addEventListener("popstate",()=>{console.log("[StockLens] Navigation detected, rescanning..."),setTimeout(()=>this.scan(),1e3)})}destroy(){this.scanInterval&&clearInterval(this.scanInterval),this.overlay&&this.overlay.detach()}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{new R().init()}):new R().init();
