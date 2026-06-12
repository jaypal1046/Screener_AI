"""
Market Data Service - Fetches data from various sources
Supports Yahoo Finance, Alpha Vantage, and Finnhub
"""
import yfinance as yf
import pandas as pd
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from loguru import logger

from app.models.stock import StockDetail, OHLCV, HistoricalData
from app.core.config import settings


class MarketDataService:
    """Service for fetching market data from multiple sources"""
    
    def __init__(self):
        self.yahoo_enabled = settings.YAHOO_FINANCE_ENABLED
        self.alpha_vantage_key = settings.ALPHA_VANTAGE_API_KEY
        self.finnhub_key = settings.FINNHUB_API_KEY
    
    async def search_stocks(self, query: str, limit: int = 10) -> List[Dict[str, str]]:
        """Search for stocks by symbol or name"""
        results = []
        
        try:
            # Use yfinance to search (limited functionality)
            # In production, use a proper search API like Finnhub or Alpha Vantage
            if self.finnhub_key:
                import finnhub
                api_client = finnhub.Client(api_key=self.finnhub_key)
                search_results = api_client.search(query)
                
                if search_results and 'result' in search_results:
                    for item in search_results['result'][:limit]:
                        results.append({
                            "symbol": item.get('symbol', ''),
                            "name": item.get('description', ''),
                            "exchange": item.get('exchange', ''),
                            "type": item.get('type', 'Stock')
                        })
            else:
                # Fallback: common symbols matching query
                common_symbols = [
                    {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ"},
                    {"symbol": "MSFT", "name": "Microsoft Corporation", "exchange": "NASDAQ"},
                    {"symbol": "GOOGL", "name": "Alphabet Inc.", "exchange": "NASDAQ"},
                    {"symbol": "AMZN", "name": "Amazon.com Inc.", "exchange": "NASDAQ"},
                    {"symbol": "TSLA", "name": "Tesla Inc.", "exchange": "NASDAQ"},
                    {"symbol": "META", "name": "Meta Platforms Inc.", "exchange": "NASDAQ"},
                    {"symbol": "NVDA", "name": "NVIDIA Corporation", "exchange": "NASDAQ"},
                    {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "exchange": "NYSE"},
                    {"symbol": "V", "name": "Visa Inc.", "exchange": "NYSE"},
                    {"symbol": "JNJ", "name": "Johnson & Johnson", "exchange": "NYSE"},
                    {"symbol": "^GSPC", "name": "S&P 500", "exchange": "INDEX"},
                    {"symbol": "^DJI", "name": "Dow Jones Industrial Average", "exchange": "INDEX"},
                    {"symbol": "^IXIC", "name": "NASDAQ Composite", "exchange": "INDEX"},
                ]
                
                query_upper = query.upper()
                for symbol_info in common_symbols:
                    if query_upper in symbol_info["symbol"] or query_upper in symbol_info["name"].upper():
                        results.append(symbol_info)
                        if len(results) >= limit:
                            break
                            
        except Exception as e:
            logger.error(f"Error searching stocks: {e}")
        
        return results
    
    async def get_stock_detail(self, symbol: str) -> Optional[StockDetail]:
        """Get detailed stock information"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            if not info:
                return None
            
            # Get current price
            hist = ticker.history(period="1d")
            current_price = hist['Close'].iloc[-1] if not hist.empty else None
            
            stock_detail = StockDetail(
                symbol=symbol,
                name=info.get('shortName', info.get('longName')),
                exchange=info.get('exchange'),
                sector=info.get('sector'),
                industry=info.get('industry'),
                current_price=current_price,
                change=hist['Close'].iloc[-1] - hist['Open'].iloc[-1] if not hist.empty else None,
                change_percent=((hist['Close'].iloc[-1] - hist['Open'].iloc[-1]) / hist['Open'].iloc[-1] * 100) if not hist.empty else None,
                volume=info.get('volume'),
                avg_volume=info.get('averageVolume'),
                market_cap=info.get('marketCap'),
                pe_ratio=info.get('trailingPE'),
                eps=info.get('trailingEps'),
                dividend_yield=info.get('dividendYield'),
                high_52week=info.get('fiftyTwoWeekHigh'),
                low_52week=info.get('fiftyTwoWeekLow'),
                open_price=hist['Open'].iloc[-1] if not hist.empty else None,
                previous_close=info.get('previousClose'),
                day_high=hist['High'].iloc[-1] if not hist.empty else None,
                day_low=hist['Low'].iloc[-1] if not hist.empty else None,
                timestamp=datetime.utcnow()
            )
            
            return stock_detail
            
        except Exception as e:
            logger.error(f"Error getting stock detail for {symbol}: {e}")
            return None
    
    async def get_historical_data(self, symbol: str, 
                                  period: str = "1mo",
                                  interval: str = "1d") -> Optional[HistoricalData]:
        """Get historical OHLCV data"""
        try:
            ticker = yf.Ticker(symbol)
            
            # Map period to yfinance format
            period_map = {
                "1D": "1d",
                "5D": "5d",
                "1W": "1wk",
                "1M": "1mo",
                "3M": "3mo",
                "6M": "6mo",
                "1Y": "1y",
                "2Y": "2y",
                "5Y": "5y",
                "MAX": "max"
            }
            
            # Map interval to yfinance format
            interval_map = {
                "1m": "1m",
                "5m": "5m",
                "15m": "15m",
                "30m": "30m",
                "1h": "1h",
                "1D": "1d",
                "1W": "1wk",
                "1M": "1mo"
            }
            
            yf_period = period_map.get(period, "1mo")
            yf_interval = interval_map.get(interval, "1d")
            
            hist = ticker.history(period=yf_period, interval=yf_interval)
            
            if hist.empty:
                return None
            
            # Convert to OHLCV list
            ohlcv_data = []
            for idx, row in hist.iterrows():
                ohlcv_data.append(OHLCV(
                    timestamp=idx.to_pydatetime() if hasattr(idx, 'to_pydatetime') else idx,
                    open=float(row['Open']),
                    high=float(row['High']),
                    low=float(row['Low']),
                    close=float(row['Close']),
                    volume=int(row['Volume']) if 'Volume' in row else 0
                ))
            
            return HistoricalData(
                symbol=symbol,
                data=ohlcv_data,
                timeframe=interval
            )
            
        except Exception as e:
            logger.error(f"Error getting historical data for {symbol}: {e}")
            return None
    
    async def get_realtime_quote(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get real-time quote (best effort)"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="1d", interval="1m")
            
            if hist.empty:
                return None
            
            latest = hist.iloc[-1]
            
            return {
                "symbol": symbol,
                "price": float(latest['Close']),
                "volume": int(latest['Volume']),
                "timestamp": datetime.utcnow(),
                "change": float(latest['Close'] - latest['Open']),
                "change_percent": float((latest['Close'] - latest['Open']) / latest['Open'] * 100)
            }
            
        except Exception as e:
            logger.error(f"Error getting realtime quote for {symbol}: {e}")
            return None
    
    def dataframe_to_ohlcv(self, df: pd.DataFrame) -> pd.DataFrame:
        """Ensure DataFrame has required columns for indicator calculation"""
        required_columns = ['open', 'high', 'low', 'close', 'volume']
        
        # Normalize column names to lowercase
        df.columns = df.columns.str.lower().str.strip()
        
        # Check for required columns
        for col in required_columns:
            if col not in df.columns:
                raise ValueError(f"Missing required column: {col}")
        
        return df[required_columns]


# Singleton instance
market_data_service = MarketDataService()
