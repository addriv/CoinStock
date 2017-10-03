import $ from 'jquery';

export const stockAjax = (ticker) => (
  $.ajax({
    method: 'GET',
    url: `http://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=INCSV57JMRCTRZ1V`,
  })
);
