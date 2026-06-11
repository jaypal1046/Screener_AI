/**
 * Yahoo Finance Data Service
 * Fetches OHLCV data via Yahoo Finance API (free, no auth)
 * Runs in background service worker to avoid CORS issues
 */

import { OHLCV, Timeframe } from '../engine/types';

export interface YahooFinanceResponse {
  chart: {
    result: Array<{
      meta: {
        symbol: string;
        currency: string;
        exchangeName: string;
        instrumentType: string;
        firstTradeDate: number;
        regularMarketTime: number;
        gmtoffset: number;
        timezone: string;
        exchangeTimezoneName: string;
        regularMarketPrice: number;
        chartPreviousClose: number;
        previousClose: number;
        scale: number;
        priceHint: number;
        currentTradingPeriod: {
          pre: any;
          regular: any;
          post: any;
        };
        tradingPeriods: any[];
        dataGranularity: string;
        range: string;
        validRanges: string[];
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          open: (number | null)[];
          high: (number | null)[];
          low: (number | null)[];
          close: (number | null)[];
          volume: (number | null)[];
        }>;
        adjclose: Array<{
          adjclose: (number | null)[];
        }>;
      };
    } | null>;
    error: any;
  };
}

export class YahooFinanceService {
  private static readonly BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
  
  private static readonly TIMEFRAME_MAP: Record<Timeframe, string> = {
    '1D': '1d',
    '1W': '1wk',
    '1M': '1mo',
    '3M': '3mo',
    '1Y': '1y'
  };

  /**
   * Fetches OHLCV data for a given ticker and timeframe
   * @param ticker - Stock symbol (e.g., 'RELIANCE', 'INFY')
   * @param timeframe - Desired timeframe
   * @param exchange - Optional exchange suffix (.NS for NSE, .BO for BSE)
   */
  public async fetchOHLCV(
    ticker: string, 
    timeframe: Timeframe = '1D',
    exchange: string = 'NS'
  ): Promise<OHLCV[]> {
    const symbol = `${ticker}.${exchange}`;
    const range = YahooFinanceService.TIMEFRAME_MAP[timeframe];
    
    const url = `${YahooFinanceService.BASE_URL}/${symbol}?interval=${range}&range=${range}&includePrePost=false`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Yahoo Finance API error: ${response.status}`);
      }

      const data: YahooFinanceResponse = await response.json();
      
      if (!data.chart.result || data.chart.result.length === 0 || !data.chart.result[0]) {
        throw new Error('No data returned from Yahoo Finance');
      }

      const result = data.chart.result[0];
      const timestamps = result.timestamp || [];
      const quotes = result.indicators.quote[0];

      const ohlcv: OHLCV[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        const open = quotes.open[i];
        const high = quotes.high[i];
        const low = quotes.low[i];
        const close = quotes.close[i];
        const volume = quotes.volume[i];

        // Skip incomplete candles
        if (open === null || high === null || low === null || close === null || volume === null) {
          continue;
        }

        ohlcv.push({
          time: timestamps[i] * 1000, // Convert to milliseconds
          open,
          high,
          low,
          close,
          volume
        });
      }

      return ohlcv;
    } catch (error) {
      console.error('[StockLens] Yahoo Finance fetch error:', error);
      throw error;
    }
  }

  /**
   * Fetches data for multiple timeframes in parallel
   */
  public async fetchMultiTimeframe(
    ticker: string,
    exchange: string = 'NS'
  ): Promise<Record<Timeframe, OHLCV[]>> {
    const timeframes: Timeframe[] = ['1D', '1W', '1M', '3M', '1Y'];
    
    const results = await Promise.allSettled(
      timeframes.map(tf => this.fetchOHLCV(ticker, tf, exchange))
    );

    const data: Record<Timeframe, OHLCV[]> = {} as any;
    
    timeframes.forEach((tf, index) => {
      const result = results[index];
      if (result.status === 'fulfilled') {
        data[tf] = result.value;
      } else {
        console.warn(`[StockLens] Failed to fetch ${tf} data for ${ticker}`);
        data[tf] = [];
      }
    });

    return data;
  }

  /**
   * Converts Yahoo Finance ticker format
   * e.g., RELIANCE.NS -> RELIANCE
   */
  public static parseTicker(symbol: string): string {
    return symbol.replace(/\.(NS|BO|NE)$/i, '');
  }

  /**
   * Determines exchange suffix from ticker or context
   */
  public static inferExchange(ticker: string): string {
    // NSE stocks
    if (['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'INFY', 'TCS', 'RELIANCE', 'HDFCBANK'].includes(ticker)) {
      return 'NS';
    }
    
    // BSE stocks (less common for retail)
    if (ticker.endsWith('.BO')) {
      return 'BO';
    }

    // Default to NSE
    return 'NS';
  }
}
