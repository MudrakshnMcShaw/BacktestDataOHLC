# TradingView Charting Library and React Integration Example (JavaScript)

The earliest supported version of the charting library for these examples is `v23.043`.

## How to start

1. Check that you can view https://github.com/tradingview/charting_library/. If you do not have access then you can [request access to this repository here](https://www.tradingview.com/HTML5-stock-forex-bitcoin-charting-library/).
1. Install dependencies `npm install`.
1. Copy the charting library files
	1. If you are able to run bash scripts then the `copy_charting_library_files.sh` script can be used to copy the current stable version's files.
	1. If you are not able to run bash scripts then do the following:
		1. Copy `charting_library` from https://github.com/tradingview/charting_library/ to `/public` and `/src`.
		1. Copy `datafeeds` from https://github.com/tradingview/charting_library/ to `/public`.
1. Run `npm start`. It will build the project and open a default browser with the Charting Library.

## What is Charting Library

Charting Library is a standalone solution for displaying charts. This free, downloadable library is hosted on your servers and is connected to your data feed to be used in your website or app. [Learn more and download](https://www.tradingview.com/HTML5-stock-forex-bitcoin-charting-library/).

## What is React

React is a JavaScript library for building user interfaces. It is maintained by Facebook, Instagram and a community of individual developers and corporations.

## About This Project

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).


##### DOCUMENTATION ######

# Overview
This React component integrates a TradingView chart with custom data fetched from a backend API. It includes functionalities for searching symbols, resolving symbol details, fetching historical data, and setting up the TradingView widget.

# Key Components
fetchData: Fetches chart data from the backend API.
formatDataForTradingView: Formats the fetched data to the format required by TradingView.
Datafeed: Implements the TradingView data feed interface, providing methods for symbol search, symbol resolution, and bar data retrieval.
App: The main React component that initializes and configures the TradingView widget.
# Installation and Setup
Install Dependencies: Ensure you have React and the TradingView Charting Library.
Backend API: Set up your backend to provide chart data at the specified endpoint.
Run the Application: Start your React application and ensure the backend API is running.

# Conclusion
This documentation and the commented code provide a clear understanding of how to integrate a TradingView chart in a React application with custom symbol types and data fetching from an API. If further customization or features are needed, the TradingView Charting Library documentation can be referred to for additional options and configurations.