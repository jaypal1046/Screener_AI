var ce=Object.defineProperty;var F=(o,e)=>()=>(o&&(e=o(o=0)),e);var le=(o,e)=>{for(var t in e)ce(o,t,{get:e[t],enumerable:!0})};function de(o,e=14){let t=[],n=0,i=0;for(let r=0;r<o.length;r++){if(r===0){t.push(NaN);continue}let s=o[r]-o[r-1];if(r<e)s>0?n+=s:i-=s,t.push(NaN);else if(r===e){s>0?n+=s:i-=s;let a=n/e,c=i/e,l=c===0?100:a/c;t.push(100-100/(1+l))}else{let a=(n*(e-1)+Math.max(s,0))/e,c=(i*(e-1)+Math.abs(Math.min(s,0)))/e;n=a,i=c;let l=c===0?100:a/c;t.push(100-100/(1+l))}}return t}function ue(o,e=12,t=26,n=9){let i=$(o,e),r=$(o,t),s=[];for(let u=0;u<o.length;u++)s.push(i[u]-r[u]);let a=s.filter(u=>!isNaN(u)),c=$(a,n),l=[];for(let u=0;u<s.length;u++)isNaN(s[u])||u>=c.length&&isNaN(c[u])?l.push(NaN):l.push(s[u]-(c[u]||0));return{macdLine:s,signalLine:c,histogram:l}}function $(o,e){let t=[],n=2/(e+1),i=0;for(let r=0;r<e&&r<o.length;r++)i+=o[r];for(let r=0;r<o.length;r++)r<e-1?t.push(NaN):r===e-1?t.push(i/e):t.push((o[r]-t[r-1])*n+t[r-1]);return t}function pe(o,e=20,t=2){let n=[],i=[],r=[];for(let s=0;s<o.length;s++){if(s<e-1){n.push(NaN),i.push(NaN),r.push(NaN);continue}let a=o.slice(s-e+1,s+1),c=a.reduce((h,p)=>h+p,0)/e,u=a.map(h=>Math.pow(h-c,2)).reduce((h,p)=>h+p,0)/e,d=Math.sqrt(u);i.push(c),n.push(c+t*d),r.push(c-t*d)}return{upper:n,middle:i,lower:r}}function he(o,e,t,n=14){let i=[],r=[];for(let a=0;a<o.length;a++)if(a===0)i.push(o[a]-e[a]);else{let c=o[a]-e[a],l=Math.abs(o[a]-t[a-1]),u=Math.abs(e[a]-t[a-1]);i.push(Math.max(c,l,u))}let s=0;for(let a=0;a<n&&a<i.length;a++)s+=i[a];for(let a=0;a<i.length;a++)a<n-1?r.push(NaN):a===n-1?r.push(s/n):r.push((r[a-1]*(n-1)+i[a])/n);return r}function me(o,e){let t=[e[0]];for(let n=1;n<o.length;n++)o[n]>o[n-1]?t.push(t[n-1]+e[n]):o[n]<o[n-1]?t.push(t[n-1]-e[n]):t.push(t[n-1]);return t}function fe(o,e,t,n){let i=[];for(let r=1;r<o.length;r++){let s=o[r-1],a=n[r-1],c=o[r],l=n[r],u=e[r],d=t[r],h=Math.abs(l-c),p=u-d,m=u-Math.max(c,l),b=Math.min(c,l)-d;l>c&&a<s&&c<a&&l>s?i.push({name:"Engulfing",index:r,bullish:!0}):l<c&&a>s&&c>a&&l<s&&i.push({name:"Engulfing",index:r,bullish:!1}),h<p*.1&&i.push({name:"Doji",index:r,bullish:!1}),b>h*2&&m<h*.5&&l>c&&i.push({name:"Hammer",index:r,bullish:!0}),m>h*2&&b<h*.5&&l<c&&i.push({name:"ShootingStar",index:r,bullish:!1}),u<e[r-1]&&d>t[r-1]&&i.push({name:"InsideBar",index:r,bullish:!1})}return i}function be(o,e,t=10){let n=[];for(let i=t;i<o.length-t;i++){let r=!0,s=!0;for(let a=i-t;a<=i+t;a++)a!==i&&(o[a]>=o[i]&&(r=!1),e[a]<=e[i]&&(s=!1));r?n.push({price:o[i],type:"resistance",touches:1}):s&&n.push({price:e[i],type:"support",touches:1})}return ge(n,.02)}function ge(o,e){let t=[];for(let n of o){let i=!1;for(let r of t)if(Math.abs(r.price-n.price)/r.price<e){r.touches++,r.price=(r.price*r.touches+n.price)/(r.touches+1),i=!0;break}i||t.push({...n})}return t.sort((n,i)=>i.touches-n.touches)}function I(o,e,t,n,i){let r=[],s=de(n,14),a=s[s.length-1];isNaN(a)||r.push({name:"RSI",category:"momentum",value:a,thresholds:{bullish:70,bearish:30},signal:a>70?"BULL":a<30?"BEAR":"NEUTRAL",strength:Math.round((a-30)/40*100),isBinary:!1});let c=ue(n),l=c.histogram[c.histogram.length-1],u=c.histogram[c.histogram.length-2];!isNaN(l)&&!isNaN(u)&&r.push({name:"MACD",category:"momentum",value:l,thresholds:{bullish:0,bearish:0},signal:l>0?"BULL":"BEAR",strength:Math.abs(l)*100,isBinary:!1,metadata:{crossover:u<0&&l>0||u>0&&l<0}});let d=pe(n,20,2),h=(d.upper[d.upper.length-1]-d.lower[d.lower.length-1])/d.middle[d.middle.length-1];isNaN(h)||r.push({name:"BB_Squeeze",category:"volatility",value:h,thresholds:{bullish:.1,bearish:.1},signal:h<.1?"BULL":"NEUTRAL",strength:h<.05?100:50,isBinary:!1});let p=he(e,t,n,14),m=p[p.length-1];isNaN(m)||r.push({name:"ATR",category:"volatility",value:m,thresholds:{bullish:0,bearish:0},signal:"NEUTRAL",strength:50,isBinary:!1,metadata:{stopLossDistance:m*1.5}});let b=me(n,i),v=b[b.length-1]>b[b.length-10]?"uptrend":"downtrend";r.push({name:"OBV",category:"volume",value:v==="uptrend"?1:0,thresholds:{bullish:.5,bearish:.5},signal:v==="uptrend"?"BULL":"BEAR",strength:60,isBinary:!1});let g=fe(o,e,t,n).filter(x=>x.index>=n.length-5);if(g.length>0){let x=g[g.length-1];r.push({name:"Candlestick_Pattern",category:"price_action",value:x.bullish?1:0,thresholds:{bullish:.5,bearish:.5},signal:x.bullish?"BULL":"BEAR",strength:70,isBinary:!0,detected:!0,metadata:{patternType:x.name}})}let k=be(e,t,10),S=n[n.length-1],M=k.filter(x=>x.type==="resistance"&&x.price>S).sort((x,C)=>x.price-C.price)[0],A=k.filter(x=>x.type==="support"&&x.price<S).sort((x,C)=>C.price-x.price)[0];if(M||A){let x=M?(M.price-S)/S:1,C=A?(S-A.price)/S:1;r.push({name:"Support_Resistance",category:"price_action",value:x<C?0:1,thresholds:{bullish:.5,bearish:.5},signal:x<.02?"BEAR":C<.02?"BULL":"NEUTRAL",strength:60,isBinary:!1,metadata:{resistance:M?.price,support:A?.price}})}return r}function U(o,e,t){let n=o.length;if(n<50)return{detected:!1,type:null,confidence:0};let i=[];for(let d=10;d<n-10;d++){let h=!0;for(let p=1;p<=10;p++)if(o[d]<=o[d-p]||o[d]<=o[d+p]){h=!1;break}h&&i.push({index:d,price:o[d]})}if(i.length<3)return{detected:!1,type:null,confidence:0};let r=i.slice(-3),s=r[0],a=r[1],c=r[2];if(a.price>s.price&&a.price>c.price&&Math.abs(s.price-c.price)/a.price<.1){let d=(e[s.index]+e[c.index])/2,h=d-(a.price-d);return{detected:!0,type:"head_and_shoulders",confidence:75,neckline:d,target:h}}let u=[];for(let d=10;d<n-10;d++){let h=!0;for(let p=1;p<=10;p++)if(e[d]>=e[d-p]||e[d]>=e[d+p]){h=!1;break}h&&u.push({index:d,price:e[d]})}if(u.length>=3){let d=u.slice(-3),h=d[0],p=d[1],m=d[2];if(p.price<h.price&&p.price<m.price&&Math.abs(h.price-m.price)/p.price<.1){let v=(o[h.index]+o[m.index])/2,f=v+(v-p.price);return{detected:!0,type:"inverse_head_and_shoulders",confidence:75,neckline:v,target:f}}}return{detected:!1,type:null,confidence:0}}function D(o,e,t){let n=o.length;if(n<60)return{detected:!1,confidence:0};let i=n-60,r=n-20,s=o.slice(i,i+10).reduce((m,b)=>Math.max(m,b)),a=e.slice(i+10,r).reduce((m,b)=>Math.min(m,b)),c=o.slice(r,n-5).reduce((m,b)=>Math.max(m,b)),l=t[t.length-1],u=(s-a)/s,d=u>.1&&u<.3,h=(c-l)/c,p=h>0&&h<u*.5;if(d&&p){let m=c,b=m+(m-a);return{detected:!0,confidence:70,breakoutPoint:m,target:b,cupDepth:u}}return{detected:!1,confidence:0}}function z(o,e,t){let n=o.length;if(n<40)return{detected:!1,contractions:0};let i=30,r=n-i,s=Math.floor(i/3),a=[];for(let p=0;p<3;p++){let m=r+p*s,b=m+s,v=o.slice(m,b),f=e.slice(m,b),g=(Math.max(...v)-Math.min(...f))/Math.min(...f);a.push(g)}let c=a[0]>a[1]&&a[1]>a[2],l=r+2*s,u=t.slice(l,l+Math.floor(s/2)).reduce((p,m)=>p+m,0),h=t.slice(l+Math.floor(s/2),l+s).reduce((p,m)=>p+m,0)<u*.7;return c&&h?{detected:!0,contractions:3,avgContraction:(a[0]-a[2])/a[0]*100}:{detected:!1,contractions:0}}function P(o,e,t,n){let i=o.length;if(i<50)return{trades:[],winRate:0,totalReturn:0,equity:[]};let r=[],s=0,a=0,c=0,l=0,u=1e4,d=[],h=[];for(let m=0;m<i;m++){if(m>=49){let b=o.slice(m-49,m+1).reduce((v,f)=>v+f,0);d.push(b/50)}else d.push(NaN);if(m>=199){let b=o.slice(m-199,m+1).reduce((v,f)=>v+f,0);h.push(b/200)}else h.push(NaN)}for(let m=200;m<i;m++){let b=d[m-1],v=h[m-1],f=d[m],g=h[m];if(!isNaN(b)&&!isNaN(v)&&!isNaN(f)&&!isNaN(g)){if(b<=v&&f>g&&s===0)s=1,a=o[m];else if(b>=v&&f<g&&s===1){let k=(o[m]-a)/a*u;u+=k;let S=k>0;S?c++:l++,r.push({entry:a,exit:o[m],pnl:k,isWin:S,exitIndex:m}),s=0}}u*=1+(o[m]-o[m-1])/o[m-1]*s}let p=c+l;return{trades:r,winRate:p>0?c/p*100:0,totalReturn:(u-1e4)/1e4*100,equity:[1e4,u],finalEquity:u}}var q=F(()=>{"use strict"});async function Z(){if(!w)try{let o=await import("../../rust-indicators/pkg/index.js");await o.default(),W=o.scan_indicators,Y=o.detect_head_and_shoulders,G=o.detect_cup_and_handle,J=o.detect_vcp,X=o.backtest_strategy,w=!0,y=!0,console.log("[StockLens] WASM indicators loaded")}catch(o){console.warn("[StockLens] WASM not available, using JS fallback:",o),w=!0,y=!1}}function K(o,e,t,n,i){if(!w)throw new Error("WASM not initialized. Call initIndicators() first.");if(!y)return console.log("[StockLens] Using JS fallback for indicators"),I(o,e,t,n,i).map(r=>({...r,timestamp:Date.now(),timeframe:"1D"}));try{return W(o,e,t,n,i).map(ve)}catch(r){return console.error("[StockLens] WASM scan error, falling back to JS:",r),y=!1,I(o,e,t,n,i).map(s=>({...s,timestamp:Date.now(),timeframe:"1D"}))}}function Q(o,e,t){if(!w)throw new Error("WASM not initialized");if(!y)return U(o,e,t);try{return Y(o,e,t)}catch(n){return console.error("[StockLens] WASM H&S error, falling back to JS:",n),y=!1,U(o,e,t)}}function ee(o,e,t){if(!w)throw new Error("WASM not initialized");if(!y)return D(o,e,t);try{return G(o,e,t)}catch(n){return console.error("[StockLens] WASM C&H error, falling back to JS:",n),y=!1,D(o,e,t)}}function te(o,e,t){if(!w)throw new Error("WASM not initialized");if(!y)return z(o,e,t);try{return J(o,e,t)}catch(n){return console.error("[StockLens] WASM VCP error, falling back to JS:",n),y=!1,z(o,e,t)}}function ne(o,e,t,n){if(!w)throw new Error("WASM not initialized");if(!y)return P(o,e,t,n);try{return X(o,e,t,n)}catch(i){return console.error("[StockLens] WASM backtest error, falling back to JS:",i),y=!1,P(o,e,t,n)}}function ve(o){let e={RSI:"momentum",MACD:"momentum",Stochastic:"momentum",Williams_R:"momentum",CCI:"momentum",ROC:"momentum",Awesome_Oscillator:"momentum",Stoch_RSI:"momentum",MA_Crossover:"trend",ADX:"trend",Ichimoku:"trend",Supertrend:"trend",Parabolic_SAR:"trend",VWAP:"trend",Aroon:"trend",Donchian:"trend",Linear_Regression:"trend",OBV:"volume",Acc_Dist:"volume",MFI:"volume",Volume_Spike:"volume",Chaikin_MF:"volume",VWAP_Deviation:"volume",BB_Squeeze:"volatility",ATR:"volatility",Keltner:"volatility",Historical_Volatility:"volatility",ATR_Percent:"volatility",Support_Resistance:"price_action",Breakout:"price_action",HH_HL_Structure:"price_action",Candlestick_Patterns:"price_action",Inside_Bar:"price_action",Double_Top_Bottom:"price_action",Head_Shoulders:"price_action",Fair_Value_Gap:"price_action",Order_Block:"price_action",Cup_Handle:"price_action"},t=xe(o.name),n="NEUTRAL";o.value>t.bullish?n="BULL":o.value<t.bearish&&(n="BEAR");let i=o.is_binary||!1,r=o.detected||!1;i&&(n=r?"BULL":"NEUTRAL");let s=50;if(!i&&t.bullish!==t.bearish){let a=t.bullish-t.bearish;a!==0&&(s=Math.min(100,Math.max(0,(o.value-t.bearish)/a*100)))}else i&&(s=r?100:0);return{name:o.name,category:e[o.name]||"momentum",value:o.value,thresholds:t,signal:n,strength:Math.round(s),isBinary:i,detected:r,metadata:o.metadata||{},timestamp:0,timeframe:"1D"}}function xe(o){return{RSI:{bullish:70,bearish:30},MACD:{bullish:0,bearish:0},Stochastic:{bullish:80,bearish:20},Williams_R:{bullish:-20,bearish:-80},CCI:{bullish:100,bearish:-100},ROC:{bullish:0,bearish:0},Awesome_Oscillator:{bullish:0,bearish:0},Stoch_RSI:{bullish:80,bearish:20},ADX:{bullish:25,bearish:20},Aroon:{bullish:70,bearish:30},MFI:{bullish:80,bearish:20},Chaikin_MF:{bullish:.1,bearish:-.1},BB_Squeeze:{bullish:0,bearish:0},ATR:{bullish:0,bearish:0},Support_Resistance:{bullish:0,bearish:0},Breakout:{bullish:0,bearish:0},Candlestick_Patterns:{bullish:0,bearish:0},Inside_Bar:{bullish:0,bearish:0},Double_Top_Bottom:{bullish:0,bearish:0},Head_Shoulders:{bullish:0,bearish:0},Fair_Value_Gap:{bullish:0,bearish:0},Order_Block:{bullish:0,bearish:0},Cup_Handle:{bullish:0,bearish:0}}[o]||{bullish:0,bearish:0}}var w,y,W,Y,G,J,X,re=F(()=>{"use strict";q();w=!1,y=!1,W=null,Y=null,G=null,J=null,X=null});var se={};le(se,{analyzeMTFConfluence:()=>Se,backtestStrategy:()=>ke,detectAdvancedPatterns:()=>ye,generateSetupCard:()=>ie,initializeEngine:()=>H,runScanner:()=>V});async function H(){await Z(),console.log("[StockLens] Math engine initialized (WASM ready)")}function O(o){let e={trend:.3,momentum:.25,volume:.2,volatility:.15,price_action:.1},t={trend:{total:0,count:0},momentum:{total:0,count:0},volume:{total:0,count:0},volatility:{total:0,count:0},price_action:{total:0,count:0}};o.forEach(r=>{if(!t[r.category])return;let s=0;r.value>r.thresholds?.bullish?s=1:r.value<r.thresholds?.bearish?s=-1:s=0,r.isBinary&&(s=r.detected?1:0),t[r.category].total+=s,t[r.category].count+=1});let n=0,i=0;return Object.keys(t).forEach(r=>{let s=t[r];if(s.count===0)return;let c=(s.total/s.count+1)*50;n+=c*e[r],i+=e[r]}),i>0?Math.round(n/i):50}function Se(o,e,t){let n=c=>{let l=O(c.signals);return l>60?"BULL":l<40?"BEAR":"NEUTRAL"},i=n(o),r=n(e),s=n(t),a="MIXED";return i==="BULL"&&r==="BULL"&&s==="BULL"?a="STRONG_BULL":i==="BEAR"&&r==="BEAR"&&s==="BEAR"?a="STRONG_BEAR":(i!==r||r!==s)&&(a="CONFLICT"),{shortTerm:i,mediumTerm:r,longTerm:s,alignment:a}}function ie(o,e){let t=o.find(g=>g.name==="ATR"),n=o.find(g=>g.name==="RSI"),i=O(o.filter(g=>g.category==="trend"));if(!t)return null;let r=t.value,s=i>55,a=i<45;if(!s&&!a)return{direction:"NEUTRAL",entryZone:[e,e],stopLoss:0,target1:0,target2:0,riskRewardRatio:0,confidence:i,reasoning:["Market ranging","No clear trend direction"]};let c=s?"LONG":"SHORT",l=s?1:-1,u=r*.1,d=s?e:e-u,h=s?e+u:e,p=e-2*r*l,m=Math.abs(e-p),b=e+m*1.5*l,v=e+m*3*l,f=[];return s?(f.push(`Trend Score: ${i}/100 (Bullish)`),n&&n.value<70&&f.push("RSI has room to run"),f.push(`Volatility (ATR): \u20B9${r.toFixed(2)}`)):(f.push(`Trend Score: ${i}/100 (Bearish)`),n&&n.value>30&&f.push("RSI has room to drop"),f.push(`Volatility (ATR): \u20B9${r.toFixed(2)}`)),{direction:c,entryZone:[d,h],stopLoss:parseFloat(p.toFixed(2)),target1:parseFloat(b.toFixed(2)),target2:parseFloat(v.toFixed(2)),riskRewardRatio:2,confidence:i,reasoning:f}}async function V(o,e,t){if(t.length<50)throw new Error(`Insufficient data for ${e}: need 50+, got ${t.length}`);let n=t.map(p=>p.open),i=t.map(p=>p.high),r=t.map(p=>p.low),s=t.map(p=>p.close),a=t.map(p=>p.volume),l=K(n,i,r,s,a).map(p=>({...p,timestamp:Date.now(),timeframe:e})),u=O(l),d=s[s.length-1],h=ie(l,d);return{ticker:o,timeframe:e,lastUpdated:Date.now(),currentPrice:d,consensusScore:u,signals:l,setupCard:h,metadata:{dataPoints:t.length,startDate:new Date(t[0].time).toISOString(),endDate:new Date(t[t.length-1].time).toISOString()}}}function ye(o,e,t,n){let i=[];try{let r=Q(o,e,t);r&&typeof r=="object"&&r.detected&&i.push({name:"HeadAndShoulders",category:"price_action",patternType:r.type==="Inverse Head and Shoulders"?"InverseHeadAndShoulders":"HeadAndShoulders",value:r.confidence||.5,thresholds:{bullish:.5,bearish:0},signal:r.breakdown?"BEAR":"BULL",strength:Math.round((r.confidence||.5)*100),isBinary:!0,detected:!0,confidence:r.confidence||.5,neckline:r.neckline,target:r.target,metadata:{type:r.type},timestamp:Date.now(),timeframe:"1D"});let s=ee(o,e,t);s&&typeof s=="object"&&s.detected&&i.push({name:"CupAndHandle",category:"price_action",patternType:"CupAndHandle",value:s.confidence||.5,thresholds:{bullish:.5,bearish:0},signal:"BULL",strength:Math.round((s.confidence||.5)*100),isBinary:!0,detected:!0,confidence:s.confidence||.75,breakoutPoint:s.breakout_point,target:s.target,metadata:{},timestamp:Date.now(),timeframe:"1D"});let a=te(o,e,n);a&&typeof a=="object"&&a.detected&&i.push({name:"VCP",category:"volatility",patternType:"VCP",value:a.confidence||.5,thresholds:{bullish:.5,bearish:0},signal:"BULL",strength:Math.round((a.confidence||.85)*100),isBinary:!0,detected:!0,confidence:a.confidence||.85,metadata:{contractions:a.contractions,volumeDryUp:a.volume_dry_up},timestamp:Date.now(),timeframe:"1D"})}catch(r){console.error("[StockLens] Pattern detection error:",r)}return i}function ke(o,e,t,n="ma_cross"){try{let i=ne(o,e,t,n);return{totalTrades:i.total_trades||0,winningTrades:i.winning_trades||0,winRate:i.win_rate||0,finalEquity:i.final_equity||1e4,returnPct:i.return_pct||0}}catch(i){return console.error("[StockLens] Backtest error:",i),{totalTrades:0,winningTrades:0,winRate:0,finalEquity:1e4,returnPct:0}}}var j=F(()=>{"use strict";re()});var B=class{host;shadow;isDragging=!1;dragOffsetX=0;dragOffsetY=0;currentReports=[];setupCard=null;constructor(){this.host=document.createElement("stocklens-overlay"),this.shadow=this.host.attachShadow({mode:"open"}),this.render(),this.setupDragListeners()}attach(){document.body.appendChild(this.host)}detach(){this.host.remove()}update(e,t){this.currentReports=e,this.setupCard=t,this.render()}render(){let e=this.calculateScore(),t=e>60?"#22c55e":e<40?"#ef4444":"#f59e0b",n=e>60?"BULLISH":e<40?"BEARISH":"NEUTRAL";this.shadow.innerHTML=`
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
          background: ${t};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 800;
          box-shadow: 0 0 20px ${t}66;
        }
        
        .score-info {
          flex: 1;
          margin-left: 16px;
        }
        
        .score-label {
          font-size: 18px;
          font-weight: 700;
          color: ${t};
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
            <div class="score-circle">${e}</div>
            <div class="score-info">
              <div class="score-label">${n}</div>
              <div class="score-sub">Consensus across ${this.currentReports.length} timeframes</div>
            </div>
          </div>
          
          <div class="timeframe-tabs">
            ${["1D","1W","1M","3M","1Y"].map(i=>`
              <div class="tf-tab ${i==="1D"?"active":""}" data-tf="${i}">${i}</div>
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
    `,this.attachEventListeners()}renderSignals(){return this.currentReports.length===0?'<div style="text-align:center;padding:20px;color:#64748b;">Scanning...</div>':(this.currentReports.find(t=>t.timeframe==="1D")||this.currentReports[0]).signals.slice(0,8).map(t=>{let n="signal-neutral",i=t.signal.replace(/_/g," ").toUpperCase(),r=t.indicator?t.indicator.replace(/_/g," "):"Unknown";return["buy","bullish","oversold_reversal","golden_cross","breakout_up"].includes(t.signal)?n="signal-bullish":["sell","bearish","overbought_reversal","death_cross","breakdown_down"].includes(t.signal)&&(n="signal-bearish"),`
        <div class="signal-item">
          <span class="signal-name">${r}</span>
          <span class="signal-value ${n}">${i}</span>
        </div>
      `}).join("")}renderSetupCard(){if(!this.setupCard||this.setupCard.entry===void 0)return"";let e=this.setupCard.direction==="LONG"?"setup-long":"setup-short",t=this.setupCard.entry??0,n=this.setupCard.stopLoss??0,i=this.setupCard.target??0,r=this.setupCard.riskReward??0;return`
      <div class="setup-card">
        <div class="setup-header">
          <span class="setup-direction ${e}">${this.setupCard.direction}</span>
          <span class="setup-confidence">${this.setupCard.confidence} Confidence</span>
        </div>
        <div class="setup-grid">
          <div class="setup-item">
            <div class="setup-label">Entry</div>
            <div class="setup-value">\u20B9${t.toFixed(2)}</div>
          </div>
          <div class="setup-item">
            <div class="setup-label">Stop Loss</div>
            <div class="setup-value" style="color:#ef4444">\u20B9${n.toFixed(2)}</div>
          </div>
          <div class="setup-item">
            <div class="setup-label">Target</div>
            <div class="setup-value" style="color:#22c55e">\u20B9${i.toFixed(2)}</div>
          </div>
        </div>
        <div class="setup-reasoning">${this.setupCard.reasoning} \u2022 R:R ${r.toFixed(2)}</div>
      </div>
    `}calculateScore(){return this.currentReports.length===0?50:Math.round(50+(Math.random()*40-20))}setupDragListeners(){let e=this.shadow.querySelector(".header");e&&(e.addEventListener("mousedown",t=>{this.isDragging=!0,this.dragOffsetX=t.clientX-this.host.offsetLeft,this.dragOffsetY=t.clientY-this.host.offsetTop}),document.addEventListener("mousemove",t=>{this.isDragging&&(this.host.style.left=`${t.clientX-this.dragOffsetX}px`,this.host.style.top=`${t.clientY-this.dragOffsetY}px`,this.host.style.right="auto")}),document.addEventListener("mouseup",()=>{this.isDragging=!1}))}attachEventListeners(){this.shadow.querySelector("#closeBtn")?.addEventListener("click",()=>{this.host.style.display="none"});let t=this.shadow.querySelectorAll(".tf-tab");t.forEach(n=>{n.addEventListener("click",()=>{t.forEach(i=>i.classList.remove("active")),n.classList.add("active")})})}showLoading(){this.currentReports=[],this.setupCard=null,this.render()}showError(e){this.currentReports=[],this.setupCard=null,this.render();let t=this.shadow.querySelector(".signals-list");t&&(t.innerHTML=`<div style="text-align:center;padding:20px;color:#ef4444;">Error: ${e}</div>`)}updateScanResults(e,t){this.update(e,t)}destroy(){this.detach()}};j();var _=class o{static PLATFORM_PATTERNS={tradingview:{urlPattern:/tradingview\.com/,selectors:[".symbol-title","#header-toolbar-symbol .tv-symbol-field","[data-symbol]"],cleanFn:e=>e.replace(/[^A-Z0-9\-]/g,"").toUpperCase()},groww:{urlPattern:/groww\.(in|io)/,selectors:["h1.stock-name",".stock-detail-header h1",'[data-testid="stock-name"]'],cleanFn:e=>{let t=e.match(/([A-Z]+)/);return t?t[1]:""}},zerodha:{urlPattern:/kite\.zerodha\.com/,selectors:[".instrument-name","#quotes .name",".quote-wrapper .symbol"],cleanFn:e=>e.split(" ")[0].replace(/[^A-Z0-9]/g,"").toUpperCase()},nse:{urlPattern:/nseindia\.com/,selectors:[".symbol-info","#details-section h2",".stock-header .symbol"],cleanFn:e=>e.replace(/[^A-Z0-9]/g,"").toUpperCase()},yahoo:{urlPattern:/finance\.yahoo\.com/,selectors:['h1[data-testid="quoteHeader"]',".quote-header-info","[data-symbol]"],cleanFn:e=>{let t=e.match(/([A-Z\-]+)/);return t?t[1]:""}}};detect(){let e=window.location.href,t="";for(let[r,s]of Object.entries(o.PLATFORM_PATTERNS))if(s.urlPattern.test(e)){t=r;break}if(!t)return console.log("[StockLens] Unsupported platform"),null;try{let r=document.querySelectorAll("div, span, p, h1, h2, h3, a");for(let s of Array.from(r)){let c=(s.textContent?.trim()||"").match(/^([A-Z0-9]+)\s*-\s*(NSE|BSE)$/i);if(c){let l=c[1].toUpperCase();if(l.length>=2&&l.length<=10)return console.log(`[StockLens] Badge match found: ${l} on ${c[2]}`),{ticker:l,exchange:c[2].toUpperCase(),confidence:.95,platform:t}}}}catch(r){console.error("[StockLens] Error scanning for badges:",r)}let n=o.PLATFORM_PATTERNS[t];for(let r of n.selectors)try{let s=document.querySelector(r);if(s){let a=s.textContent?.trim()||"",c=n.cleanFn(a);if(c&&c.length>=2)return{ticker:c,exchange:this.inferExchange(c),confidence:.9,platform:t}}}catch{continue}let i=this.extractFromURL(e);return i?{ticker:i,exchange:this.inferExchange(i),confidence:.7,platform:t}:null}extractFromURL(e){let t=e.match(/\/(?:NSE|BSE):([A-Z\-]+)/i);if(t)return t[1].toUpperCase();let n=e.match(/\/quote\/([A-Z\-]+)\./i);if(n)return n[1].toUpperCase();let i=e.match(/\/stocks\/([A-Z\-]+)/i);return i?i[1].toUpperCase():null}inferExchange(e){return["NIFTY","BANKNIFTY","FINNIFTY"].includes(e)||["INFY","TCS","WIPRO","HCLTECH"].includes(e),"NSE"}isSupportedPlatform(){let e=window.location.href;return Object.values(o.PLATFORM_PATTERNS).some(t=>t.urlPattern.test(e))}};var we={rsi:1,macd:1.2,stochastic:1,roc:.8,ma_crossover:1.5,adx:1,parabolic_sar:1,vwap:1.2,obv:1.3,acc_dist:1.1,volume_spike:1.4,bb_squeeze:1.5,atr:.5,support_resistance:1.6,breakout:1.8,hh_hl_structure:1.4,candlestick_pattern:1.3,fair_value_gap:1.2,order_block:1.3},oe=["buy","bullish","oversold_reversal","golden_cross","breakout_up"],ae=["sell","bearish","overbought_reversal","death_cross","breakdown_down"],E=class{calculateConsensusScore(e){let t=0,n=0,i=0;if(e.forEach(s=>{s.signals.forEach(a=>{let c=a.indicator||a.name,l=we[c]||1;t+=l,oe.includes(a.signal)?n+=l:ae.includes(a.signal)&&(i+=l)})}),t===0)return 50;let r=(n-i)/t;return Math.round(50+r*50)}checkMTFConfluence(e){let t={};e.forEach(c=>{t[c.timeframe]=this.calculateConsensusScore([c])});let n=Object.values(t),i=n.reduce((c,l)=>c+l,0)/n.length,r=n.filter(c=>c>60).length,s=n.filter(c=>c<40).length,a=n.length;return r>a/2?{agreed:!0,direction:"bullish",strength:r}:s>a/a/2?{agreed:!0,direction:"bearish",strength:s}:{agreed:!1,direction:"neutral",strength:0}}generateAutoSetup(e,t){let n=e.find(f=>f.timeframe==="1D");if(!n)return null;let r=n.signals.find(f=>f.indicator==="atr"||f.name==="atr")?.value||t*.02,s=this.calculateConsensusScore([n]),a=s>=55,c=s<=45;if(!a&&!c)return null;let u=n.signals.find(f=>f.indicator==="support_resistance"||f.name==="support_resistance")?.metadata?.levels||[],d=t,h=0,p=0,m="Medium";if(a){let f=u.filter(S=>S<t).pop()||t-r*2;h=parseFloat((f-r*.5).toFixed(2));let g=u.find(S=>S>t),k=d-h;p=parseFloat(g?g.toFixed(2):(d+k*2).toFixed(2)),s>75&&(m="High"),s<60&&(m="Low")}else if(c){let f=u.find(S=>S>t)||t+r*2;h=parseFloat((f+r*.5).toFixed(2));let g=u.filter(S=>S<t).pop(),k=h-d;p=parseFloat(g?g.toFixed(2):(d-k*2).toFixed(2)),s<25&&(m="High"),s>40&&(m="Low")}let b=Math.abs((p-d)/(d-h)),v=a?`Bullish confluence with ${Math.round(r)} ATR buffer`:`Bearish confluence with ${Math.round(r)} ATR buffer`;return{direction:a?"LONG":"SHORT",entryZone:[d*.99,d*1.01],stopLoss:h,target1:p,target2:p+(p-d)*.5,riskRewardRatio:b,confidence:Math.round(s),reasoning:[v],entry:d,target:p,riskReward:b}}formatSignalsForUI(e){let t=[];return e.forEach(n=>{let i={timeframe:n.timeframe,score:this.calculateConsensusScore([n]),indicators:[]};n.signals.forEach(r=>{let s="gray";oe.includes(r.signal)&&(s="green"),ae.includes(r.signal)&&(s="red"),i.indicators.push({name:this.formatIndicatorName(r.indicator||r.name),value:r.value?.toFixed(2)||"-",signal:r.signal,color:s,description:r.metadata?.description||""})}),t.push(i)}),t}formatIndicatorName(e){return e.replace(/_/g," ").replace(/\b\w/g,t=>t.toUpperCase())}};var R=class{stockPages;screenerFilters;smartEngine;onUpdateCallback;constructor(){this.stockPages=new Map,this.screenerFilters=new Map,this.smartEngine=new E}addStockPage(e){this.stockPages.set(e.id,e),console.log(`[ScreenerManager] Added stock page: ${e.ticker}`)}removeStockPage(e){this.stockPages.delete(e),console.log(`[ScreenerManager] Removed stock page: ${e}`)}updateStockPageData(e,t,n){let i=this.stockPages.get(e);if(!i){console.warn(`[ScreenerManager] Page ${e} not found`);return}i.ohlcvData=t,i.report=n,i.lastUpdated=Date.now(),i.status="ready",this.screenerFilters.size>0&&this.runAllScreeners()}createScreener(e,t){let n={id:`screener_${Date.now()}`,name:e,conditions:t,enabled:!0};return this.screenerFilters.set(n.id,n),console.log(`[ScreenerManager] Created screener: ${e} with ${t.length} conditions`),this.stockPages.size>0&&this.runScreener(n.id),n}updateScreener(e,t){let n=this.screenerFilters.get(e);if(!n)throw new Error(`Screener ${e} not found`);Object.assign(n,t),console.log(`[ScreenerManager] Updated screener: ${n.name}`),n.enabled&&this.runScreener(e)}deleteScreener(e){this.screenerFilters.delete(e),console.log(`[ScreenerManager] Deleted screener: ${e}`)}getAllScreeners(){return Array.from(this.screenerFilters.values())}runScreener(e){let t=this.screenerFilters.get(e);if(!t||!t.enabled)return console.warn(`[ScreenerManager] Screener ${e} not found or disabled`),[];let n=[];for(let[,i]of this.stockPages){if(!i.report||i.status!=="ready")continue;let r=this.evaluateScreener(i,t);n.push(r)}return n.sort((i,r)=>r.matchScore-i.matchScore),console.log(`[ScreenerManager] Screener "${t.name}" found ${n.filter(i=>i.matchScore===100).length} perfect matches`),this.onUpdateCallback&&this.onUpdateCallback(n),n}runAllScreeners(){let e=new Map;for(let[t,n]of this.screenerFilters)if(n.enabled){let i=this.runScreener(t);e.set(t,i)}return e}evaluateScreener(e,t){if(!e.report)return{ticker:e.ticker,matchScore:0,matchedConditions:0,totalConditions:t.conditions.length,failedConditions:[]};let n=[],i=0;for(let s of t.conditions){let a=this.findSignalByIndicator(e.report,s.indicator,s.timeframe);if(!a){n.push({condition:s,actualValue:0,expectedValue:s.value});continue}this.evaluateCondition(a,s)?i++:n.push({condition:s,actualValue:a.value,expectedValue:s.value})}let r=t.conditions.length>0?Math.round(i/t.conditions.length*100):0;return{ticker:e.ticker,matchScore:r,matchedConditions:i,totalConditions:t.conditions.length,failedConditions:n,report:e.report}}findSignalByIndicator(e,t,n){return e.signals.find(i=>i.indicator===t&&i.timeframe===n)}evaluateCondition(e,t){let n=e.value;switch(t.operator){case"gt":return n>t.value;case"lt":return n<t.value;case"gte":return n>=t.value;case"lte":return n<=t.value;case"eq":return Math.abs(n-t.value)<.001;case"between":{let[i,r]=t.value;return n>=i&&n<=r}case"crosses_above":return n>t.value&&e.strength>50;case"crosses_below":return n<t.value&&e.strength>50;default:return!1}}setOnUpdate(e){this.onUpdateCallback=e}getAllStockPages(){return Array.from(this.stockPages.values())}getSummary(){let e=Array.from(this.stockPages.values());return{totalStocks:e.length,readyStocks:e.filter(t=>t.status==="ready").length,activeScreeners:Array.from(this.screenerFilters.values()).filter(t=>t.enabled).length,lastUpdated:e.length>0?Math.max(...e.map(t=>t.lastUpdated)):null}}exportToCSV(e){let t=this.runScreener(e),n=this.screenerFilters.get(e);if(!n)throw new Error(`Screener ${e} not found`);let i=["Ticker","Match Score (%)","Matched Conditions","Total Conditions","Current Price",...n.conditions.map(s=>`${s.indicator} (${s.timeframe})`)],r=t.map(s=>{let a=[s.ticker,s.matchScore.toString(),s.matchedConditions.toString(),s.totalConditions.toString(),s.report?.currentPrice.toString()||"N/A"];for(let c of n.conditions){let l=s.report?.signals.find(u=>u.indicator===c.indicator&&u.timeframe===c.timeframe);a.push(l?l.value.toFixed(2):"N/A")}return a.join(",")});return[i.join(","),...r].join(`
`)}clearAll(){this.stockPages.clear(),this.screenerFilters.clear(),console.log("[ScreenerManager] Cleared all data")}};var L=class{host;shadow;isVisible=!1;currentResults=[];currentScreeners=[];onScreenerAction;constructor(){this.host=document.createElement("stocklens-screener-ui"),this.shadow=this.host.attachShadow({mode:"open"}),this.render(),this.setupDragListeners()}attach(){document.body.appendChild(this.host)}detach(){this.host.remove()}show(){this.isVisible=!0,this.host.style.display="block",this.render()}hide(){this.isVisible=!1,this.host.style.display="none"}toggle(){this.isVisible?this.hide():this.show()}updateResults(e,t){this.currentResults=e,this.currentScreeners=t,this.render()}setOnScreenerAction(e){this.onScreenerAction=e}render(){let e=this.currentResults.filter(n=>n.matchScore===100),t=this.currentResults.filter(n=>n.matchScore>0&&n.matchScore<100);this.shadow.innerHTML=`
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
          display: ${this.isVisible?"block":"none"};
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
            <div class="logo">\u03A3</div>
            Stock Screener
          </div>
          <div class="header-actions">
            <button class="icon-btn" id="newScreenerBtn" title="New Screener">+</button>
            <button class="icon-btn" id="exportBtn" title="Export CSV">\u2B07</button>
            <button class="icon-btn" id="closeBtn" title="Close">\xD7</button>
          </div>
        </div>
        
        <div class="stats-bar">
          <div class="stat-item">
            <div class="stat-value">${e.length}</div>
            <div class="stat-label">Perfect Matches</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${t.length}</div>
            <div class="stat-label">Partial Matches</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${this.currentScreeners.length}</div>
            <div class="stat-label">Active Screeners</div>
          </div>
        </div>
        
        <div class="content">
          ${this.renderResultsSection("Perfect Matches (100%)",e,"perfect")}
          ${this.renderResultsSection("Partial Matches",t,"partial")}
          ${this.currentResults.length===0?this.renderEmptyState():""}
        </div>
      </div>
    `,this.attachEventListeners()}renderResultsSection(e,t,n){if(t.length===0)return"";let i=n==="perfect"?"badge-perfect":"badge-partial",r=n==="perfect"?"100%":`${t.length}`;return`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            ${e}
            <span class="badge ${i}">${r}</span>
          </div>
        </div>
        ${t.map(s=>this.renderResultItem(s)).join("")}
      </div>
    `}renderResultItem(e){let t=e.matchScore===100?"score-100":e.matchScore>=75?"score-high":e.matchScore>=50?"score-medium":"score-low",n=e.totalConditions-e.failedConditions.length,i=e.report?.signals.slice(0,5).map((a,c)=>{let l=e.failedConditions.find(h=>h.condition.indicator===a.indicator);return`<span class="condition-pill ${l?"condition-fail":"condition-pass"}">${l?"\u2717":"\u2713"} ${a.indicator}</span>`}).join("")||"",r=e.totalConditions>0?`
      <div class="math-display">
        <span class="formula">Match Score</span> = 
        <span class="variable">${n}</span>
        <span class="operator">\xF7</span>
        <span class="variable">${e.totalConditions}</span>
        <span class="operator">\xD7</span>
        <span class="variable">100</span>
        <span class="operator">=</span>
        <span class="variable">${e.matchScore}%</span>
      </div>
    `:"",s=e.report?`\u20B9${e.report.currentPrice.toFixed(2)}`:"N/A";return`
      <div class="result-item" data-ticker="${e.ticker}">
        <div class="result-header">
          <div class="result-ticker">${e.ticker}</div>
          <div class="result-score">
            <div class="score-circle ${t}">${e.matchScore}</div>
          </div>
        </div>
        
        <div class="conditions-bar">
          ${i}
        </div>
        
        ${r}
        
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">Price:</span>
            <span class="detail-value">${s}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Matched:</span>
            <span class="detail-value">${n}/${e.totalConditions} conditions</span>
          </div>
          ${e.failedConditions.length>0?`
            <div class="detail-row">
              <span class="detail-label">Failed:</span>
              <span class="detail-value">${e.failedConditions.map(a=>a.condition.indicator).join(", ")}</span>
            </div>
          `:""}
        </div>
      </div>
    `}renderEmptyState(){return`
      <div class="empty-state">
        <div class="empty-icon">\u{1F4CA}</div>
        <div class="empty-title">No Results Yet</div>
        <div class="empty-subtitle">
          Open stock pages and create screeners to see matches here.<br>
          Click + to create a new screener.
        </div>
      </div>
    `}setupDragListeners(){let e=this.shadow.querySelector(".header");e&&e.addEventListener("mousedown",t=>{let n=this.host.getBoundingClientRect(),i=t.clientX-n.left,r=t.clientY-n.top,s=c=>{this.host.style.left=`${c.clientX-i}px`,this.host.style.top=`${c.clientY-r}px`,this.host.style.right="auto"},a=()=>{document.removeEventListener("mousemove",s),document.removeEventListener("mouseup",a)};document.addEventListener("mousemove",s),document.addEventListener("mouseup",a)})}attachEventListeners(){this.shadow.querySelector("#closeBtn")?.addEventListener("click",()=>{this.hide()}),this.shadow.querySelector("#newScreenerBtn")?.addEventListener("click",()=>{this.onScreenerAction&&this.onScreenerAction("new_screener")}),this.shadow.querySelector("#exportBtn")?.addEventListener("click",()=>{this.onScreenerAction&&this.onScreenerAction("export_csv")}),this.shadow.querySelectorAll(".result-item").forEach(r=>{r.addEventListener("click",()=>{let s=r.getAttribute("data-ticker");s&&this.onScreenerAction&&this.onScreenerAction("select_stock",{ticker:s})})})}};var T=class{host;shadow;isVisible=!1;currentConfig={name:"",conditions:[]};onSaveCallback;onCloseCallback;availableIndicators=[{id:"RSI",name:"RSI (Relative Strength Index)",category:"momentum",defaultTimeframe:"1D"},{id:"MACD",name:"MACD",category:"trend",defaultTimeframe:"1D"},{id:"Stochastic",name:"Stochastic Oscillator",category:"momentum",defaultTimeframe:"1D"},{id:"ADX",name:"ADX (Trend Strength)",category:"trend",defaultTimeframe:"1D"},{id:"CCI",name:"CCI (Commodity Channel Index)",category:"momentum",defaultTimeframe:"1D"},{id:"Williams %R",name:"Williams %R",category:"momentum",defaultTimeframe:"1D"},{id:"ATR",name:"ATR (Volatility)",category:"volatility",defaultTimeframe:"1D"},{id:"Bollinger %B",name:"Bollinger %B",category:"volatility",defaultTimeframe:"1D"},{id:"Volume Ratio",name:"Volume Ratio",category:"volume",defaultTimeframe:"1D"},{id:"OBV",name:"On-Balance Volume",category:"volume",defaultTimeframe:"1D"},{id:"MFI",name:"Money Flow Index",category:"volume",defaultTimeframe:"1D"},{id:"ROC",name:"Rate of Change",category:"momentum",defaultTimeframe:"1D"},{id:"Aroon",name:"Aroon Indicator",category:"trend",defaultTimeframe:"1D"},{id:"Supertrend",name:"Supertrend",category:"trend",defaultTimeframe:"1D"}];operators=[{id:"gt",name:">",description:"Greater than"},{id:"lt",name:"<",description:"Less than"},{id:"gte",name:"\u2265",description:"Greater than or equal"},{id:"lte",name:"\u2264",description:"Less than or equal"},{id:"eq",name:"=",description:"Equal to"},{id:"between",name:"Between",description:"Value in range"},{id:"crosses_above",name:"Crosses Above",description:"Crosses above threshold"},{id:"crosses_below",name:"Crosses Below",description:"Crosses below threshold"}];timeframes=["1D","1W","1M","3M","1Y"];constructor(){this.host=document.createElement("stocklens-screener-builder"),this.shadow=this.host.attachShadow({mode:"open"}),this.render()}attach(){document.body.appendChild(this.host)}detach(){this.host.remove()}show(e){this.isVisible=!0,this.host.style.display="block",e?this.currentConfig={name:e.name,conditions:[...e.conditions]}:this.currentConfig={name:"",conditions:[]},this.render()}hide(){this.isVisible=!1,this.host.style.display="none"}setOnSave(e){this.onSaveCallback=e}setOnClose(e){this.onCloseCallback=e}render(){let e=this.currentConfig.conditions.length;this.shadow.innerHTML=`
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
          display: ${this.isVisible?"block":"none"};
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
            <div class="logo">\u03A3</div>
            Create Custom Screener
          </div>
          <button class="close-btn" id="closeBtn">\xD7</button>
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
            <div class="math-title">\u{1F4D0} Mathematical Scoring Formula</div>
            <div class="formula-display">
              Match Score = (<span class="formula-highlight">${e}</span> matched conditions \xF7 <span class="formula-highlight">${Math.max(e,1)}</span> total conditions) \xD7 100<br/>
              <br/>
              Stocks are ranked by match score: <span class="formula-highlight">100%</span> = Perfect Match, <span class="formula-highlight">0%</span> = No Match
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div class="condition-count">
            Total Conditions: <strong>${e}</strong>
          </div>
          <div class="actions">
            <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
            <button class="btn btn-primary" id="saveBtn" ${e===0?"disabled":""}>
              Save Screener
            </button>
          </div>
        </div>
      </div>
    `,this.attachEventListeners()}renderConditions(){return this.currentConfig.conditions.length===0?`
        <div class="empty-conditions">
          <div class="empty-icon">\u{1F4CA}</div>
          <div>No conditions added yet. Click "Add Condition" to get started.</div>
        </div>
      `:this.currentConfig.conditions.map((e,t)=>{let n=this.availableIndicators.map(c=>`<option value="${c.id}" ${e.indicator===c.id?"selected":""}>${c.name}</option>`).join(""),i=this.operators.map(c=>`<option value="${c.id}" ${e.operator===c.id?"selected":""}>${c.name}</option>`).join(""),r=this.timeframes.map(c=>`<option value="${c}" ${e.timeframe===c?"selected":""}>${c}</option>`).join(""),s=e.operator==="between",a=s?`${e.value[0]} - ${e.value[1]}`:e.value.toString();return`
        <div class="condition-row" data-index="${t}">
          <select class="select indicator-select">
            ${n}
          </select>
          <select class="select operator-select">
            ${i}
          </select>
          <input 
            type="text" 
            class="number-input value-input" 
            value="${a}"
            placeholder="${s?"min - max":"Value"}"
            data-operator="${e.operator}"
          />
          <select class="select timeframe-select">
            ${r}
          </select>
          <button class="remove-btn" title="Remove condition">\xD7</button>
        </div>
      `}).join("")}attachEventListeners(){this.shadow.querySelector("#closeBtn")?.addEventListener("click",()=>{this.hide(),this.onCloseCallback?.()}),this.shadow.querySelector("#cancelBtn")?.addEventListener("click",()=>{this.hide(),this.onCloseCallback?.()}),this.shadow.querySelector("#addConditionBtn")?.addEventListener("click",()=>{this.addCondition()}),this.shadow.querySelector("#saveBtn")?.addEventListener("click",()=>{this.save()}),this.shadow.querySelector("#screenerName")?.addEventListener("input",a=>{this.currentConfig.name=a.target.value});let s=this.shadow.querySelector("#conditionsList");s?.addEventListener("change",a=>{let c=a.target,l=c.closest(".condition-row");if(!l)return;let u=parseInt(l.getAttribute("data-index")||"0");if(c.classList.contains("indicator-select")){this.currentConfig.conditions[u].indicator=c.getAttribute("value")||"";let d=this.availableIndicators.find(h=>h.id===this.currentConfig.conditions[u].indicator);d&&(this.currentConfig.conditions[u].category=d.category)}else if(c.classList.contains("operator-select"))this.currentConfig.conditions[u].operator=c.getAttribute("value"),c.getAttribute("value")==="between"?this.currentConfig.conditions[u].value=[0,100]:this.currentConfig.conditions[u].value=50,this.render();else if(c.classList.contains("value-input")){let d=c.value;if(this.currentConfig.conditions[u].operator==="between"){let p=d.split("-").map(m=>parseFloat(m.trim()));p.length===2&&!isNaN(p[0])&&!isNaN(p[1])&&(this.currentConfig.conditions[u].value=[p[0],p[1]])}else{let p=parseFloat(d);isNaN(p)||(this.currentConfig.conditions[u].value=p)}}else c.classList.contains("timeframe-select")&&(this.currentConfig.conditions[u].timeframe=c.getAttribute("value"))}),s?.addEventListener("click",a=>{let c=a.target;if(c.classList.contains("remove-btn")){let l=c.closest(".condition-row");if(l){let u=parseInt(l.getAttribute("data-index")||"0");this.removeCondition(u)}}})}addCondition(){let e=this.availableIndicators[0],t={indicator:e.id,operator:"lt",value:30,timeframe:e.defaultTimeframe,category:e.category};this.currentConfig.conditions.push(t),this.render()}removeCondition(e){this.currentConfig.conditions.splice(e,1),this.render()}save(){let e=this.currentConfig.name.trim()||`Custom Screener ${Date.now()}`;if(this.currentConfig.conditions.length===0){alert("Please add at least one condition");return}let t={name:e,conditions:this.currentConfig.conditions};this.onSaveCallback?.(t),this.hide()}};var N=class{overlay=null;detector;screenerManager;screenerUI;screenerBuilder;currentTicker=null;currentTimeframe="1D";scanInterval=null;initialized=!1;pageId;constructor(){this.detector=new _,this.pageId=`page_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,this.screenerManager=new R,this.screenerUI=new L,this.screenerBuilder=new T,this.init()}async init(){console.log("[StockLens] Content script starting...");try{await H(),this.initialized=!0,console.log("[StockLens] Engine initialized")}catch(e){console.error("[StockLens] Failed to initialize engine:",e);return}this.overlay=new B,this.overlay.attach(),this.screenerUI.attach(),this.screenerBuilder.attach(),this.setupScreenerCallbacks(),window.addEventListener("stocklens-timeframe-change",e=>{this.currentTimeframe=e.detail.timeframe,this.currentTicker&&this.scanTicker(this.currentTicker)}),window.addEventListener("stocklens-toggle-screener",()=>{this.screenerUI.toggle()}),this.startTickerMonitoring()}startTickerMonitoring(){let e=()=>{let i=this.detectTicker();i&&i!==this.currentTicker?(console.log("[StockLens] Ticker detected:",i),this.currentTicker=i,this.scanTicker(i)):!i&&this.currentTicker&&(console.log("[StockLens] Ticker no longer visible"),this.currentTicker=null,this.overlay?.showError("No ticker detected"))};e(),this.scanInterval=window.setInterval(e,2e3);let t=window.location.href;new MutationObserver(()=>{window.location.href!==t&&(t=window.location.href,setTimeout(e,500))}).observe(document.body,{childList:!0,subtree:!0})}detectTicker(){let e=this.detector.detect();return e?e.ticker:null}async scanTicker(e){if(this.overlay){this.overlay.showLoading();try{let t=await this.fetchYahooData(e,this.currentTimeframe);if(!t||t.length<50)throw new Error("Insufficient data");let n=await V(e,this.currentTimeframe,t),i=t.map(h=>h.high),r=t.map(h=>h.low),s=t.map(h=>h.close),a=t.map(h=>h.volume),{detectAdvancedPatterns:c}=await Promise.resolve().then(()=>(j(),se)),l=c(i,r,s,a),u=[...n.signals,...l];this.overlay.updateScanResults([n],n.setupCard||null);let d={"1D":[],"1W":[],"1M":[],"3M":[],"1Y":[]};d[this.currentTimeframe]=t,this.registerStockPage(e,n,d),this.checkAlerts(n)}catch(t){console.error("[StockLens] Scan error:",t),this.overlay.showError("Failed to analyze. Try refreshing.")}}}registerStockPage(e,t,n){let i=this.detectExchange(),r={"1D":this.currentTimeframe==="1D"?n["1D"]||[]:[],"1W":this.currentTimeframe==="1W"?n["1W"]||[]:[],"1M":this.currentTimeframe==="1M"?n["1M"]||[]:[],"3M":this.currentTimeframe==="3M"?n["3M"]||[]:[],"1Y":this.currentTimeframe==="1Y"?n["1Y"]||[]:[]};r[this.currentTimeframe]=n[this.currentTimeframe]||[],this.screenerManager.addStockPage({id:this.pageId,ticker:e,exchange:i,url:window.location.href,lastUpdated:Date.now(),status:"ready",report:t,ohlcvData:r});let s=this.screenerManager.getAllScreeners();if(s.length>0){let a=this.screenerManager.runAllScreeners(),c=Array.from(a.values()).flat();this.screenerUI.updateResults(c,s)}}detectExchange(){let e=window.location.href;return e.includes("tradingview.com")?"TradingView":e.includes("groww")?"Groww":e.includes("zerodha")||e.includes("kite")?"Zerodha":e.includes("nseindia")?"NSE":e.includes("yahoo")?"Yahoo":"Unknown"}setupScreenerCallbacks(){this.screenerBuilder.setOnSave(e=>{let t=this.screenerManager.createScreener(e.name,e.conditions),n=this.screenerManager.runScreener(t.id),i=this.screenerManager.getAllScreeners();this.screenerUI.updateResults(n,i),this.screenerUI.show()}),this.screenerUI.setOnScreenerAction((e,t)=>{switch(e){case"new_screener":this.screenerBuilder.show();break;case"export_csv":{let n=this.screenerManager.getAllScreeners();if(n.length>0){let i=this.screenerManager.exportToCSV(n[0].id);this.downloadCSV(i,`${n[0].name}_results.csv`)}break}case"select_stock":t?.ticker&&console.log("[StockLens] User wants to view:",t.ticker);break}})}downloadCSV(e,t){let n=new Blob([e],{type:"text/csv"}),i=URL.createObjectURL(n),r=document.createElement("a");r.href=i,r.download=t,r.click(),URL.revokeObjectURL(i)}async fetchYahooData(e,t){let i={"1D":"1d","1W":"1wk","1M":"1mo","3M":"1mo","1Y":"1mo"}[t],r=await chrome.runtime.sendMessage({type:"FETCH_YAHOO_DATA",ticker:e,interval:i});if(r.error)throw new Error(r.error);return r.data}checkAlerts(e){chrome.runtime.sendMessage({type:"CHECK_ALERTS",report:e})}destroy(){this.scanInterval&&clearInterval(this.scanInterval),this.overlay?.destroy()}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{new N}):new N;
