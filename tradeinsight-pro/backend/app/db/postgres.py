"""
Database Utilities - PostgreSQL, Redis, InfluxDB
"""
from typing import Optional
from loguru import logger
import asyncpg
import redis.asyncio as redis
from influxdb_client import InfluxDBClient, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

from app.core.config import settings


# PostgreSQL
class PostgresDB:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
    
    async def init_db(self):
        """Initialize PostgreSQL connection pool"""
        try:
            self.pool = await asyncpg.create_pool(
                settings.DATABASE_URL,
                min_size=5,
                max_size=20
            )
            logger.info("PostgreSQL connection pool initialized")
        except Exception as e:
            logger.warning(f"PostgreSQL initialization failed: {e}")
            self.pool = None
    
    async def close_db(self):
        """Close PostgreSQL connection pool"""
        if self.pool:
            await self.pool.close()
            logger.info("PostgreSQL connection pool closed")
    
    async def execute(self, query: str, *args):
        """Execute a query"""
        if not self.pool:
            return None
        async with self.pool.acquire() as conn:
            return await conn.execute(query, *args)
    
    async def fetch(self, query: str, *args):
        """Fetch rows"""
        if not self.pool:
            return []
        async with self.pool.acquire() as conn:
            return await conn.fetch(query, *args)
    
    async def fetch_one(self, query: str, *args):
        """Fetch one row"""
        if not self.pool:
            return None
        async with self.pool.acquire() as conn:
            return await conn.fetchrow(query, *args)


# Redis
class RedisCache:
    def __init__(self):
        self.client: Optional[redis.Redis] = None
    
    async def init_redis(self):
        """Initialize Redis connection"""
        try:
            self.client = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )
            await self.client.ping()
            logger.info("Redis connection initialized")
        except Exception as e:
            logger.warning(f"Redis initialization failed: {e}")
            self.client = None
    
    async def close_redis(self):
        """Close Redis connection"""
        if self.client:
            await self.client.close()
            logger.info("Redis connection closed")
    
    async def get(self, key: str):
        """Get value from cache"""
        if not self.client:
            return None
        return await self.client.get(key)
    
    async def set(self, key: str, value, expire: int = None):
        """Set value in cache"""
        if not self.client:
            return False
        expire = expire or settings.CACHE_EXPIRE_SECONDS
        return await self.client.set(key, value, ex=expire)
    
    async def delete(self, key: str):
        """Delete key from cache"""
        if not self.client:
            return False
        return await self.client.delete(key)
    
    async def json_get(self, key: str):
        """Get JSON value from cache"""
        import json
        data = await self.get(key)
        if data:
            return json.loads(data)
        return None
    
    async def json_set(self, key: str, value, expire: int = None):
        """Set JSON value in cache"""
        import json
        return await self.set(key, json.dumps(value), expire)


# InfluxDB
class InfluxDBStore:
    def __init__(self):
        self.client: Optional[InfluxDBClient] = None
        self.write_api = None
        self.query_api = None
    
    async def init_influxdb(self):
        """Initialize InfluxDB connection"""
        try:
            if settings.INFLUXDB_TOKEN:
                self.client = InfluxDBClient(
                    url=settings.INFLUXDB_URL,
                    token=settings.INFLUXDB_TOKEN,
                    org=settings.INFLUXDB_ORG
                )
                self.write_api = self.client.get_write_api(write_options=SYNCHRONOUS)
                self.query_api = self.client.get_query_api()
                logger.info("InfluxDB connection initialized")
            else:
                logger.warning("InfluxDB token not configured")
                self.client = None
        except Exception as e:
            logger.warning(f"InfluxDB initialization failed: {e}")
            self.client = None
    
    async def close_influxdb(self):
        """Close InfluxDB connection"""
        if self.client:
            self.client.close()
            logger.info("InfluxDB connection closed")
    
    async def write_point(self, bucket: str, record: dict):
        """Write a data point to InfluxDB"""
        if not self.write_api:
            return False
        try:
            self.write_api.write(bucket=bucket, org=settings.INFLUXDB_ORG, record=record)
            return True
        except Exception as e:
            logger.error(f"Error writing to InfluxDB: {e}")
            return False


# Singleton instances
postgres = PostgresDB()
redis = RedisCache()
influxdb = InfluxDBStore()
