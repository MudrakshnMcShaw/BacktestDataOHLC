import os
import json
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import MongoClient
from dotenv import load_dotenv
from logger_setup import logger

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")
OPTIONS_DB = os.getenv("OPTIONS_DB")


_async_clients_by_uri = {}  # uri -> AsyncIOMotorClient (async)
_sync_clients_by_uri = {}   # uri -> MongoClient (sync, for connection check)
_failed_uris = set()        # uris that failed to connect permanently
_db_instances = {}

# load src uris
def _load_src_uris() -> List[str]:
    json_val = os.getenv("SRC_URIS_JSON")
    if json_val:
        try:
            parsed = json.loads(json_val)
            if isinstance(parsed, list) and parsed:
                return parsed
        except Exception:
            logger.warning("SRC_URIS_JSON exists but failed to parse as JSON, falling back to SRC_URIS")

SRC_URIS = _load_src_uris()
if SRC_URIS is None:
    SRC_URIS = []


def get_sync_client(uri: str) -> MongoClient:
    """
    Get or create a MongoClient for the given URI.
    Caches successful clients and pings on first creation.
    Raises ConnectionError if cannot connect.
    """
    if uri in _failed_uris:
        raise ConnectionError(f"MongoDB ({uri}) is marked offline")

    if uri in _sync_clients_by_uri:
        return _sync_clients_by_uri[uri]

    try:
        logger.info(f"[MongoDB] Connecting to {uri} ...")
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")
        _sync_clients_by_uri[uri] = client
        logger.info(f"[MongoDB] Connected: {uri}")
        return client
    except Exception as exc:
        logger.error(f"[MongoDB] Connection failed for {uri}: {exc}", exc_info=True)
        _failed_uris.add(uri)
        raise ConnectionError(f"Cannot connect to MongoDB: {uri}") from exc

def get_async_client(uri: str) -> AsyncIOMotorClient:
    """
    Get or create an AsyncIOMotorClient for the given URI.
    Used for async operations in FastAPI endpoints.
    """

    if uri in _failed_uris:
        raise ConnectionError(f"MongoDB ({uri}) is marked offline")

    if uri in _async_clients_by_uri:
        return _async_clients_by_uri[uri]

    try:
        print(f"[MongoDB] Connecting (async) to {uri} ...")
        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
        _async_clients_by_uri[uri] = client
        print(f"[MongoDB] Connected (async): {uri}")
        return client
    except Exception as exc:
        print(f"[MongoDB] Async connection failed for {uri}: {exc}")
        _failed_uris.add(uri)
        raise ConnectionError(f"Cannot connect to MongoDB: {uri}") from exc

# def get_database(uri: str = MONGODB_URI) -> AsyncIOMotorDatabase:
#     """
#     Get or create an AsyncIOMotorDatabase instance.
#     Returns the database object for async queries.
#     """
#     if uri in _db_instances:
#         return _db_instances[uri]
    
#     client = get_async_client(uri)
#     db = client[DATABASE_NAME]
#     _db_instances[uri] = db
#     return db

# def get_options_database(uri: str = MONGODB_URI) -> AsyncIOMotorDatabase:
#     if uri in _db_instances:
#         return _db_instances[uri]
#     client = get_async_client(uri)
#     db = client[OPTIONS_DB]
#     _db_instances[uri] = db
#     return db


# _db_instances = {}  # (uri, db_name) -> AsyncIOMotorDatabase

def get_database(uri: str = MONGODB_URI) -> AsyncIOMotorDatabase:
    """Get or create an AsyncIOMotorDatabase instance."""
    key = (uri, DATABASE_NAME)
    if key in _db_instances:
        return _db_instances[key]
    
    client = get_async_client(uri)
    db = client[DATABASE_NAME]
    _db_instances[key] = db
    return db

def get_options_database(uri: str = MONGODB_URI) -> AsyncIOMotorDatabase:
    """Get or create an options AsyncIOMotorDatabase instance."""
    key = (uri, OPTIONS_DB)
    if key in _db_instances:
        return _db_instances[key]
    
    client = get_async_client(uri)
    db = client[OPTIONS_DB]
    _db_instances[key] = db
    return db