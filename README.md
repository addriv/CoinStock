# [logo](Chttps://github.com/addriv/coin_stock/blob/master/favicon.ico) COIN STOCK

Live version: [Coin Stock](https://addriv.github.io/coin_stock/)

## Overview

With the rise of blockchain and cryptocurrencies becoming a viable vehicle for investing, the ability to compare and contrast stock with cryptocurrency prices becomes more and more valuable.

Coin Stock is just the app for that! It is an application that pulls and visualizes live and up to date data for both the US Stock Market and Cryptocurrency prices.

Now you can chart stock prices such as Amazon(AMZN) and S&P 500(SPX) with cryptocurrencies like Bitcoin and Ethereum.

**Technologies**

* D3.js
* Vanilla JavaScript
* REST APIs
  * Alpha Vantage API for stock prices
  * Crypto Compare API for crypto currency prices

<p align="center">
  <img src="https://github.com/addriv/coin_stock/blob/master/assets/images/overview.gif">
</p>

## Functionality

* Pull data for a single ticker
* Pull data for two tickers and chart simultaneously
* Adjust date range using d3 brush
* Enter a mock investment value at start date to calculate profit vs time

## Design

One of the challenges faced while building Coin Stock was the delay from pulling price data. Since AJAX requests to the Alpha Avantage and Crypto Compare APIs are asynchronous, a currying function was implemented to minimize the delay on charting price data.

A data parsing function was created to parse data from either of the two APIs to keep code modular. After a response is received from the APIs, the response is parsed to get data into the desired format for D3.js.

The currying function then waits for the correct number of responses(numTickers) to be parsed before running the comparisonChart function which takes the parsed data and charts prices with D3.js. This ensures the minimum delay is experienced by the user before price charting begins.

````js
function curryAjax(numTickers){
  const responses = [];

  function _curriedFn(ajaxResponse){
    responses.push(parseQuotesData(ajaxResponse));

    if (responses.length === numTickers){
      comparisonChart(ajaxResponse);
    }
    else {
      return _curriedFn;
    }
  }

  return _curriedFn;
}
}
````

## Future Features

* Daily volume data bar charts with running averages
* Allow users to pull data for a given date range