import $ from 'jquery';

const size = 'full';

export const stockAjax = (ticker) => (
  $.ajax({
    method: 'GET',
    url: `http://www.alphavantage.co/query?outputsize=${size}&function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=INCSV57JMRCTRZ1V`,
  })
);

export const coinAjax = () => (
  $.ajax({
      method: 'GET',
      url: 'https://coinbin.org/coins'
  })
);
