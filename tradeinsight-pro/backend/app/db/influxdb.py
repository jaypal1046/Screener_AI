# Re-export from postgres.py for backward compatibility
from app.db.postgres import influxdb

__all__ = ["influxdb"]
