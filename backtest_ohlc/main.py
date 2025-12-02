
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
# from database import create_indexes, disconnect_all
from routes.ohlc import router as ohlc_router


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     """
#     Lifespan context manager for app startup and shutdown
#     """
#     # Startup
#     print("🚀 Starting TradingView Backend...")
#     try:
#         await create_indexes()
#         print("✓ Indexes created successfully")
#     except Exception as e:
#         print(f"❌ Failed to create indexes: {e}")
#         raise
    
#     yield
    
#     # Shutdown
#     print("🛑 Shutting down...")
#     await disconnect_all()
#     print("✓ Cleanup complete")


# Initialize FastAPI app
app = FastAPI(
    title="TradingView Backend",
    description="FastAPI backend for TradingView charting library with MongoDB",
    version="1.0.0",
    # lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ohlc_router)


# Health check endpoint
@app.get("/health")
async def health():
    """Health check endpoint for load balancer"""
    return {
        "status": "ok",
        "service": "tradingview-backend"
    }


# Run application
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)