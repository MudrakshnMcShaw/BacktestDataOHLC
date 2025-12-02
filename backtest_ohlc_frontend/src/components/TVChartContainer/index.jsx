// import React, { useEffect, useRef } from 'react';
// import './index.css';
// import { widget } from '../../charting_library';
// import Datafeed from '../../datafeed';

// function getLanguageFromURL() {
// 	const regex = new RegExp('[\\?&]lang=([^&#]*)');
// 	const results = regex.exec(window.location.search);
// 	return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
// }

// export const TVChartContainer = () => {
// 	const chartContainerRef = useRef();

// 	const defaultProps = {
// 		symbol: 'AAPL',
// 		interval: 'D',
// 		// datafeedUrl: 'https://demo_feed.tradingview.com',
//     datafeed: Datafeed,
// 		libraryPath: '/charting_library/',
// 		// chartsStorageUrl: 'https://saveload.tradingview.com',
// 		chartsStorageApiVersion: '1.1',
// 		clientId: 'tradingview.com',
// 		userId: 'public_user_id',
// 		fullscreen: false,
// 		autosize: true,
// 		studiesOverrides: {},
// 	};

// 	useEffect(() => {
// 		const widgetOptions = {
// 			symbol: defaultProps.symbol,
// 			// BEWARE: no trailing slash is expected in feed URL
// 			datafeed: new window.Datafeeds.UDFCompatibleDatafeed(defaultProps.datafeedUrl),
// 			interval: defaultProps.interval,
// 			container: chartContainerRef.current,
// 			library_path: defaultProps.libraryPath,

// 			locale: getLanguageFromURL() || 'en',
// 			disabled_features: ['use_localstorage_for_settings'],
// 			enabled_features: ['study_templates'],
// 			charts_storage_url: defaultProps.chartsStorageUrl,
// 			charts_storage_api_version: defaultProps.chartsStorageApiVersion,
// 			client_id: defaultProps.clientId,
// 			user_id: defaultProps.userId,
// 			fullscreen: defaultProps.fullscreen,
// 			autosize: defaultProps.autosize,
// 			studies_overrides: defaultProps.studiesOverrides,
// 		};

// 		const tvWidget = new widget(widgetOptions);

// 		tvWidget.onChartReady(() => {
// 			tvWidget.headerReady().then(() => {
// 				const button = tvWidget.createButton();
// 				button.setAttribute('title', 'Click to show a notification popup');
// 				button.classList.add('apply-common-tooltip');
// 				button.addEventListener('click', () => tvWidget.showNoticeDialog({
// 					title: 'Notification',
// 					body: 'TradingView Charting Library API works correctly',
// 					callback: () => {
// 						console.log('Noticed!');
// 					},
// 				}));

// 				button.innerHTML = 'Check API';
// 			});
// 		});

// 		return () => {
// 			tvWidget.remove();
// 		};
// 	});

// 	return (
// 		<div
// 			ref={chartContainerRef}
// 			className={'TVChartContainer'}
// 		/>
// 	);
// }






























// import React, { memo, useEffect, useRef } from 'react';
// import { widget } from '../../charting_library';
// import Datafeed from '../../datafeed';
// import './index.css';

// const TradingViewChart = () => {
//   const containerRef = useRef(null);

//   useEffect(() => {
//     const initChart = () => {
//       if (!containerRef.current) {
//         console.error('Container reference is null');
//         return;
//       }

//       const chart = new widget({
//         container: 'TVChartContainer',
//         symbol: 'IBM',
//         interval: 'D',
//         container: containerRef.current,
//         datafeed: Datafeed,
//         library_path: 'charting_library/',
//         locale: 'en',
//         disabled_features: ['use_localstorage_for_settings'],
//         enabled_features: ['study_templates'],
//         clientId: 'tradingview.com',
//         userId: 'public_user_id',
//         style: '1',
//         timezone:'Asia/Kolkata',
//         // debug: true,
//         theme: "dark",
//         // overrides: {
//         //   "paneProperties.backgroundGradientStartColor": "#020024",
//         //   "paneProperties.backgroundGradientEndColor": "#4f485e",
//         //   "paneProperties.horzGridProperties.style": "1"
//         // },
//         fullscreen: false,
//         autosize: true,
//         // hide_side_toolbar: false,
//         // allow_symbol_change: true,
//         // studies_overrides:{}
//         // "allow_symbol_change": true,
//         // "withdateranges": true,
//         // "allow_symbol_change": true,
//         // "save_image": false,
//         // "details": true,
//         // "hotlist": true,
//         // "calendar": false,
//       });

//       chart.onChartReady(() => {
//         console.log('Chart has been initialized');
//       });

//       return () => {
//         chart.remove();
//         console.log('Chart removed');
//       };
//     };

//     // Delay initialization to ensure the element exists
//     const timeoutId = setTimeout(initChart, 100);

//     return () => clearTimeout(timeoutId);
//   }, []);

//   return (
//     <div
//       ref={containerRef}
//       className='TVChartContainer'
//     />
//   );
// };

// export default memo(TradingViewChart);
