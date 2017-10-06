import $ from 'jquery';
import data from './data';

const size = 'full';

export const stockAjax = (ticker) => (
  $.ajax({
    method: 'GET',
    url: `https://www.alphavantage.co/query?outputsize=${size}&function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${data}`,
  })
);

export const coinAjax = (coin) => (
  $.ajax({
      method: 'GET',
      url: `https://min-api.cryptocompare.com/data/histoday?fsym=${coin}&tsym=USD&limit=2000`
    }
  )
);
