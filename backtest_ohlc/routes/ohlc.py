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
    symbol: str = Query(..., description="Stock symbol"),
    to_ts: int = Query(None, alias="to", description="End timestamp in seconds"),
    countBack: int = Query(2000, description="Number of bars to fetch"),
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
        end_ts = to_ts or int(time.time())
        max_bars = min(countBack, 10000)  # Safety limit
        
        print(f"Fetching {max_bars} bars for {symbol} ending at {end_ts}")
        
        db = get_database(MONGODB_URI)
        all_docs = []
        current_year = datetime.fromtimestamp(end_ts).year
        
        # Iterate through years backwards, fetching data
        for year in range(current_year, current_year - 20, -1):
            coll_name = str(year)
            
            try:
                # Check if collection exists
                collections = await db.list_collection_names()
                if coll_name not in collections:
                    continue
                
                collection = db[coll_name]
                remaining = max_bars - len(all_docs)
                
                if remaining <= 0:
                    break
                
                # Query database for this year
                # Sort descending (newest first) and limit
                cursor = collection.find(
                    {
                        "sym": symbol,
                        "ti": {"$lte": end_ts}
                    },
                    {"_id": 0, "ti": 1, "o": 1, "h": 1, "l": 1, "c": 1, "v": 1}
                ).sort("ti", -1).limit(remaining)
                
                docs = await cursor.to_list(length=remaining)
                
                if not docs:
                    continue
                
                all_docs.extend(docs)
                # Update end_ts to be before the oldest bar we got
                end_ts = docs[-1]["ti"] - 1
                
                print(f"  Year {year}: Got {len(docs)} bars")
                
                if len(all_docs) >= max_bars:
                    break
            
            except Exception as e:
                print(f"Warning: Error querying year {year}: {e}")
                continue
        
        if not all_docs:
            print(f"No data found for {symbol}")
            return []
        
        # Remove duplicates (in case same timestamp appears in multiple years)
        seen = set()
        unique = []
        for doc in all_docs:
            if doc["ti"] not in seen:
                seen.add(doc["ti"])
                unique.append(doc)
            if len(unique) >= max_bars:
                break
        
        # Sort ascending by time for TradingView (oldest first)
        unique.sort(key=lambda x: x["ti"])
        
        # Format response
        bars = [
            {
                "time": d["ti"] * 1000,  # Convert seconds to milliseconds for TradingView
                "open": float(d["o"]),
                "high": float(d["h"]),
                "low": float(d["l"]),
                "close": float(d["c"]),
                "volume": int(d.get("v") or 0)
            }
            for d in unique
        ]
        
        print(f"Returning {len(bars)} bars for {symbol}")
        return bars
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in get_ohlc: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching OHLC data: {str(e)}")
    

@router.get("/options-ohlc")
async def get_options_ohlc(
    symbol: str = Query(..., description="Stock symbol"),
    to_ts: int = Query(None, alias="to", description="End timestamp in seconds"),
    countBack: int = Query(2000, description="Number of bars to fetch"),
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
        end_ts = to_ts or int(time.time())
        max_bars = min(countBack, 10000)  # Safety limit
        
        print(f"Fetching {max_bars} bars for {symbol} ending at {end_ts}")
        
        db = get_options_database(MONGODB_URI)
        all_docs = []
        current_year = datetime.fromtimestamp(end_ts).year
        
        # Iterate through years backwards, fetching data
        for year in range(current_year, current_year - 20, -1):
            coll_name = str(year)
            
            try:
                # Check if collection exists
                collections = await db.list_collection_names()
                if coll_name not in collections:
                    continue
                
                collection = db[coll_name]
                remaining = max_bars - len(all_docs)
                
                if remaining <= 0:
                    break
                
                # Query database for this year
                # Sort descending (newest first) and limit
                cursor = collection.find(
                    {
                        "sym": symbol,
                        "ti": {"$lte": end_ts}
                    },
                    {"_id": 0, "ti": 1, "o": 1, "h": 1, "l": 1, "c": 1, "v": 1}
                ).sort("ti", -1).limit(remaining)
                
                docs = await cursor.to_list(length=remaining)
                
                if not docs:
                    continue
                
                all_docs.extend(docs)
                # Update end_ts to be before the oldest bar we got
                end_ts = docs[-1]["ti"] - 1
                
                print(f"  Year {year}: Got {len(docs)} bars")
                
                if len(all_docs) >= max_bars:
                    break
            
            except Exception as e:
                print(f"Warning: Error querying year {year}: {e}")
                continue
        
        if not all_docs:
            print(f"No data found for {symbol}")
            return []
        
        # Remove duplicates (in case same timestamp appears in multiple years)
        seen = set()
        unique = []
        for doc in all_docs:
            if doc["ti"] not in seen:
                seen.add(doc["ti"])
                unique.append(doc)
            if len(unique) >= max_bars:
                break
        
        # Sort ascending by time for TradingView (oldest first)
        unique.sort(key=lambda x: x["ti"])
        
        # Format response
        bars = [
            {
                "time": d["ti"] * 1000,  # Convert seconds to milliseconds for TradingView
                "open": float(d["o"]),
                "high": float(d["h"]),
                "low": float(d["l"]),
                "close": float(d["c"]),
                "volume": int(d.get("v") or 0)
            }
            for d in unique
        ]
        
        print(f"Returning {len(bars)} bars for {symbol}")
        return bars
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in get_ohlc: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching OHLC data: {str(e)}")