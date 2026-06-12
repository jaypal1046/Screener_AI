"""
Data Models for Stock Information
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class StockBase(BaseModel):
    symbol: str
    name: Optional[str] = None
    exchange: Optional[str] = None
    sector: Optional[str] = None
    industry: Optional[str] = None


class StockDetail(StockBase):
    current_price: Optional[float] = None
    change: Optional[float] = None
    change_percent: Optional[float] = None
    volume: Optional[int] = None
    avg_volume: Optional[int] = None
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    eps: Optional[float] = None
    dividend_yield: Optional[float] = None
    high_52week: Optional[float] = None
    low_52week: Optional[float] = None
    open_price: Optional[float] = None
    previous_close: Optional[float] = None
    day_high: Optional[float] = None
    day_low: Optional[float] = None
    timestamp: Optional[datetime] = None


class OHLCV(BaseModel):
    """Open-High-Low-Close-Volume data point"""
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int


class HistoricalData(BaseModel):
    symbol: str
    data: List[OHLCV]
    timeframe: str = "1D"


class IndicatorResult(BaseModel):
    """Result from indicator calculation"""
    indicator_name: str
    category: str  # trend, momentum, volatility, volume, support_resistance
    values: Dict[str, Any]
    signal: Optional[str] = None  # buy, sell, neutral
    strength: Optional[float] = None  # 0-100
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class MultiIndicatorResult(BaseModel):
    """Multiple indicators for a stock"""
    symbol: str
    indicators: List[IndicatorResult]
    summary: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SearchQuery(BaseModel):
    query: str
    limit: int = Field(default=10, ge=1, le=100)


class IndicatorConfig(BaseModel):
    """Configuration for indicator calculation"""
    indicator_name: str
    params: Optional[Dict[str, Any]] = None
    timeframe: str = "1D"
    periods: int = 14
