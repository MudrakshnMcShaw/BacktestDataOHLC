from fastapi import APIRouter, Query, HTTPException
from datetime import datetime
import time
from database import get_database, get_options_database, MONGODB_URI

router = APIRouter(prefix="/api", tags=["backtest_data"])


def get_year_range(from_ts: int, to_ts: int) -> list:
    """Get list of years from timestamp range"""
    from_date = datetime.utcfromtimestamp(from_ts)
    to_date = datetime.utcfromtimestamp(to_ts)
    return list(range(from_date.year, to_date.year + 1))


@router.get("/symbols")
async def get_all_stocks_symbols():
    """Get all unique symbols from all year collections"""
    try:
        db = get_database(MONGODB_URI)
        unique_symbols = set()

        # Get list of all collections
        collections = await db.list_collection_names()

        # Query each year collection for unique symbols
        for year in range(2015, 2026):  # Years 2015-2025
            coll_name = str(year)
            if coll_name in collections:
                try:
                    symbols = await db[coll_name].distinct("sym")
                    unique_symbols.update(symbols)
                except Exception as e:
                    print(f"Warning: Could not query year {year}: {e}")
                    continue

        # return sorted(list(unique_symbols))
        return [
                    {"symbol": s, "type": "stock"}   # or "futures" if applicable
                    for s in sorted(list(unique_symbols))
                ]
    
    except Exception as e:
        print(f"ERROR in get_symbols: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching symbols: {str(e)}")

@router.get("/options-symbols")
async def get_all_options_symbols():
    try:
        db = get_options_database(MONGODB_URI)
        unique_symbols = set()

        collections = await db.list_collection_names()

        for year in range(2018, 2026):
            coll_name = str(year)
            if coll_name in collections:
                try:
                    symbols = await db[coll_name].distinct("sym")
                    # print(symbols)
                    unique_symbols.update(symbols)
                except Exception as e:
                    print(f"Warning: Could not query year {year}: {e}")
                    continue
        # print(unique_symbols)
        # return sorted(list(unique_symbols))
        return [
            {"symbol": s, "type": "option"}   # or "futures" if applicable
            for s in sorted(list(unique_symbols))
        ]
    except Exception as e:
        print(f"ERROR in get_symbols: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching symbols: {str(e)}")

@router.get("/ohlc")
async def get_ohlc(
    symbol: str = Query(...),
    from_ts: int = Query(..., alias="from"),  
    to_ts: int = Query(..., alias="to"),
):
    try:
        symbol = symbol.upper().strip()
        db = get_database(MONGODB_URI)

        bars = []

        from_dt = datetime.fromtimestamp(from_ts)
        to_dt = datetime.fromtimestamp(to_ts)

        # Years between from and to
        for year in range(to_dt.year, from_dt.year - 1, -1):
            coll_name = str(year)
            if coll_name not in await db.list_collection_names():
                continue

            coll = db[coll_name]

            cursor = coll.find(
                {
                    "sym": symbol,
                    "ti": {"$gte": from_ts, "$lte": to_ts}
                },
                {"_id": 0, "ti": 1, "o": 1, "h": 1, "l": 1, "c": 1, "v": 1}
            ).sort("ti", 1)

            docs = await cursor.to_list(length=None)
            bars.extend(docs)

        # Format for TradingView
        return [
            {
                "time": (d["ti"] - 19800) * 1000,
                "open": float(d["o"]),
                "high": float(d["h"]),
                "low": float(d["l"]),
                "close": float(d["c"]),
                "volume": int(d.get("v") or 0)
            }
            for d in bars
        ]

    except Exception as e:
        raise HTTPException(500, f"Error: {e}")


@router.get("/options-ohlc")
async def get_options_ohlc(
    symbol: str = Query(..., description="Stock symbol"),
    from_ts: int = Query(..., alias = "from"),
    to_ts: int = Query(..., alias = "to")
):
    """
    Fetch OHLC data for a symbol
    
    Query params:
        symbol: Stock symbol (e.g., "360ONE")
        to: End timestamp in seconds (optional, defaults to now)
        countBack: Number of bars to fetch (default: 2000, max: 10000)
    
    Returns:
        List of OHLC bars: [{time, open, high, low, close, volume}, ...]
    """
    try:
        # Validate symbol
        if not symbol:
            raise HTTPException(status_code=400, detail="Symbol is required")
        
        symbol = symbol.upper().strip()
        db = get_options_ohlc(MONGODB_URI)
        bars = []

        from_ts = datetime.fromtimestamp(from_ts)
        to_ts = datetime.fromtimestamp(to_ts)

        # Iterate through years backwards, fetching data
        for year in range(to_ts.year, from_ts.year - 1, -1):
            coll_name = str(year)
            
            coll = await db.list_collection_names()
            if coll_name not in coll:
                continue
                
            coll = db[coll_name]
                                
            cursor = coll.find(
                    {
                        "sym": symbol,
                        "ti": {"$gte": from_ts, "$lte": to_ts}
                    },
                    {"_id": 0, "ti": 1, "o": 1, "h": 1, "l": 1, "c": 1, "v": 1}
                ).sort("ti", 1)
                
            docs = await cursor.to_list(length=None)
                
            bars.extend(docs)                
        
        # Format response
        return [
            {
                "time": (d["ti"] -19800) * 1000,
                "open": float(d["o"]),
                "high": float(d["h"]),
                "low": float(d["l"]),
                "close": float(d["c"]),
                "volume": int(d.get("v") or 0)
            }
            for d in bars
        ]
        
        # print(f"Returning {len(bars)} bars for {symbol}")
        # return bars
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in get_ohlc: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching OHLC data: {str(e)}")