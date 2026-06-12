"""
Stock API Routes
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from app.models.stock import StockDetail, HistoricalData, SearchQuery
from app.services.market_data import market_data_service

router = APIRouter()


@router.get("/search")
async def search_stocks(q: str = Query(..., min_length=1, description="Search query"),
                        limit: int = Query(default=10, ge=1, le=100)):
    """Search for stocks by symbol or name"""
    try:
        results = await market_data_service.search_stocks(q, limit)
        return {"results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{symbol}")
async def get_stock_detail(symbol: str):
    """Get detailed information about a stock"""
    try:
        stock = await market_data_service.get_stock_detail(symbol.upper())
        if not stock:
            raise HTTPException(status_code=404, detail="Stock not found")
        return stock
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{symbol}/history")
async def get_historical_data(symbol: str,
                              period: str = Query(default="1mo", description="Time period"),
                              interval: str = Query(default="1d", description="Data interval")):
    """Get historical OHLCV data for a stock"""
    try:
        data = await market_data_service.get_historical_data(
            symbol.upper(), 
            period=period, 
            interval=interval
        )
        if not data:
            raise HTTPException(status_code=404, detail="No data available")
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{symbol}/quote")
async def get_realtime_quote(symbol: str):
    """Get real-time quote for a stock"""
    try:
        quote = await market_data_service.get_realtime_quote(symbol.upper())
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not available")
        return quote
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
