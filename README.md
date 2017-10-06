# COIN STOCK

Live version: [Coin Stock](http://www.coinstock.live/)

## Overview

With the rise of blockchain and cryptocurrencies becoming a viable vehicle for investing, the ability to compare and contrast stock with cryptocurrency prices becomes more and more valuable.

Coin Stock is just the app for that! It is an application that pulls and visualizes live and up to date data for both the US Stock Market and Cryptocurrency prices.

Now you can chart stock prices such as Amazon(AMZN) and S&P 500(SPX) with cryptocurrencies like Bitcoin and Ethereum.

## Technologies

* D3.js
* Vanilla JavaScript
* REST APIs
  * Alpha Vantage API for stock prices
  * Crypto Compare API for crypto currency prices

## Functionality

* Pull data for a single ticker
* Pull data for two tickers and chart simultaneously
* Adjust date range using d3 brush
* Enter a mock investment value at start date to calculate profit vs time

## Design

Coin stock uses a currying function to allow for simultaneous AJAX requests to pull data from both Alpha Avantage and Crypto Compare APIs.

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

![Design](https://github.com/addriv/coin_stock/blob/master/assets/images/coinstock_overview.png)
