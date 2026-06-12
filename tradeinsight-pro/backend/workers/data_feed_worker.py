"""
TradeInsight Pro - Data Feed Worker
Background service for fetching and processing market data
"""
import asyncio
import json
from datetime import datetime, timedelta
from loguru import logger
import yfinance as yf

# Configure logging
logger.add("logs/worker.log", rotation="500 MB", retention="10 days", level="DEBUG")


class DataFeedWorker:
    """Background worker for fetching market data"""
    
    def __init__(self):
        self.running = True
        self.symbols = [
            'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA',
            'META', 'NVDA', 'JPM', 'V', 'JNJ'
        ]
        self.update_interval = 60  # seconds
        
    async def fetch_stock_data(self, symbol: str):
        """Fetch historical data for a stock using yfinance"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="1mo", interval="1d")
            
            if hist.empty:
                logger.warning(f"No data found for {symbol}")
                return None
            
            latest = hist.iloc[-1]
            data = {
                'symbol': symbol,
                'timestamp': datetime.utcnow().isoformat(),
                'open': float(latest['Open']),
                'high': float(latest['High']),
                'low': float(latest['Low']),
                'close': float(latest['Close']),
                'volume': int(latest['Volume'])
            }
            
            logger.info(f"Fetched data for {symbol}: Close=${data['close']:.2f}")
            return data
            
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {e}")
            return None
    
    async def process_indicators(self, symbol: str, data: dict):
        """Calculate indicators for the fetched data"""
        try:
            # Import indicator service
            from app.services.indicators import IndicatorService
            
            indicator_service = IndicatorService()
            
            # Create DataFrame-like structure for indicator calculation
            ohlcv = {
                'open': [data['open']],
                'high': [data['high']],
                'low': [data['low']],
                'close': [data['close']],
                'volume': [data['volume']]
            }
            
            # Calculate key indicators
            indicators = {}
            
            # RSI
            rsi_result = indicator_service.calculate_rsi(ohlcv, period=14)
            indicators['RSI'] = rsi_result
            
            # MACD
            macd_result = indicator_service.calculate_macd(ohlcv)
            indicators['MACD'] = macd_result
            
            # Bollinger Bands
            bb_result = indicator_service.calculate_bollinger_bands(ohlcv)
            indicators['BollingerBands'] = bb_result
            
            # SMA
            sma_result = indicator_service.calculate_sma(ohlcv, period=20)
            indicators['SMA20'] = sma_result
            
            logger.info(f"Calculated {len(indicators)} indicators for {symbol}")
            return indicators
            
        except Exception as e:
            logger.error(f"Error calculating indicators for {symbol}: {e}")
            return {}
    
    async def run_cycle(self):
        """Run one complete data fetch and processing cycle"""
        logger.info("Starting data feed cycle...")
        
        for symbol in self.symbols:
            data = await self.fetch_stock_data(symbol)
            if data:
                indicators = await self.process_indicators(symbol, data)
                # In production, store to database/cache here
                logger.debug(f"Processed {symbol} with {len(indicators)} indicators")
            
            # Small delay between requests to avoid rate limiting
            await asyncio.sleep(1)
        
        logger.info(f"Completed data feed cycle. Processed {len(self.symbols)} symbols.")
    
    async def run(self):
        """Main worker loop"""
        logger.info("Data Feed Worker started")
        
        while self.running:
            try:
                await self.run_cycle()
                await asyncio.sleep(self.update_interval)
            except KeyboardInterrupt:
                logger.info("Worker interrupted by user")
                self.running = False
            except Exception as e:
                logger.error(f"Worker error: {e}")
                await asyncio.sleep(5)  # Wait before retry
        
        logger.info("Data Feed Worker stopped")
    
    def stop(self):
        """Stop the worker"""
        self.running = False


async def main():
    """Entry point for the worker"""
    worker = DataFeedWorker()
    await worker.run()


if __name__ == "__main__":
    asyncio.run(main())
