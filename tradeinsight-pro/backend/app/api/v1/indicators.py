"""
Technical Indicators API Routes
"""
from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional, Dict, Any
import pandas as pd

from app.models.stock import IndicatorResult, MultiIndicatorResult, IndicatorConfig
from app.services.indicators import IndicatorService
from app.services.market_data import market_data_service

router = APIRouter()


@router.get("/list")
async def list_indicators(category: Optional[str] = None):
    """List all available technical indicators"""
    try:
        if category:
            indicators = IndicatorService.get_indicators_by_category(category)
        else:
            indicators = IndicatorService.get_all_indicators()
        
        return {
            "indicators": indicators,
            "count": len(indicators),
            "categories": ["trend", "momentum", "volatility", "volume", "support_resistance"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{symbol}")
async def get_indicators(symbol: str,
                         indicators: Optional[str] = Query(None, description="Comma-separated indicator names"),
                         period: str = Query(default="1mo", description="Historical data period")):
    """Calculate technical indicators for a stock"""
    try:
        # Get historical data
        hist_data = await market_data_service.get_historical_data(symbol.upper(), period=period)
        
        if not hist_data or len(hist_data.data) == 0:
            raise HTTPException(status_code=404, detail="No historical data available")
        
        # Convert to DataFrame
        df = pd.DataFrame([{
            'open': d.open,
            'high': d.high,
            'low': d.low,
            'close': d.close,
            'volume': d.volume
        } for d in hist_data.data])
        
        # Parse selected indicators
        selected_indicators = None
        if indicators:
            selected_indicators = [i.strip().upper() for i in indicators.split(',')]
        
        # Calculate indicators
        results = IndicatorService.calculate_all_indicators(df, selected_indicators)
        
        # Generate summary
        summary = IndicatorService.generate_summary(results)
        
        return MultiIndicatorResult(
            symbol=symbol.upper(),
            indicators=results,
            summary=summary
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{symbol}/{indicator_name}")
async def get_single_indicator(symbol: str,
                               indicator_name: str,
                               period: str = Query(default="1mo", description="Historical data period"),
                               params: Optional[str] = Query(None, description="JSON string of parameters")):
    """Calculate a single technical indicator for a stock"""
    try:
        # Get historical data
        hist_data = await market_data_service.get_historical_data(symbol.upper(), period=period)
        
        if not hist_data or len(hist_data.data) == 0:
            raise HTTPException(status_code=404, detail="No historical data available")
        
        # Convert to DataFrame
        df = pd.DataFrame([{
            'open': d.open,
            'high': d.high,
            'low': d.low,
            'close': d.close,
            'volume': d.volume
        } for d in hist_data.data])
        
        # Parse params if provided
        import json
        indicator_params = None
        if params:
            try:
                indicator_params = json.loads(params)
            except:
                pass
        
        # Calculate indicator
        result = IndicatorService.calculate_indicator(df, indicator_name.upper(), indicator_params)
        
        return result
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/calculate")
async def calculate_multiple_indicators(request: Dict[str, Any]):
    """Calculate multiple indicators for custom data"""
    try:
        symbol = request.get("symbol", "CUSTOM")
        period = request.get("period", "1mo")
        indicators = request.get("indicators")
        
        # Get historical data
        hist_data = await market_data_service.get_historical_data(symbol.upper(), period=period)
        
        if not hist_data or len(hist_data.data) == 0:
            raise HTTPException(status_code=404, detail="No historical data available")
        
        # Convert to DataFrame
        df = pd.DataFrame([{
            'open': d.open,
            'high': d.high,
            'low': d.low,
            'close': d.close,
            'volume': d.volume
        } for d in hist_data.data])
        
        # Calculate indicators
        results = IndicatorService.calculate_all_indicators(df, indicators)
        
        # Generate summary
        summary = IndicatorService.generate_summary(results)
        
        return MultiIndicatorResult(
            symbol=symbol.upper(),
            indicators=results,
            summary=summary
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories")
async def get_categories():
    """Get indicator categories with counts"""
    try:
        all_indicators = IndicatorService.get_all_indicators()
        
        categories = {
            "trend": [],
            "momentum": [],
            "volatility": [],
            "volume": [],
            "support_resistance": []
        }
        
        for name, info in all_indicators.items():
            cat = info["category"]
            if cat in categories:
                categories[cat].append({
                    "name": name,
                    "description": info["description"]
                })
        
        return {
            "categories": {
                cat: {
                    "count": len(items),
                    "indicators": items
                } for cat, items in categories.items()
            },
            "total": len(all_indicators)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
