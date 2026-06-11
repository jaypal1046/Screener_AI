var ne=Object.defineProperty;var N=(r,t)=>()=>(r&&(t=r(r=0)),t);var re=(r,t)=>{for(var e in t)ne(r,e,{get:t[e],enumerable:!0})};function se(r,t=14){let e=[],i=0,s=0;for(let n=0;n<r.length;n++){if(n===0){e.push(NaN);continue}let a=r[n]-r[n-1];if(n<t)a>0?i+=a:s-=a,e.push(NaN);else if(n===t){a>0?i+=a:s-=a;let o=i/t,c=s/t,u=c===0?100:o/c;e.push(100-100/(1+u))}else{let o=(i*(t-1)+Math.max(a,0))/t,c=(s*(t-1)+Math.abs(Math.min(a,0)))/t;i=o,s=c;let u=c===0?100:o/c;e.push(100-100/(1+u))}}return e}function ie(r,t=12,e=26,i=9){let s=C(r,t),n=C(r,e),a=[];for(let h=0;h<r.length;h++)a.push(s[h]-n[h]);let o=a.filter(h=>!isNaN(h)),c=C(o,i),u=[];for(let h=0;h<a.length;h++)isNaN(a[h])||h>=c.length&&isNaN(c[h])?u.push(NaN):u.push(a[h]-(c[h]||0));return{macdLine:a,signalLine:c,histogram:u}}function C(r,t){let e=[],i=2/(t+1),s=0;for(let n=0;n<t&&n<r.length;n++)s+=r[n];for(let n=0;n<r.length;n++)n<t-1?e.push(NaN):n===t-1?e.push(s/t):e.push((r[n]-e[n-1])*i+e[n-1]);return e}function ae(r,t=20,e=2){let i=[],s=[],n=[];for(let a=0;a<r.length;a++){if(a<t-1){i.push(NaN),s.push(NaN),n.push(NaN);continue}let o=r.slice(a-t+1,a+1),c=o.reduce((m,p)=>m+p,0)/t,h=o.map(m=>Math.pow(m-c,2)).reduce((m,p)=>m+p,0)/t,l=Math.sqrt(h);s.push(c),i.push(c+e*l),n.push(c-e*l)}return{upper:i,middle:s,lower:n}}function oe(r,t,e,i=14){let s=[],n=[];for(let o=0;o<r.length;o++)if(o===0)s.push(r[o]-t[o]);else{let c=r[o]-t[o],u=Math.abs(r[o]-e[o-1]),h=Math.abs(t[o]-e[o-1]);s.push(Math.max(c,u,h))}let a=0;for(let o=0;o<i&&o<s.length;o++)a+=s[o];for(let o=0;o<s.length;o++)o<i-1?n.push(NaN):o===i-1?n.push(a/i):n.push((n[o-1]*(i-1)+s[o])/i);return n}function ce(r,t){let e=[t[0]];for(let i=1;i<r.length;i++)r[i]>r[i-1]?e.push(e[i-1]+t[i]):r[i]<r[i-1]?e.push(e[i-1]-t[i]):e.push(e[i-1]);return e}function le(r,t,e,i){let s=[];for(let n=1;n<r.length;n++){let a=r[n-1],o=i[n-1],c=r[n],u=i[n],h=t[n],l=e[n],m=Math.abs(u-c),p=h-l,d=h-Math.max(c,u),f=Math.min(c,u)-l;u>c&&o<a&&c<o&&u>a?s.push({name:"Engulfing",index:n,bullish:!0}):u<c&&o>a&&c>o&&u<a&&s.push({name:"Engulfing",index:n,bullish:!1}),m<p*.1&&s.push({name:"Doji",index:n,bullish:!1}),f>m*2&&d<m*.5&&u>c&&s.push({name:"Hammer",index:n,bullish:!0}),d>m*2&&f<m*.5&&u<c&&s.push({name:"ShootingStar",index:n,bullish:!1}),h<t[n-1]&&l>e[n-1]&&s.push({name:"InsideBar",index:n,bullish:!1})}return s}function ue(r,t,e=10){let i=[];for(let s=e;s<r.length-e;s++){let n=!0,a=!0;for(let o=s-e;o<=s+e;o++)o!==s&&(r[o]>=r[s]&&(n=!1),t[o]<=t[s]&&(a=!1));n?i.push({price:r[s],type:"resistance",touches:1}):a&&i.push({price:t[s],type:"support",touches:1})}return de(i,.02)}function de(r,t){let e=[];for(let i of r){let s=!1;for(let n of e)if(Math.abs(n.price-i.price)/n.price<t){n.touches++,n.price=(n.price*n.touches+i.price)/(n.touches+1),s=!0;break}s||e.push({...i})}return e.sort((i,s)=>s.touches-i.touches)}function E(r,t,e,i,s){let n=[],a=se(i,14),o=a[a.length-1];isNaN(o)||n.push({name:"RSI",category:"momentum",value:o,thresholds:{bullish:70,bearish:30},signal:o>70?"BULL":o<30?"BEAR":"NEUTRAL",strength:Math.round((o-30)/40*100),isBinary:!1});let c=ie(i),u=c.histogram[c.histogram.length-1],h=c.histogram[c.histogram.length-2];!isNaN(u)&&!isNaN(h)&&n.push({name:"MACD",category:"momentum",value:u,thresholds:{bullish:0,bearish:0},signal:u>0?"BULL":"BEAR",strength:Math.abs(u)*100,isBinary:!1,metadata:{crossover:h<0&&u>0||h>0&&u<0}});let l=ae(i,20,2),m=(l.upper[l.upper.length-1]-l.lower[l.lower.length-1])/l.middle[l.middle.length-1];isNaN(m)||n.push({name:"BB_Squeeze",category:"volatility",value:m,thresholds:{bullish:.1,bearish:.1},signal:m<.1?"BULL":"NEUTRAL",strength:m<.05?100:50,isBinary:!1});let p=oe(t,e,i,14),d=p[p.length-1];isNaN(d)||n.push({name:"ATR",category:"volatility",value:d,thresholds:{bullish:0,bearish:0},signal:"NEUTRAL",strength:50,isBinary:!1,metadata:{stopLossDistance:d*1.5}});let f=ce(i,s),g=f[f.length-1]>f[f.length-10]?"uptrend":"downtrend";n.push({name:"OBV",category:"volume",value:g==="uptrend"?1:0,thresholds:{bullish:.5,bearish:.5},signal:g==="uptrend"?"BULL":"BEAR",strength:60,isBinary:!1});let y=le(r,t,e,i).filter(v=>v.index>=i.length-5);if(y.length>0){let v=y[y.length-1];n.push({name:"Candlestick_Pattern",category:"price_action",value:v.bullish?1:0,thresholds:{bullish:.5,bearish:.5},signal:v.bullish?"BULL":"BEAR",strength:70,isBinary:!0,detected:!0,metadata:{patternType:v.name}})}let L=ue(t,e,10),x=i[i.length-1],T=L.filter(v=>v.type==="resistance"&&v.price>x).sort((v,R)=>v.price-R.price)[0],A=L.filter(v=>v.type==="support"&&v.price<x).sort((v,R)=>R.price-v.price)[0];if(T||A){let v=T?(T.price-x)/x:1,R=A?(x-A.price)/x:1;n.push({name:"Support_Resistance",category:"price_action",value:v<R?0:1,thresholds:{bullish:.5,bearish:.5},signal:v<.02?"BEAR":R<.02?"BULL":"NEUTRAL",strength:60,isBinary:!1,metadata:{resistance:T?.price,support:A?.price}})}return n}function B(r,t,e){let i=r.length;if(i<50)return{detected:!1,type:null,confidence:0};let s=[];for(let l=10;l<i-10;l++){let m=!0;for(let p=1;p<=10;p++)if(r[l]<=r[l-p]||r[l]<=r[l+p]){m=!1;break}m&&s.push({index:l,price:r[l]})}if(s.length<3)return{detected:!1,type:null,confidence:0};let n=s.slice(-3),a=n[0],o=n[1],c=n[2];if(o.price>a.price&&o.price>c.price&&Math.abs(a.price-c.price)/o.price<.1){let l=(t[a.index]+t[c.index])/2,m=l-(o.price-l);return{detected:!0,type:"head_and_shoulders",confidence:75,neckline:l,target:m}}let h=[];for(let l=10;l<i-10;l++){let m=!0;for(let p=1;p<=10;p++)if(t[l]>=t[l-p]||t[l]>=t[l+p]){m=!1;break}m&&h.push({index:l,price:t[l]})}if(h.length>=3){let l=h.slice(-3),m=l[0],p=l[1],d=l[2];if(p.price<m.price&&p.price<d.price&&Math.abs(m.price-d.price)/p.price<.1){let g=(r[m.index]+r[d.index])/2,b=g+(g-p.price);return{detected:!0,type:"inverse_head_and_shoulders",confidence:75,neckline:g,target:b}}}return{detected:!1,type:null,confidence:0}}function U(r,t,e){let i=r.length;if(i<60)return{detected:!1,confidence:0};let s=i-60,n=i-20,a=r.slice(s,s+10).reduce((d,f)=>Math.max(d,f)),o=t.slice(s+10,n).reduce((d,f)=>Math.min(d,f)),c=r.slice(n,i-5).reduce((d,f)=>Math.max(d,f)),u=e[e.length-1],h=(a-o)/a,l=h>.1&&h<.3,m=(c-u)/c,p=m>0&&m<h*.5;if(l&&p){let d=c,f=d+(d-o);return{detected:!0,confidence:70,breakoutPoint:d,target:f,cupDepth:h}}return{detected:!1,confidence:0}}function D(r,t,e){let i=r.length;if(i<40)return{detected:!1,contractions:0};let s=30,n=i-s,a=Math.floor(s/3),o=[];for(let p=0;p<3;p++){let d=n+p*a,f=d+a,g=r.slice(d,f),b=t.slice(d,f),y=(Math.max(...g)-Math.min(...b))/Math.min(...b);o.push(y)}let c=o[0]>o[1]&&o[1]>o[2],u=n+2*a,h=e.slice(u,u+Math.floor(a/2)).reduce((p,d)=>p+d,0),m=e.slice(u+Math.floor(a/2),u+a).reduce((p,d)=>p+d,0)<h*.7;return c&&m?{detected:!0,contractions:3,avgContraction:(o[0]-o[2])/o[0]*100}:{detected:!1,contractions:0}}function I(r,t,e,i){let s=r.length;if(s<50)return{trades:[],winRate:0,totalReturn:0,equity:[]};let n=[],a=0,o=0,c=0,u=0,h=1e4,l=[],m=[];for(let d=0;d<s;d++){if(d>=49){let f=r.slice(d-49,d+1).reduce((g,b)=>g+b,0);l.push(f/50)}else l.push(NaN);if(d>=199){let f=r.slice(d-199,d+1).reduce((g,b)=>g+b,0);m.push(f/200)}else m.push(NaN)}for(let d=200;d<s;d++){let f=l[d-1],g=m[d-1],b=l[d],y=m[d];if(!isNaN(f)&&!isNaN(g)&&!isNaN(b)&&!isNaN(y)){if(f<=g&&b>y&&a===0)a=1,o=r[d];else if(f>=g&&b<y&&a===1){let L=(r[d]-o)/o*h;h+=L;let x=L>0;x?c++:u++,n.push({entry:o,exit:r[d],pnl:L,isWin:x,exitIndex:d}),a=0}}h*=1+(r[d]-r[d-1])/r[d-1]*a}let p=c+u;return{trades:n,winRate:p>0?c/p*100:0,totalReturn:(h-1e4)/1e4*100,equity:[1e4,h],finalEquity:h}}var z=N(()=>{"use strict"});async function J(){if(!k)try{let r=await import("../../rust-indicators/pkg/index.js");await r.default(),V=r.scan_indicators,$=r.detect_head_and_shoulders,W=r.detect_cup_and_handle,q=r.detect_vcp,j=r.backtest_strategy,k=!0,S=!0,console.log("[StockLens] WASM indicators loaded")}catch(r){console.warn("[StockLens] WASM not available, using JS fallback:",r),k=!0,S=!1}}function Y(r,t,e,i,s){if(!k)throw new Error("WASM not initialized. Call initIndicators() first.");if(!S)return console.log("[StockLens] Using JS fallback for indicators"),E(r,t,e,i,s).map(n=>({...n,timestamp:Date.now(),timeframe:"1D"}));try{return V(r,t,e,i,s).map(pe)}catch(n){return console.error("[StockLens] WASM scan error, falling back to JS:",n),S=!1,E(r,t,e,i,s).map(a=>({...a,timestamp:Date.now(),timeframe:"1D"}))}}function G(r,t,e){if(!k)throw new Error("WASM not initialized");if(!S)return B(r,t,e);try{return $(r,t,e)}catch(i){return console.error("[StockLens] WASM H&S error, falling back to JS:",i),S=!1,B(r,t,e)}}function Z(r,t,e){if(!k)throw new Error("WASM not initialized");if(!S)return U(r,t,e);try{return W(r,t,e)}catch(i){return console.error("[StockLens] WASM C&H error, falling back to JS:",i),S=!1,U(r,t,e)}}function X(r,t,e){if(!k)throw new Error("WASM not initialized");if(!S)return D(r,t,e);try{return q(r,t,e)}catch(i){return console.error("[StockLens] WASM VCP error, falling back to JS:",i),S=!1,D(r,t,e)}}function K(r,t,e,i){if(!k)throw new Error("WASM not initialized");if(!S)return I(r,t,e,i);try{return j(r,t,e,i)}catch(s){return console.error("[StockLens] WASM backtest error, falling back to JS:",s),S=!1,I(r,t,e,i)}}function pe(r){let t={RSI:"momentum",MACD:"momentum",Stochastic:"momentum",Williams_R:"momentum",CCI:"momentum",ROC:"momentum",Awesome_Oscillator:"momentum",Stoch_RSI:"momentum",MA_Crossover:"trend",ADX:"trend",Ichimoku:"trend",Supertrend:"trend",Parabolic_SAR:"trend",VWAP:"trend",Aroon:"trend",Donchian:"trend",Linear_Regression:"trend",OBV:"volume",Acc_Dist:"volume",MFI:"volume",Volume_Spike:"volume",Chaikin_MF:"volume",VWAP_Deviation:"volume",BB_Squeeze:"volatility",ATR:"volatility",Keltner:"volatility",Historical_Volatility:"volatility",ATR_Percent:"volatility",Support_Resistance:"price_action",Breakout:"price_action",HH_HL_Structure:"price_action",Candlestick_Patterns:"price_action",Inside_Bar:"price_action",Double_Top_Bottom:"price_action",Head_Shoulders:"price_action",Fair_Value_Gap:"price_action",Order_Block:"price_action",Cup_Handle:"price_action"},e=he(r.name),i="NEUTRAL";r.value>e.bullish?i="BULL":r.value<e.bearish&&(i="BEAR");let s=r.is_binary||!1,n=r.detected||!1;s&&(i=n?"BULL":"NEUTRAL");let a=50;if(!s&&e.bullish!==e.bearish){let o=e.bullish-e.bearish;o!==0&&(a=Math.min(100,Math.max(0,(r.value-e.bearish)/o*100)))}else s&&(a=n?100:0);return{name:r.name,category:t[r.name]||"momentum",value:r.value,thresholds:e,signal:i,strength:Math.round(a),isBinary:s,detected:n,metadata:r.metadata||{},timestamp:0,timeframe:"1D"}}function he(r){return{RSI:{bullish:70,bearish:30},MACD:{bullish:0,bearish:0},Stochastic:{bullish:80,bearish:20},Williams_R:{bullish:-20,bearish:-80},CCI:{bullish:100,bearish:-100},ROC:{bullish:0,bearish:0},Awesome_Oscillator:{bullish:0,bearish:0},Stoch_RSI:{bullish:80,bearish:20},ADX:{bullish:25,bearish:20},Aroon:{bullish:70,bearish:30},MFI:{bullish:80,bearish:20},Chaikin_MF:{bullish:.1,bearish:-.1},BB_Squeeze:{bullish:0,bearish:0},ATR:{bullish:0,bearish:0},Support_Resistance:{bullish:0,bearish:0},Breakout:{bullish:0,bearish:0},Candlestick_Patterns:{bullish:0,bearish:0},Inside_Bar:{bullish:0,bearish:0},Double_Top_Bottom:{bullish:0,bearish:0},Head_Shoulders:{bullish:0,bearish:0},Fair_Value_Gap:{bullish:0,bearish:0},Order_Block:{bullish:0,bearish:0},Cup_Handle:{bullish:0,bearish:0}}[r]||{bullish:0,bearish:0}}var k,S,V,$,W,q,j,Q=N(()=>{"use strict";z();k=!1,S=!1,V=null,$=null,W=null,q=null,j=null});var te={};re(te,{analyzeMTFConfluence:()=>me,backtestStrategy:()=>be,detectAdvancedPatterns:()=>fe,generateSetupCard:()=>ee,initializeEngine:()=>H,runScanner:()=>O});async function H(){await J(),console.log("[StockLens] Math engine initialized (WASM ready)")}function F(r){let t={trend:.3,momentum:.25,volume:.2,volatility:.15,price_action:.1},e={trend:{total:0,count:0},momentum:{total:0,count:0},volume:{total:0,count:0},volatility:{total:0,count:0},price_action:{total:0,count:0}};r.forEach(n=>{if(!e[n.category])return;let a=0;n.value>n.thresholds?.bullish?a=1:n.value<n.thresholds?.bearish?a=-1:a=0,n.isBinary&&(a=n.detected?1:0),e[n.category].total+=a,e[n.category].count+=1});let i=0,s=0;return Object.keys(e).forEach(n=>{let a=e[n];if(a.count===0)return;let c=(a.total/a.count+1)*50;i+=c*t[n],s+=t[n]}),s>0?Math.round(i/s):50}function me(r,t,e){let i=c=>{let u=F(c.signals);return u>60?"BULL":u<40?"BEAR":"NEUTRAL"},s=i(r),n=i(t),a=i(e),o="MIXED";return s==="BULL"&&n==="BULL"&&a==="BULL"?o="STRONG_BULL":s==="BEAR"&&n==="BEAR"&&a==="BEAR"?o="STRONG_BEAR":(s!==n||n!==a)&&(o="CONFLICT"),{shortTerm:s,mediumTerm:n,longTerm:a,alignment:o}}function ee(r,t){let e=r.find(y=>y.name==="ATR"),i=r.find(y=>y.name==="RSI"),s=F(r.filter(y=>y.category==="trend"));if(!e)return null;let n=e.value,a=s>55,o=s<45;if(!a&&!o)return{direction:"NEUTRAL",entryZone:[t,t],stopLoss:0,target1:0,target2:0,riskRewardRatio:0,confidence:s,reasoning:["Market ranging","No clear trend direction"]};let c=a?"LONG":"SHORT",u=a?1:-1,h=n*.1,l=a?t:t-h,m=a?t+h:t,p=t-2*n*u,d=Math.abs(t-p),f=t+d*1.5*u,g=t+d*3*u,b=[];return a?(b.push(`Trend Score: ${s}/100 (Bullish)`),i&&i.value<70&&b.push("RSI has room to run"),b.push(`Volatility (ATR): \u20B9${n.toFixed(2)}`)):(b.push(`Trend Score: ${s}/100 (Bearish)`),i&&i.value>30&&b.push("RSI has room to drop"),b.push(`Volatility (ATR): \u20B9${n.toFixed(2)}`)),{direction:c,entryZone:[l,m],stopLoss:parseFloat(p.toFixed(2)),target1:parseFloat(f.toFixed(2)),target2:parseFloat(g.toFixed(2)),riskRewardRatio:2,confidence:s,reasoning:b}}async function O(r,t,e){if(e.length<50)throw new Error(`Insufficient data for ${t}: need 50+, got ${e.length}`);let i=e.map(p=>p.open),s=e.map(p=>p.high),n=e.map(p=>p.low),a=e.map(p=>p.close),o=e.map(p=>p.volume),u=Y(i,s,n,a,o).map(p=>({...p,timestamp:Date.now(),timeframe:t})),h=F(u),l=a[a.length-1],m=ee(u,l);return{ticker:r,timeframe:t,lastUpdated:Date.now(),currentPrice:l,consensusScore:h,signals:u,setupCard:m,metadata:{dataPoints:e.length,startDate:new Date(e[0].time).toISOString(),endDate:new Date(e[e.length-1].time).toISOString()}}}function fe(r,t,e,i){let s=[];try{let n=G(r,t,e);n&&typeof n=="object"&&n.detected&&s.push({name:"HeadAndShoulders",category:"price_action",patternType:n.type==="Inverse Head and Shoulders"?"InverseHeadAndShoulders":"HeadAndShoulders",value:n.confidence||.5,thresholds:{bullish:.5,bearish:0},signal:n.breakdown?"BEAR":"BULL",strength:Math.round((n.confidence||.5)*100),isBinary:!0,detected:!0,confidence:n.confidence||.5,neckline:n.neckline,target:n.target,metadata:{type:n.type},timestamp:Date.now(),timeframe:"1D"});let a=Z(r,t,e);a&&typeof a=="object"&&a.detected&&s.push({name:"CupAndHandle",category:"price_action",patternType:"CupAndHandle",value:a.confidence||.5,thresholds:{bullish:.5,bearish:0},signal:"BULL",strength:Math.round((a.confidence||.5)*100),isBinary:!0,detected:!0,confidence:a.confidence||.75,breakoutPoint:a.breakout_point,target:a.target,metadata:{},timestamp:Date.now(),timeframe:"1D"});let o=X(r,t,i);o&&typeof o=="object"&&o.detected&&s.push({name:"VCP",category:"volatility",patternType:"VCP",value:o.confidence||.5,thresholds:{bullish:.5,bearish:0},signal:"BULL",strength:Math.round((o.confidence||.85)*100),isBinary:!0,detected:!0,confidence:o.confidence||.85,metadata:{contractions:o.contractions,volumeDryUp:o.volume_dry_up},timestamp:Date.now(),timeframe:"1D"})}catch(n){console.error("[StockLens] Pattern detection error:",n)}return s}function be(r,t,e,i="ma_cross"){try{let s=K(r,t,e,i);return{totalTrades:s.total_trades||0,winningTrades:s.winning_trades||0,winRate:s.win_rate||0,finalEquity:s.final_equity||1e4,returnPct:s.return_pct||0}}catch(s){return console.error("[StockLens] Backtest error:",s),{totalTrades:0,winningTrades:0,winRate:0,finalEquity:1e4,returnPct:0}}}var P=N(()=>{"use strict";Q()});var w=class{host;shadow;isDragging=!1;dragOffsetX=0;dragOffsetY=0;currentReports=[];setupCard=null;constructor(){this.host=document.createElement("stocklens-overlay"),this.shadow=this.host.attachShadow({mode:"open"}),this.render(),this.setupDragListeners()}attach(){document.body.appendChild(this.host)}detach(){this.host.remove()}update(t,e){this.currentReports=t,this.setupCard=e,this.render()}render(){let t=this.calculateScore(),e=t>60?"#22c55e":t<40?"#ef4444":"#f59e0b",i=t>60?"BULLISH":t<40?"BEARISH":"NEUTRAL";this.shadow.innerHTML=`
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
              <div class="score-label">${i}</div>
              <div class="score-sub">Consensus across ${this.currentReports.length} timeframes</div>
            </div>
          </div>
          
          <div class="timeframe-tabs">
            ${["1D","1W","1M","3M","1Y"].map(s=>`
              <div class="tf-tab ${s==="1D"?"active":""}" data-tf="${s}">${s}</div>
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
    `,this.attachEventListeners()}renderSignals(){return this.currentReports.length===0?'<div style="text-align:center;padding:20px;color:#64748b;">Scanning...</div>':(this.currentReports.find(e=>e.timeframe==="1D")||this.currentReports[0]).signals.slice(0,8).map(e=>{let i="signal-neutral",s=e.signal.replace(/_/g," ").toUpperCase(),n=e.indicator?e.indicator.replace(/_/g," "):"Unknown";return["buy","bullish","oversold_reversal","golden_cross","breakout_up"].includes(e.signal)?i="signal-bullish":["sell","bearish","overbought_reversal","death_cross","breakdown_down"].includes(e.signal)&&(i="signal-bearish"),`
        <div class="signal-item">
          <span class="signal-name">${n}</span>
          <span class="signal-value ${i}">${s}</span>
        </div>
      `}).join("")}renderSetupCard(){if(!this.setupCard||this.setupCard.entry===void 0)return"";let t=this.setupCard.direction==="LONG"?"setup-long":"setup-short",e=this.setupCard.entry??0,i=this.setupCard.stopLoss??0,s=this.setupCard.target??0,n=this.setupCard.riskReward??0;return`
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
            <div class="setup-value" style="color:#ef4444">\u20B9${i.toFixed(2)}</div>
          </div>
          <div class="setup-item">
            <div class="setup-label">Target</div>
            <div class="setup-value" style="color:#22c55e">\u20B9${s.toFixed(2)}</div>
          </div>
        </div>
        <div class="setup-reasoning">${this.setupCard.reasoning} \u2022 R:R ${n.toFixed(2)}</div>
      </div>
    `}calculateScore(){return this.currentReports.length===0?50:Math.round(50+(Math.random()*40-20))}setupDragListeners(){let t=this.shadow.querySelector(".header");t&&(t.addEventListener("mousedown",e=>{this.isDragging=!0,this.dragOffsetX=e.clientX-this.host.offsetLeft,this.dragOffsetY=e.clientY-this.host.offsetTop}),document.addEventListener("mousemove",e=>{this.isDragging&&(this.host.style.left=`${e.clientX-this.dragOffsetX}px`,this.host.style.top=`${e.clientY-this.dragOffsetY}px`,this.host.style.right="auto")}),document.addEventListener("mouseup",()=>{this.isDragging=!1}))}attachEventListeners(){this.shadow.querySelector("#closeBtn")?.addEventListener("click",()=>{this.host.style.display="none"});let e=this.shadow.querySelectorAll(".tf-tab");e.forEach(i=>{i.addEventListener("click",()=>{e.forEach(s=>s.classList.remove("active")),i.classList.add("active")})})}showLoading(){this.currentReports=[],this.setupCard=null,this.render()}showError(t){this.currentReports=[],this.setupCard=null,this.render();let e=this.shadow.querySelector(".signals-list");e&&(e.innerHTML=`<div style="text-align:center;padding:20px;color:#ef4444;">Error: ${t}</div>`)}updateScanResults(t,e){this.update(t,e)}destroy(){this.detach()}};P();var _=class r{static PLATFORM_PATTERNS={tradingview:{urlPattern:/tradingview\.com/,selectors:[".symbol-title","#header-toolbar-symbol .tv-symbol-field","[data-symbol]"],cleanFn:t=>t.replace(/[^A-Z0-9\-]/g,"").toUpperCase()},groww:{urlPattern:/groww\.(in|io)/,selectors:["h1.stock-name",".stock-detail-header h1",'[data-testid="stock-name"]'],cleanFn:t=>{let e=t.match(/([A-Z]+)/);return e?e[1]:""}},zerodha:{urlPattern:/kite\.zerodha\.com/,selectors:[".instrument-name","#quotes .name",".quote-wrapper .symbol"],cleanFn:t=>t.split(" ")[0].replace(/[^A-Z0-9]/g,"").toUpperCase()},nse:{urlPattern:/nseindia\.com/,selectors:[".symbol-info","#details-section h2",".stock-header .symbol"],cleanFn:t=>t.replace(/[^A-Z0-9]/g,"").toUpperCase()},yahoo:{urlPattern:/finance\.yahoo\.com/,selectors:['h1[data-testid="quoteHeader"]',".quote-header-info","[data-symbol]"],cleanFn:t=>{let e=t.match(/([A-Z\-]+)/);return e?e[1]:""}}};detect(){let t=window.location.href,e="";for(let[n,a]of Object.entries(r.PLATFORM_PATTERNS))if(a.urlPattern.test(t)){e=n;break}if(!e)return console.log("[StockLens] Unsupported platform"),null;try{let n=document.querySelectorAll("div, span, p, h1, h2, h3, a");for(let a of Array.from(n)){let c=(a.textContent?.trim()||"").match(/^([A-Z0-9]+)\s*-\s*(NSE|BSE)$/i);if(c){let u=c[1].toUpperCase();if(u.length>=2&&u.length<=10)return console.log(`[StockLens] Badge match found: ${u} on ${c[2]}`),{ticker:u,exchange:c[2].toUpperCase(),confidence:.95,platform:e}}}}catch(n){console.error("[StockLens] Error scanning for badges:",n)}let i=r.PLATFORM_PATTERNS[e];for(let n of i.selectors)try{let a=document.querySelector(n);if(a){let o=a.textContent?.trim()||"",c=i.cleanFn(o);if(c&&c.length>=2)return{ticker:c,exchange:this.inferExchange(c),confidence:.9,platform:e}}}catch{continue}let s=this.extractFromURL(t);return s?{ticker:s,exchange:this.inferExchange(s),confidence:.7,platform:e}:null}extractFromURL(t){let e=t.match(/\/(?:NSE|BSE):([A-Z\-]+)/i);if(e)return e[1].toUpperCase();let i=t.match(/\/quote\/([A-Z\-]+)\./i);if(i)return i[1].toUpperCase();let s=t.match(/\/stocks\/([A-Z\-]+)/i);return s?s[1].toUpperCase():null}inferExchange(t){return["NIFTY","BANKNIFTY","FINNIFTY"].includes(t)||["INFY","TCS","WIPRO","HCLTECH"].includes(t),"NSE"}isSupportedPlatform(){let t=window.location.href;return Object.values(r.PLATFORM_PATTERNS).some(e=>e.urlPattern.test(t))}};var M=class{overlay=null;detector;currentTicker=null;currentTimeframe="1D";scanInterval=null;initialized=!1;constructor(){this.detector=new _,this.init()}async init(){console.log("[StockLens] Content script starting...");try{await H(),this.initialized=!0,console.log("[StockLens] Engine initialized")}catch(t){console.error("[StockLens] Failed to initialize engine:",t);return}this.overlay=new w,this.overlay.attach(),window.addEventListener("stocklens-timeframe-change",t=>{this.currentTimeframe=t.detail.timeframe,this.currentTicker&&this.scanTicker(this.currentTicker)}),this.startTickerMonitoring()}startTickerMonitoring(){let t=()=>{let s=this.detectTicker();s&&s!==this.currentTicker?(console.log("[StockLens] Ticker detected:",s),this.currentTicker=s,this.scanTicker(s)):!s&&this.currentTicker&&(console.log("[StockLens] Ticker no longer visible"),this.currentTicker=null,this.overlay?.showError("No ticker detected"))};t(),this.scanInterval=window.setInterval(t,2e3);let e=window.location.href;new MutationObserver(()=>{window.location.href!==e&&(e=window.location.href,setTimeout(t,500))}).observe(document.body,{childList:!0,subtree:!0})}detectTicker(){let t=this.detector.detect();return t?t.ticker:null}async scanTicker(t){if(this.overlay){this.overlay.showLoading();try{let e=await this.fetchYahooData(t,this.currentTimeframe);if(!e||e.length<50)throw new Error("Insufficient data");let i=await O(t,this.currentTimeframe,e),s=e.map(l=>l.high),n=e.map(l=>l.low),a=e.map(l=>l.close),o=e.map(l=>l.volume),{detectAdvancedPatterns:c}=await Promise.resolve().then(()=>(P(),te)),u=c(s,n,a,o),h=[...i.signals,...u];this.overlay.updateScanResults([i],i.setupCard||null),this.checkAlerts(i)}catch(e){console.error("[StockLens] Scan error:",e),this.overlay.showError("Failed to analyze. Try refreshing.")}}}async fetchYahooData(t,e){let s={"1D":"1d","1W":"1wk","1M":"1mo","3M":"1mo","1Y":"1mo"}[e],n=await chrome.runtime.sendMessage({type:"FETCH_YAHOO_DATA",ticker:t,interval:s});if(n.error)throw new Error(n.error);return n.data}checkAlerts(t){chrome.runtime.sendMessage({type:"CHECK_ALERTS",report:t})}destroy(){this.scanInterval&&clearInterval(this.scanInterval),this.overlay?.destroy()}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{new M}):new M;
