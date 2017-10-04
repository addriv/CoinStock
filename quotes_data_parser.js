function parseQuotesData(quotesData, priceType, valueType){
  let startDate, endDate, quotes, parsedData, minPrice, maxPrice, priceStart;
  const percentChange = (price, startPrice) => (
    (price - startPrice)/ startPrice * 100
  );

  if (quotesData["Time Series (Daily)"]){
    quotes = quotesData["Time Series (Daily)"];
    const dates = Object.keys(quotes).sort();
    const quoteKeys = Object.keys(quotes[dates[0]]);
    const priceKey = quoteKeys.filter(key => key.includes(priceType))[0];

    priceStart = parseFloat(quotes[dates[0]][priceKey]);

    parsedData = dates.map(date => {
      const dayPrice = parseFloat(quotes[date][priceKey]);

      // Set prices as percent change if valueType = '%'
      if (valueType === '%'){

        if (!minPrice || minPrice > percentChange(dayPrice, priceStart)) {
          minPrice = percentChange(dayPrice, priceStart);
        }
        if (!maxPrice || maxPrice < percentChange(dayPrice, priceStart)) {
          maxPrice = percentChange(dayPrice, priceStart);
        }

        return {
          date: new Date(date),
          open: percentChange(parseFloat(quotes[date]["1. open"]), priceStart),
          close: percentChange(parseFloat(quotes[date]["4. close"]), priceStart),
          low: percentChange(parseFloat(quotes[date]["3. low"]), priceStart),
          high: percentChange(parseFloat(quotes[date]["2. high"]), priceStart),
          volume: percentChange(parseInt(quotes[date]["5. volume"]), priceStart)
        };
      }
      //Else set prices to USD
      else {
        if (!minPrice || minPrice > quotes[date][priceKey]) {
          minPrice = parseFloat(quotes[date][priceKey]);
        }
        if (!maxPrice || maxPrice < quotes[date][priceKey]) {
          maxPrice = parseFloat(quotes[date][priceKey]);
        }

        return {
          date: new Date(date),
          open: parseFloat(quotes[date]["1. open"]),
          close: parseFloat(quotes[date]["4. close"]),
          low: parseFloat(quotes[date]["3. low"]),
          high: parseFloat(quotes[date]["2. high"]),
          volume: parseInt(quotes[date]["5. volume"])
        };
      }
    });
    startDate = parsedData[0].date;
    endDate = parsedData.slice(-1)[0].date;
  }
  else {
    quotes = quotesData["Data"];
    priceStart = quotesData["Data"][0][priceType];

    parsedData = quotes.map(quote => {
      if (valueType === '%'){
        if (!minPrice ||
          minPrice > percentChange(quote[priceType], priceStart)) {
            minPrice = percentChange(quote[priceType], priceStart);
          }
        if (!maxPrice ||
          maxPrice < percentChange(quote[priceType], priceStart)) {
            maxPrice = percentChange(quote[priceType], priceStart);
          }

        return {
          date: new Date(quote.time),
          open: percentChange(quote.open, priceStart),
          close:  percentChange(quote.close, priceStart),
          low:  percentChange(quote.low, priceStart),
          high:  percentChange(quote.high, priceStart)
        };
      }
      else {
        if (!minPrice || minPrice > quote[priceType]) {
          minPrice = quote[priceType];
        }
        if (!maxPrice || maxPrice < quote[priceType]) {
          maxPrice = quote[priceType];
        }

        return {
          date: new Date(quote.time),
          open: quote.open,
          close: quote.close,
          low: quote.low,
          high: quote.high
        };
      }
    });

    startDate = parsedData[0].date;
    endDate = parsedData[parsedData.length - 1].date;
  }

  return [parsedData, startDate, endDate, minPrice, maxPrice];
}

export default parseQuotesData;
