"""
WebSocket API Routes for Real-time Data Streaming
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Dict, List, Optional
import asyncio
import json
from datetime import datetime
from loguru import logger

from app.services.market_data import market_data_service
from app.services.indicators import IndicatorService
from app.core.config import settings

router = APIRouter()


# Connection manager for WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, key: str):
        await websocket.accept()
        if key not in self.active_connections:
            self.active_connections[key] = []
        self.active_connections[key].append(websocket)
        logger.info(f"New WebSocket connection for {key}. Total: {len(self.active_connections[key])}")
    
    def disconnect(self, websocket: WebSocket, key: str):
        if key in self.active_connections:
            self.active_connections[key].remove(websocket)
            if not self.active_connections[key]:
                del self.active_connections[key]
        logger.info(f"WebSocket disconnected for {key}")
    
    async def broadcast_to_key(self, message: dict, key: str):
        if key in self.active_connections:
            disconnected = []
            for connection in self.active_connections[key]:
                try:
                    await connection.send_json(message)
                except:
                    disconnected.append(connection)
            
            # Clean up disconnected clients
            for conn in disconnected:
                self.disconnect(conn, key)
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except:
            pass


manager = ConnectionManager()


@router.websocket("/market-data/{symbol}")
async def websocket_market_data(websocket: WebSocket, symbol: str):
    """Real-time market data stream for a symbol"""
    await manager.connect(websocket, f"market:{symbol.upper()}")
    
    try:
        while True:
            try:
                # Wait for messages or timeout
                data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=settings.WS_HEARTBEAT_INTERVAL
                )
                
                # Handle client messages
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await manager.send_personal_message({"type": "pong"}, websocket)
                
            except asyncio.TimeoutError:
                # Send heartbeat
                await manager.send_personal_message({
                    "type": "heartbeat",
                    "timestamp": datetime.utcnow().isoformat()
                }, websocket)
            
            # Fetch latest data
            quote = await market_data_service.get_realtime_quote(symbol.upper())
            if quote:
                await manager.send_personal_message({
                    "type": "quote",
                    "symbol": symbol.upper(),
                    "data": quote,
                    "timestamp": datetime.utcnow().isoformat()
                }, websocket)
            
            # Small delay to prevent overwhelming
            await asyncio.sleep(1)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, f"market:{symbol.upper()}")
    except Exception as e:
        logger.error(f"WebSocket error for {symbol}: {e}")
        manager.disconnect(websocket, f"market:{symbol.upper()}")


@router.websocket("/indicators/{symbol}")
async def websocket_indicators(websocket: WebSocket, 
                               symbol: str,
                               indicators: Optional[str] = Query(None)):
    """Real-time technical indicators stream for a symbol"""
    await manager.connect(websocket, f"indicators:{symbol.upper()}")
    
    # Parse selected indicators
    selected_indicators = None
    if indicators:
        selected_indicators = [i.strip().upper() for i in indicators.split(',')]
    
    try:
        while True:
            try:
                data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=settings.WS_HEARTBEAT_INTERVAL
                )
                
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await manager.send_personal_message({"type": "pong"}, websocket)
                elif msg.get("type") == "update_indicators":
                    # Client requested indicator update
                    new_indicators = msg.get("indicators")
                    if new_indicators:
                        selected_indicators = [i.upper() for i in new_indicators]
                
            except asyncio.TimeoutError:
                # Send heartbeat
                await manager.send_personal_message({
                    "type": "heartbeat",
                    "timestamp": datetime.utcnow().isoformat()
                }, websocket)
            
            # Fetch historical data and calculate indicators
            hist_data = await market_data_service.get_historical_data(
                symbol.upper(), 
                period="1mo"
            )
            
            if hist_data and len(hist_data.data) > 0:
                import pandas as pd
                df = pd.DataFrame([{
                    'open': d.open,
                    'high': d.high,
                    'low': d.low,
                    'close': d.close,
                    'volume': d.volume
                } for d in hist_data.data])
                
                # Calculate indicators
                results = IndicatorService.calculate_all_indicators(df, selected_indicators)
                summary = IndicatorService.generate_summary(results)
                
                # Convert results to serializable format
                indicators_data = []
                for r in results:
                    indicators_data.append({
                        "indicator_name": r.indicator_name,
                        "category": r.category,
                        "values": r.values,
                        "signal": r.signal,
                        "strength": r.strength,
                        "timestamp": r.timestamp.isoformat()
                    })
                
                await manager.send_personal_message({
                    "type": "indicators",
                    "symbol": symbol.upper(),
                    "indicators": indicators_data,
                    "summary": summary,
                    "timestamp": datetime.utcnow().isoformat()
                }, websocket)
            
            # Update every 5 seconds
            await asyncio.sleep(5)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, f"indicators:{symbol.upper()}")
    except Exception as e:
        logger.error(f"WebSocket indicators error for {symbol}: {e}")
        manager.disconnect(websocket, f"indicators:{symbol.upper()}")


@router.websocket("/test")
async def websocket_test(websocket: WebSocket):
    """Test WebSocket connection"""
    await manager.connect(websocket, "test")
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message({
                "type": "echo",
                "message": f"Received: {data}",
                "timestamp": datetime.utcnow().isoformat()
            }, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, "test")
