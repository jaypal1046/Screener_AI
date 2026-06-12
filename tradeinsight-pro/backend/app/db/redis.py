# Re-export from postgres.py for backward compatibility
from app.db.postgres import redis

__all__ = ["redis"]
