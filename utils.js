import $ from 'jquery';

const size = 'full';

export const stockAjax = (ticker) => (
  $.ajax({
    method: 'GET',
    url: `http://www.alphavantage.co/query?outputsize=${size}&function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=INCSV57JMRCTRZ1V`,
  })
);

export const coinAjax = (coin) => (
  $.ajax({
      method: 'GET',
      url: `https://min-api.cryptocompare.com/data/histoday?fsym=${coin}&tsym=USD&limit=2000`
    }
  )
);
