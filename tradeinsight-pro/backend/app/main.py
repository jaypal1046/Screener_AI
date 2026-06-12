"""
TradeInsight Pro - FastAPI Application Entry Point
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
import asyncio
import json

from app.api.v1 import stocks, indicators, websocket
from app.core.config import settings
from app.db import postgres, redis, influxdb


# Configure logging
logger.add("logs/app.log", rotation="500 MB", retention="10 days", level="DEBUG")

app = FastAPI(
    title=settings.APP_NAME,
    description="Real-time trading analytics dashboard with 40+ technical indicators",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database connections and services on startup"""
    logger.info("Starting TradeInsight Pro...")
    
    # Initialize database connections
    await postgres.init_db()
    await redis.init_redis()
    await influxdb.init_influxdb()
    
    logger.info("Database connections initialized")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup database connections on shutdown"""
    logger.info("Shutting down TradeInsight Pro...")
    
    await postgres.close_db()
    await redis.close_redis()
    await influxdb.close_influxdb()
    
    logger.info("Database connections closed")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to TradeInsight Pro API",
        "version": "1.0.0",
        "docs": "/api/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "tradeinsight-pro-backend"
    }


# Include API routers
app.include_router(stocks.router, prefix="/api/v1/stocks", tags=["Stocks"])
app.include_router(indicators.router, prefix="/api/v1/indicators", tags=["Indicators"])
app.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])


@app.websocket("/ws/test")
async def websocket_test(websocket: WebSocket):
    """Test WebSocket connection"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
