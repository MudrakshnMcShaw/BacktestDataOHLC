// import React, { useEffect, useRef, useState } from "react";
// import { widget } from "./charting_library";
// import { toast } from "sonner";

// const API_BASE = "http://164.52.210.127:8000/api";

// export default function TVChart() {
//   const chartContainerRef = useRef(null);
//   const tvWidgetRef = useRef(null);
//   const [defaultSymbol, setDefaultSymbol] = useState("RELIANCE");
//   const [isLoadingSymbols, setIsLoadingSymbols] = useState(true);
//   const symbolsCacheRef = useRef({ stocks: [], options: [] });
//   const optionSetRef = useRef(new Set());


//   useEffect(() => {

//   const loadStockSymbols = async () => {
//     try {
//       setIsLoadingSymbols(true);
//       const res = await fetch(`${API_BASE}/symbols`);

//       if (!res.ok) throw new Error(`Failed: ${res.status}`);

//       const symbols = await res.json();   // array of objects

//       if (Array.isArray(symbols) && symbols.length > 0) {

//         // Extract symbol names
//         const sorted = symbols
//           .map(obj => obj.symbol.toUpperCase())
//           .sort();

//         symbolsCacheRef.current.stocks = sorted;

//         const firstSymbol = sorted[0];
//         setDefaultSymbol(firstSymbol);

//         console.log(`✓ Loaded ${sorted.length} stock symbols`);
//         // toast.success(`Loaded ${sorted.length} stock symbols`);
//       }
//     } catch (err) {
//       console.error("❌ Failed to load stock symbols:", err);
//       toast.error("Could not load stock symbol list");
//     } finally {
//       setIsLoadingSymbols(false);
//     }
//   };

//   const loadOptionsSymbols = async () => {
//     try {
//       setIsLoadingSymbols(true);
//       const res = await fetch(`${API_BASE}/options-symbols`);

//       if (!res.ok) throw new Error(`Failed: ${res.status}`);

//       const symbols = await res.json();  // array of objects

//       if (Array.isArray(symbols) && symbols.length > 0) {
//         const sorted = symbols
//           .map(obj => obj.symbol.toUpperCase())
//           .sort();

//         symbolsCacheRef.current.options = sorted;
//         optionSetRef.current = new Set(sorted);

//         console.log(`✓ Loaded ${sorted.length} option symbols`);
//         toast.success(`Loaded ${sorted.length} option symbols`);
//       }
//     } catch (err) {
//       console.error("❌ Failed to load option symbols:", err);
//       toast.error("Could not load option symbol list");
//     } finally {
//       setIsLoadingSymbols(false);
//     }
//   };

//   loadStockSymbols();
//   loadOptionsSymbols();

// }, []);


//   // Main chart setup
//   useEffect(() => {
//     if (!chartContainerRef.current) return;

//     const datafeed = {
//       onReady: (callback) => {
//         callback({
//           supported_resolutions: ["1", "3", "5", "15", "30", "60", "120", "240", "D", "W", "M"],
//           supports_marks: false,
//           supports_timescale_marks: false,
//           supports_time: true,
//           exchanges: [{ value: "NSE", name: "NSE", desc: "National Stock Exchange" }],
//           symbols_types: [
//             { name: "Stock", value: "stock" },
//             { name: "Option", value: "option" },
//           ],
//         });
//       },



//       searchSymbols: (userInput, exchange, symbolType, onResult) => {
//       const query = userInput.trim().toUpperCase();
//       if (!query) {
//         onResult([]);
//         return;
//       }

//       let combinedList = [];

//       if (!symbolType || symbolType === "stock") {
//         combinedList.push(...symbolsCacheRef.current.stocks);
//       }
//       if (!symbolType || symbolType === "option") {
//         combinedList.push(...symbolsCacheRef.current.options);
//       }

//       combinedList = [...new Set(combinedList)];

//       const matches = combinedList
//         .filter(sym => sym.includes(query))
//         .slice(0, 50);

//       const results = matches.map(sym => ({
//         symbol: sym,
//         full_name: sym,
//         description: sym,
//         exchange: "NSE",
//         ticker: sym,
//         type: optionSetRef.current.has(sym) ? "option" : "stock",
//       }));

//       onResult(results);
//     },


//       resolveSymbol: (symbolName, onResolve, onError) => {

//       const isOption = symbolsCacheRef.current.options?.includes(symbolName);
//       const isStock = /NIFTY|BANKNIFTY|SENSEX|FINNIFTY|MIDCPNIFTY/i.test(symbolName);

//       onResolve({
//         name: symbolName,
//         ticker: symbolName,
//         description: symbolName,
//         type: isStock ? "stock" : (isOption ? "option" : "stock"),
//         session: "0915-1531",
//         timezone: "Asia/Kolkata",
//         exchange: "NSE",
//         minmov: 1,
//         pricescale: isStock ? 1 : 100,
//         has_intraday: true,
//         has_daily: true,
//         has_weekly_and_monthly: true,
//         supported_resolutions: ["1", "3", "5", "15", "30", "60", "120", "240", "D", "W", "M"],
//         volume_precision: 0,
//         data_status: "streaming",
//       });
//     },


//     getBars: async (symbolInfo, resolution, periodParams, onResult, onError) => {
//   const { from, to, firstDataRequest, countBack } = periodParams;

//   try {
//     const symbol = symbolInfo.ticker;

//     const isOption = symbolsCacheRef.current.options.includes(symbol);
//     const apiRoute = isOption ? "options-ohlc" : "ohlc";

//     console.log(
//       `📊 Fetching ${symbol} [${resolution}] (${isOption ? "OPTION" : "STOCK"}) - countBack=${countBack}`
//     );

//     const url = new URL(`${API_BASE}/${apiRoute}`);
//     url.searchParams.append("symbol", symbol);
//     url.searchParams.append("to", to);
//     url.searchParams.append("countBack", countBack || 2000);

//     const res = await fetch(url.toString());

//     if (!res.ok) {
//       const errorText = await res.text();
//       throw new Error(`API Error [${res.status}]: ${errorText || res.statusText}`);
//     }

//     const data = await res.json();

//     if (!Array.isArray(data) || data.length === 0) {
//       console.warn(`⚠️ No data for ${symbol}`);
//       onResult([], { noData: true });
//       return;
//     }

//     const bars = data.map(bar => ({
//       time: bar.time,      // must be in ms
//       open: Number(bar.open),
//       high: Number(bar.high),
//       low: Number(bar.low),
//       close: Number(bar.close),
//       volume: Number(bar.volume || 0),
//     }));

//     bars.sort((a, b) => a.time - b.time);

//     console.log(`✓ Loaded ${bars.length} bars for ${symbol}`);
//     onResult(bars, { noData: false });

//   } catch (err) {
//     console.error(`❌ getBars error [${symbolInfo.ticker}]:`, err);
//     if (firstDataRequest) {
//       toast.error(`Failed to load ${symbolInfo.ticker}: ${err.message}`);
//     }
//     onError(err.message || "Failed to load data");
//   }
// },

//       subscribeBars: () => {},
//       unsubscribeBars: () => {},
//     };

//     const tvWidget = new widget({
//       container: chartContainerRef.current,
//       symbol: defaultSymbol,
//       interval: "1",
//       datafeed,
//       library_path: "/charting_library/",
//       locale: "en",
//       disabled_features: [],
//       enabled_features: ["use_localstorage_for_settings"],
//       fullscreen: false,
//       autosize: true,
//       theme: "dark",
//       timezone: "Asia/Kolkata",
//       loading_screen: { backgroundColor: "#131722" },
//       overrides: {
//         "paneProperties.background": "#131722",
//         "paneProperties.vertGridProperties.color": "#1e222d",
//         "paneProperties.horzGridProperties.color": "#1e222d",
//       },
//     });

//     tvWidgetRef.current = tvWidget;

//     return () => {
//       if (tvWidgetRef.current) {
//         tvWidgetRef.current.remove();
//         tvWidgetRef.current = null;
//       }
//     };
//   }, [defaultSymbol]);

//   return (
//     <div style={{ position: "relative", width: "100%", height: "100vh", background: "#131722" }}>
//       {isLoadingSymbols && (
//         <div style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           background: "rgba(19, 23, 34, 0.8)",
//           zIndex: 1000,
//         }}>
//           <div style={{ color: "#fff", fontSize: "18px" }}>Loading symbols...</div>
//         </div>
//       )}
//       <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />
//     </div>
//   );
// }
import React, { useEffect, useRef, useState } from "react";
import { widget } from "./charting_library";
import { toast } from "sonner";

const API_BASE = "http://164.52.210.127:8000/api";

export default function TVChart() {
  const chartContainerRef = useRef(null);
  const tvWidgetRef = useRef(null);
  const [defaultSymbol, setDefaultSymbol] = useState("RELIANCE");
  const [isLoadingSymbols, setIsLoadingSymbols] = useState(true);
  
  // Optimized: Use maps for O(1) lookups instead of arrays
  const symbolsCacheRef = useRef({ 
    stocksMap: new Map(),  // symbol -> true
    optionsMap: new Map(), // symbol -> true
    allSymbols: []         // for fallback search
  });

  useEffect(() => {
    const loadStockSymbols = async () => {
      try {
        setIsLoadingSymbols(true);
        const res = await fetch(`${API_BASE}/symbols`);

        if (!res.ok) throw new Error(`Failed: ${res.status}`);

        const symbols = await res.json();

        if (Array.isArray(symbols) && symbols.length > 0) {
          const sorted = symbols
            .map(obj => obj.symbol.toUpperCase())
            .sort();

          // Store in Map for O(1) lookups
          sorted.forEach(sym => {
            symbolsCacheRef.current.stocksMap.set(sym, true);
            symbolsCacheRef.current.allSymbols.push(sym);
          });

          const firstSymbol = sorted[0];
          setDefaultSymbol(firstSymbol);

          console.log(`✓ Loaded ${sorted.length} stock symbols`);
        }
      } catch (err) {
        console.error("❌ Failed to load stock symbols:", err);
        toast.error("Could not load stock symbol list");
      } finally {
        setIsLoadingSymbols(false);
      }
    };

    const loadOptionsSymbols = async () => {
      try {
        const res = await fetch(`${API_BASE}/options-symbols`);

        if (!res.ok) throw new Error(`Failed: ${res.status}`);

        const symbols = await res.json();

        if (Array.isArray(symbols) && symbols.length > 0) {
          const sorted = symbols
            .map(obj => obj.symbol.toUpperCase())
            .sort();

          // Store in Map for O(1) lookups
          sorted.forEach(sym => {
            symbolsCacheRef.current.optionsMap.set(sym, true);
            // Only add to allSymbols if not already a stock
            if (!symbolsCacheRef.current.stocksMap.has(sym)) {
              symbolsCacheRef.current.allSymbols.push(sym);
            }
          });

          console.log(`✓ Loaded ${sorted.length} option symbols`);
          toast.success(`Loaded ${sorted.length} option symbols`);
        }
      } catch (err) {
        console.error("❌ Failed to load option symbols:", err);
        toast.error("Could not load option symbol list");
      }
    };

    loadStockSymbols();
    loadOptionsSymbols();
  }, []);

  // Main chart setup
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const datafeed = {
      onReady: (callback) => {
        callback({
          supported_resolutions: ["1", "3", "5", "15", "30", "60", "120", "240", "D", "W", "M"],
          supports_marks: false,
          supports_timescale_marks: false,
          supports_time: true,
          exchanges: [{ value: "NSE", name: "NSE", desc: "National Stock Exchange" }],
          symbols_types: [
            { name: "Stock", value: "stock" },
            { name: "Option", value: "option" },
          ],
        });
      },

      searchSymbols: (userInput, exchange, symbolType, onResult) => {
        try {
          const query = userInput.trim().toUpperCase();
          
          if (!query) {
            onResult([]);
            return;
          }

          const results = [];
          const { stocksMap, optionsMap } = symbolsCacheRef.current;

          // Search stocks if needed
          if (!symbolType || symbolType === "stock") {
            for (const symbol of stocksMap.keys()) {
              if (symbol.includes(query) && results.length < 50) {
                results.push({
                  symbol,
                  full_name: symbol,
                  description: symbol,
                  exchange: "NSE",
                  ticker: symbol,
                  type: "stock",
                });
              }
              if (results.length >= 50) break;
            }
          }

          // Search options if needed and haven't reached limit
          if ((!symbolType || symbolType === "option") && results.length < 50) {
            for (const symbol of optionsMap.keys()) {
              if (symbol.includes(query) && results.length < 50) {
                results.push({
                  symbol,
                  full_name: symbol,
                  description: symbol,
                  exchange: "NSE",
                  ticker: symbol,
                  type: "option",
                });
              }
              if (results.length >= 50) break;
            }
          }

          onResult(results);
        } catch (err) {
          console.error("❌ searchSymbols error:", err);
          onResult([]);
        }
      },

      resolveSymbol: (symbolName, onResolve, onError) => {
        try {
          const isOption = symbolsCacheRef.current.optionsMap.has(symbolName);
          const isStock = /NIFTY|BANKNIFTY|SENSEX|FINNIFTY|MIDCPNIFTY/i.test(symbolName) ||
                          symbolsCacheRef.current.stocksMap.has(symbolName);

          onResolve({
            name: symbolName,
            ticker: symbolName,
            description: symbolName,
            type: isStock ? "stock" : (isOption ? "option" : "stock"),
            session: "0915-1531",
            timezone: "Asia/Kolkata",
            exchange: "NSE",
            minmov: 1,
            pricescale: isStock ? 1 : 100,
            has_intraday: true,
            has_daily: true,
            has_weekly_and_monthly: true,
            supported_resolutions: ["1", "3", "5", "15", "30", "60", "120", "240", "D", "W", "M"],
            volume_precision: 0,
            data_status: "streaming",
          });
        } catch (err) {
          console.error("❌ resolveSymbol error:", err);
          onError(err.message);
        }
      },

      // getBars: async (symbolInfo, resolution, periodParams, onResult, onError) => {
      //   const { from, to, firstDataRequest, countBack } = periodParams;

      //   try {
      //     const symbol = symbolInfo.ticker;
      //     const isOption = symbolsCacheRef.current.optionsMap.has(symbol);
      //     const apiRoute = isOption ? "options-ohlc" : "ohlc";

      //     console.log(
      //       `📊 Fetching ${symbol} [${resolution}] (${isOption ? "OPTION" : "STOCK"}) - countBack=${countBack}`
      //     );

      //     const url = new URL(`${API_BASE}/${apiRoute}`);
      //     url.searchParams.append("symbol", symbol);
      //     url.searchParams.append("to", to);
      //     url.searchParams.append("countBack", countBack || 2000);

      //     const res = await fetch(url.toString());

      //     if (!res.ok) {
      //       const errorText = await res.text();
      //       throw new Error(`API Error [${res.status}]: ${errorText || res.statusText}`);
      //     }

      //     const data = await res.json();

      //     if (!Array.isArray(data) || data.length === 0) {
      //       console.warn(`⚠️ No data for ${symbol}`);
      //       onResult([], { noData: true });
      //       return;
      //     }

      //     const bars = data.map(bar => ({
      //       time: bar.time,
      //       open: Number(bar.open),
      //       high: Number(bar.high),
      //       low: Number(bar.low),
      //       close: Number(bar.close),
      //       volume: Number(bar.volume || 0),
      //     }));

      //     // bars.sort((a, b) => a.time - b.time);

      //     // console.log(`✓ Loaded ${bars.length} bars for ${symbol}`);
      //     onResult(bars, { noData: false });
      //   } catch (err) {
      //     console.error(`❌ getBars error [${symbolInfo.ticker}]:`, err);
      //     if (firstDataRequest) {
      //       toast.error(`Failed to load ${symbolInfo.ticker}: ${err.message}`);
      //     }
      //     onError(err.message || "Failed to load data");
      //   }
      // },
      getBars: async (symbolInfo, resolution, periodParams, onResult, onError) => {
        const { from, to, firstDataRequest } = periodParams;

        try {
          const symbol = symbolInfo.ticker;
          const isOption = symbolsCacheRef.current.optionsMap.has(symbol);
          const apiRoute = isOption ? "options-ohlc" : "ohlc";

          console.log(`📊 Fetching ${symbol} [${resolution}] (from=${from}, to=${to})`);

          const url = new URL(`${API_BASE}/${apiRoute}`);
          url.searchParams.append("symbol", symbol);
          url.searchParams.append("from", from);
          url.searchParams.append("to", to);

          const res = await fetch(url.toString());

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`API Error [${res.status}]: ${errorText || res.statusText}`);
          }

          const data = await res.json();

          if (!Array.isArray(data) || data.length === 0) {
            console.warn(`⚠️ No data for ${symbol}`);
            onResult([], { noData: true });
            return;
          }

          const bars = data.map(d => ({
            time: d.time,
            open: Number(d.open),
            high: Number(d.high),
            low: Number(d.low),
            close: Number(d.close),
            volume: Number(d.volume || 0),
          }));

          onResult(bars, { noData: false });
        } catch (err) {
          console.error(`❌ getBars error [${symbolInfo.ticker}]:`, err);
          if (firstDataRequest) {
            toast.error(`Failed to load ${symbolInfo.ticker}: ${err.message}`);
          }
          onError(err.message || "Failed to load data");
        }
      },

      subscribeBars: () => {},
      unsubscribeBars: () => {},
    };

    const tvWidget = new widget({
      container: chartContainerRef.current,
      symbol: defaultSymbol,
      interval: "1",
      datafeed,
      library_path: "/charting_library/",
      locale: "en",
      disabled_features: [],
      enabled_features: ["use_localstorage_for_settings"],
      fullscreen: false,
      autosize: true,
      theme: "dark",
      timezone: "Asia/Kolkata",
      loading_screen: { backgroundColor: "#131722" },
      overrides: {
        "paneProperties.background": "#131722",
        "paneProperties.vertGridProperties.color": "#1e222d",
        "paneProperties.horzGridProperties.color": "#1e222d",
      },
    });

    tvWidgetRef.current = tvWidget;

    return () => {
      if (tvWidgetRef.current) {
        tvWidgetRef.current.remove();
        tvWidgetRef.current = null;
      }
    };
  }, [defaultSymbol]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "#131722" }}>
      {isLoadingSymbols && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(19, 23, 34, 0.8)",
          zIndex: 1000,
        }}>
          <div style={{ color: "#fff", fontSize: "18px" }}>Loading symbols...</div>
        </div>
      )}
      <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}