use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

// ==================== RSI (Relative Strength Index) ====================

#[wasm_bindgen]
pub fn calculate_rsi(closes: &[f64], period: usize) -> Vec<f64> {
    let mut rsi = Vec::with_capacity(closes.len());
    let mut gains = 0.0;
    let mut losses = 0.0;

    for i in 0..closes.len() {
        if i == 0 {
            rsi.push(f64::NAN);
            continue;
        }

        let change = closes[i] - closes[i - 1];

        if i < period {
            if change > 0.0 {
                gains += change;
            } else {
                losses -= change;
            }
            rsi.push(f64::NAN);
        } else if i == period {
            if change > 0.0 {
                gains += change;
            } else {
                losses -= change;
            }

            let avg_gain = gains / period as f64;
            let avg_loss = losses / period as f64;
            let rs = if avg_loss == 0.0 { 100.0 } else { avg_gain / avg_loss };
            rsi.push(100.0 - (100.0 / (1.0 + rs)));
        } else {
            let smooth_gain = (gains * (period as f64 - 1.0) + change.max(0.0)) / period as f64;
            let smooth_loss = (losses * (period as f64 - 1.0) + change.abs().min(0.0).abs()) / period as f64;
            gains = smooth_gain;
            losses = smooth_loss;

            let rs = if smooth_loss == 0.0 { 100.0 } else { smooth_gain / smooth_loss };
            rsi.push(100.0 - (100.0 / (1.0 + rs)));
        }
    }

    rsi
}

// ==================== MACD (Moving Average Convergence Divergence) ====================

#[derive(Serialize, Deserialize)]
pub struct MacdResult {
    pub macd_line: Vec<f64>,
    pub signal_line: Vec<f64>,
    pub histogram: Vec<f64>,
}

fn calculate_ema(data: &[f64], period: usize) -> Vec<f64> {
    let mut ema = Vec::with_capacity(data.len());
    let multiplier = 2.0 / (period as f64 + 1.0);

    for i in 0..data.len() {
        if i < period - 1 {
            ema.push(f64::NAN);
        } else if i == period - 1 {
            let sum: f64 = data[0..period].iter().sum();
            ema.push(sum / period as f64);
        } else {
            let prev = ema[i - 1];
            ema.push((data[i] - prev) * multiplier + prev);
        }
    }

    ema
}

#[wasm_bindgen]
pub fn calculate_macd(closes: &[f64], fast: usize, slow: usize, signal: usize) -> JsValue {
    let ema_fast = calculate_ema(closes, fast);
    let ema_slow = calculate_ema(closes, slow);

    let mut macd_line = Vec::with_capacity(closes.len());
    for i in 0..closes.len() {
        if ema_fast[i].is_nan() || ema_slow[i].is_nan() {
            macd_line.push(f64::NAN);
        } else {
            macd_line.push(ema_fast[i] - ema_slow[i]);
        }
    }

    // Calculate signal line from valid MACD values
    let valid_macd: Vec<f64> = macd_line.iter().copied().filter(|v| !v.is_nan()).collect();
    let signal_line_full = calculate_ema(&valid_macd, signal);

    // Rebuild signal line with NaNs aligned
    let mut full_signal_line = Vec::with_capacity(closes.len());
    let mut signal_idx = 0;
    for i in 0..closes.len() {
        if macd_line[i].is_nan() {
            full_signal_line.push(f64::NAN);
        } else {
            full_signal_line.push(*signal_line_full.get(signal_idx).unwrap_or(&f64::NAN));
            signal_idx += 1;
        }
    }

    // Calculate histogram
    let histogram: Vec<f64> = macd_line
        .iter()
        .zip(full_signal_line.iter())
        .map(|(macd, sig)| {
            if macd.is_nan() || sig.is_nan() {
                f64::NAN
            } else {
                macd - sig
            }
        })
        .collect();

    let result = MacdResult {
        macd_line,
        signal_line: full_signal_line,
        histogram,
    };

    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}

// ==================== Bollinger Bands ====================

#[derive(Serialize, Deserialize)]
pub struct BollingerBandsResult {
    pub upper: Vec<f64>,
    pub middle: Vec<f64>,
    pub lower: Vec<f64>,
}

#[wasm_bindgen]
pub fn calculate_bollinger_bands(closes: &[f64], period: usize, std_dev: f64) -> JsValue {
    let mut upper = Vec::with_capacity(closes.len());
    let mut middle = Vec::with_capacity(closes.len());
    let mut lower = Vec::with_capacity(closes.len());

    for i in 0..closes.len() {
        if i < period - 1 {
            upper.push(f64::NAN);
            middle.push(f64::NAN);
            lower.push(f64::NAN);
        } else {
            let slice = &closes[i - period + 1..=i];
            let sma: f64 = slice.iter().sum::<f64>() / period as f64;
            
            let variance: f64 = slice
                .iter()
                .map(|&val| (val - sma).powi(2))
                .sum::<f64>() / period as f64;
            
            let std = variance.sqrt();

            middle.push(sma);
            upper.push(sma + (std_dev * std));
            lower.push(sma - (std_dev * std));
        }
    }

    let result = BollingerBandsResult { upper, middle, lower };
    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}

// ==================== ATR (Average True Range) ====================

#[wasm_bindgen]
pub fn calculate_atr(highs: &[f64], lows: &[f64], closes: &[f64], period: usize) -> Vec<f64> {
    let mut tr = Vec::with_capacity(highs.len());
    let mut atr = Vec::with_capacity(highs.len());

    for i in 0..highs.len() {
        if i == 0 {
            tr.push(highs[i] - lows[i]);
        } else {
            let tr1 = highs[i] - lows[i];
            let tr2 = (highs[i] - closes[i - 1]).abs();
            let tr3 = (lows[i] - closes[i - 1]).abs();
            tr.push(tr1.max(tr2).max(tr3));
        }
    }

    for i in 0..tr.len() {
        if i < period - 1 {
            atr.push(f64::NAN);
        } else if i == period - 1 {
            let sum: f64 = tr[0..period].iter().sum();
            atr.push(sum / period as f64);
        } else {
            let prev = atr[i - 1];
            atr.push((prev * (period as f64 - 1.0) + tr[i]) / period as f64);
        }
    }

    atr
}

// ==================== OBV (On-Balance Volume) ====================

#[wasm_bindgen]
pub fn calculate_obv(closes: &[f64], volumes: &[f64]) -> Vec<f64> {
    let mut obv = Vec::with_capacity(closes.len());
    
    if closes.is_empty() {
        return obv;
    }

    obv.push(volumes[0]);

    for i in 1..closes.len() {
        if closes[i] > closes[i - 1] {
            obv.push(obv[i - 1] + volumes[i]);
        } else if closes[i] < closes[i - 1] {
            obv.push(obv[i - 1] - volumes[i]);
        } else {
            obv.push(obv[i - 1]);
        }
    }

    obv
}

// ==================== Stochastic Oscillator ====================

#[derive(Serialize, Deserialize)]
pub struct StochasticResult {
    pub k: Vec<f64>,
    pub d: Vec<f64>,
}

#[wasm_bindgen]
pub fn calculate_stochastic(highs: &[f64], lows: &[f64], closes: &[f64], k_period: usize, d_period: usize) -> JsValue {
    let mut k = Vec::with_capacity(closes.len());

    for i in 0..closes.len() {
        if i < k_period - 1 {
            k.push(f64::NAN);
        } else {
            let slice_highs = &highs[i - k_period + 1..=i];
            let slice_lows = &lows[i - k_period + 1..=i];
            
            let highest_high = slice_highs.iter().cloned().fold(f64::NEG_INFINITY, f64::max);
            let lowest_low = slice_lows.iter().cloned().fold(f64::INFINITY, f64::min);
            
            if highest_low == lowest_low {
                k.push(50.0);
            } else {
                let k_val = ((closes[i] - lowest_low) / (highest_high - lowest_low)) * 100.0;
                k.push(k_val);
            }
        }
    }

    // Calculate %D (SMA of %K)
    let mut d = Vec::with_capacity(closes.len());
    for i in 0..closes.len() {
        if i < d_period - 1 {
            d.push(f64::NAN);
        } else {
            let slice = &k[i - d_period + 1..=i];
            let valid: Vec<f64> = slice.iter().copied().filter(|v| !v.is_nan()).collect();
            
            if valid.len() < d_period {
                d.push(f64::NAN);
            } else {
                let avg: f64 = valid.iter().sum::<f64>() / valid.len() as f64;
                d.push(avg);
            }
        }
    }

    let result = StochasticResult { k, d };
    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}

// ==================== Pivot Points (Support/Resistance) ====================

#[derive(Serialize, Deserialize)]
pub struct PivotPointsResult {
    pub pivot: f64,
    pub r1: f64,
    pub r2: f64,
    pub r3: f64,
    pub s1: f64,
    pub s2: f64,
    pub s3: f64,
}

#[wasm_bindgen]
pub fn calculate_pivot_points(high: f64, low: f64, close: f64) -> JsValue {
    let pivot = (high + low + close) / 3.0;
    let r1 = 2.0 * pivot - low;
    let s1 = 2.0 * pivot - high;
    let r2 = pivot + (high - low);
    let s2 = pivot - (high - low);
    let r3 = high + 2.0 * (pivot - low);
    let s3 = low - 2.0 * (high - pivot);

    let result = PivotPointsResult { pivot, r1, r2, r3, s1, s2, s3 };
    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}

// Initialize console logging for WASM
#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}

// ==================== ADVANCED PATTERN DETECTION ====================

/// Helper: Find Swing Highs/Lows
fn find_swings(highs: &[f64], lows: &[f64], window: usize) -> Vec<(usize, bool)> {
    let mut swings = Vec::new();
    if highs.len() < window * 2 + 1 {
        return swings;
    }
    
    for i in window..(highs.len() - window) {
        let mut is_high = true;
        let mut is_low = true;
        
        for j in (i - window)..=(i + window) {
            if j == i { continue; }
            if highs[j] >= highs[i] { is_high = false; }
            if lows[j] <= lows[i] { is_low = false; }
        }
        
        if is_high { swings.push((i, true)); }
        if is_low { swings.push((i, false)); }
    }
    
    swings
}

/// Detect Head and Shoulders Pattern
#[wasm_bindgen]
pub fn detect_head_and_shoulders(highs: &[f64], lows: &[f64], closes: &[f64]) -> JsValue {
    let swings = find_swings(highs, lows, 5);
    
    for i in 0..swings.len().saturating_sub(4) {
        let s = &swings[i..i+5];
        
        // Normal H&S: High, Low, Higher High, Low, Lower High
        if s[0].1 && !s[1].1 && s[2].1 && !s[3].1 && s[4].1 {
            let idx_l_shoulder = s[0].0;
            let idx_neck_left = s[1].0;
            let idx_head = s[2].0;
            let idx_neck_right = s[3].0;
            let idx_r_shoulder = s[4].0;

            let h_left = highs[idx_l_shoulder];
            let h_head = highs[idx_head];
            let h_right = highs[idx_r_shoulder];
            let l_left = lows[idx_neck_left];
            let l_right = lows[idx_neck_right];

            // Conditions: Head is highest, Shoulders within 10% of each other
            if h_head > h_left && h_head > h_right && 
               (h_left - h_right).abs() / h_head < 0.10 {
                
                let neckline = (l_left + l_right) / 2.0;
                let current_price = closes[closes.len().saturating_sub(1)];
                let breakdown = current_price < neckline;
                let target = neckline - (h_head - neckline);
                
                return JsValue::from_serde(&serde_json::json!({
                    "detected": true,
                    "type": "Head and Shoulders",
                    "breakdown": breakdown,
                    "neckline": neckline,
                    "target": target.max(0.0),
                    "confidence": if breakdown { 0.8 } else { 0.4 }
                })).unwrap_or(JsValue::NULL);
            }
        }
        
        // Inverse H&S: Low, High, Lower Low, High, Higher Low
        if !s[0].1 && s[1].1 && !s[2].1 && s[3].1 && !s[4].1 {
             let l_left = lows[swings[i].0];
             let l_head = lows[swings[i+2].0];
             let l_right = lows[swings[i+4].0];
             
             if l_head < l_left && l_head < l_right {
                 let neckline = (highs[swings[i+1].0] + highs[swings[i+3].0]) / 2.0;
                 return JsValue::from_serde(&serde_json::json!({
                    "detected": true,
                    "type": "Inverse Head and Shoulders",
                    "breakdown": false,
                    "neckline": neckline,
                    "target": neckline + (neckline - l_head),
                    "confidence": 0.7
                })).unwrap_or(JsValue::NULL);
             }
        }
    }
    
    JsValue::from_serde(&serde_json::json!({"detected": false})).unwrap_or(JsValue::NULL)
}

/// Detect Cup and Handle Pattern (William O'Neil)
#[wasm_bindgen]
pub fn detect_cup_and_handle(highs: &[f64], lows: &[f64], closes: &[f64]) -> JsValue {
    let len = closes.len();
    if len < 60 { 
        return JsValue::from_serde(&serde_json::json!({"detected": false})).unwrap_or(JsValue::NULL); 
    }

    let lookback = 100.min(len);
    let mut min_idx = len - lookback;
    let mut min_val = lows[len - lookback];
    
    // Find lowest point in lookback
    for i in (len - lookback)..len {
        if lows[i] < min_val {
            min_val = lows[i];
            min_idx = i;
        }
    }

    let left_high = highs[(len - lookback)..min_idx].iter().cloned().fold(f64::MIN, f64::max);
    let right_high = if min_idx < len - 5 { 
        highs[min_idx..len-5].iter().cloned().fold(f64::MIN, f64::max) 
    } else { 0.0 };

    // Cup depth check (15-40%)
    let depth = (left_high - min_val) / left_high;
    if depth < 0.15 || depth > 0.40 {
         return JsValue::from_serde(&serde_json::json!({"detected": false})).unwrap_or(JsValue::NULL);
    }

    // Handle check: small pullback in last 5-10 days
    let handle_start = closes.len().saturating_sub(10);
    let handle_end = closes.len().saturating_sub(1);
    let handle_trend = closes[handle_start] - closes[handle_end];
    let is_handle = handle_trend > 0.0 && (handle_trend / closes[handle_start]) < 0.05;

    if is_handle && (left_high - right_high).abs() / left_high < 0.1 {
        let breakout_point = left_high.max(right_high);
        return JsValue::from_serde(&serde_json::json!({
            "detected": true,
            "type": "Cup and Handle",
            "breakout_point": breakout_point,
            "target": breakout_point + (breakout_point - min_val),
            "confidence": 0.75
        })).unwrap_or(JsValue::NULL);
    }

    JsValue::from_serde(&serde_json::json!({"detected": false})).unwrap_or(JsValue::NULL)
}

/// Volatility Contraction Pattern (VCP) - Minervini Style
#[wasm_bindgen]
pub fn detect_vcp(highs: &[f64], lows: &[f64], volumes: &[f64]) -> JsValue {
    let len = highs.len();
    if len < 60 { 
        return JsValue::from_serde(&serde_json::json!({"detected": false})).unwrap_or(JsValue::NULL); 
    }

    let mut contractions = Vec::new();
    
    // Scan backwards for volatility contractions
    for i in (20..len-20).rev().step_by(5) {
        let range_curr = highs[i] - lows[i];
        let range_prev = highs[i+10] - lows[i+10];
        
        if range_curr < range_prev * 0.8 {
            contractions.push((i, range_curr));
            if contractions.len() >= 3 { break; }
        }
    }

    if contractions.len() >= 2 {
        let avg_vol = volumes.iter().sum::<f64>() / volumes.len() as f64;
        let recent_vol_sum: f64 = volumes[contractions[0].0..].iter().sum();
        let recent_vol = recent_vol_sum / (len - contractions[0].0) as f64;
        
        if recent_vol < avg_vol * 0.7 {
            return JsValue::from_serde(&serde_json::json!({
                "detected": true,
                "type": "VCP",
                "contractions": contractions.len(),
                "volume_dry_up": true,
                "confidence": 0.85
            })).unwrap_or(JsValue::NULL);
        }
    }

    JsValue::from_serde(&serde_json::json!({"detected": false})).unwrap_or(JsValue::NULL)
}

/// Backtest Helper: Run simple MA crossover strategy
#[wasm_bindgen]
pub fn backtest_strategy(closes: &[f64], _highs: &[f64], _lows: &[f64], strategy: &str) -> JsValue {
    let mut trades = 0;
    let mut wins = 0;
    let mut equity = 10000.0;
    let mut in_position = false;
    let mut entry_price = 0.0;

    if strategy == "ma_cross" {
        let short_period = 20;
        let long_period = 50;
        
        for i in long_period..closes.len() {
            let prev_short: f64 = closes[i-short_period..i].iter().sum::<f64>() / short_period as f64;
            let curr_short: f64 = closes[i-short_period+1..=i].iter().sum::<f64>() / short_period as f64;
            
            let prev_long: f64 = closes[i-long_period..i].iter().sum::<f64>() / long_period as f64;
            let curr_long: f64 = closes[i-long_period+1..=i].iter().sum::<f64>() / long_period as f64;

            if !in_position && prev_short <= prev_long && curr_short > curr_long {
                in_position = true;
                entry_price = closes[i];
                trades += 1;
            } else if in_position && prev_short >= prev_long && curr_short < curr_long {
                in_position = false;
                if closes[i] > entry_price { wins += 1; }
                let shares = 100.0 / entry_price;
                equity += (closes[i] - entry_price) * shares;
            }
        }
    }

    JsValue::from_serde(&serde_json::json!({
        "total_trades": trades,
        "winning_trades": wins,
        "win_rate": if trades > 0 { wins as f64 / trades as f64 } else { 0.0 },
        "final_equity": equity,
        "return_pct": ((equity - 10000.0) / 10000.0) * 100.0
    })).unwrap_or(JsValue::NULL)
}
