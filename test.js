import $ from 'jquery';
import googleFinance from 'google-finance';
// var googleFinance = require('google-finance');

const pingApi = () => (
  $.ajax({
    method: 'GET',
    url: "https://www.google.com/finance/historical?q=AAPL",
    crossDomain: true
  })
);

window.request = pingApi;

let responseData;

const httpRequestOptions = {
  crossDomain: true
};

document.addEventListener('DOMContentLoaded', () =>{
  const body = document.getElementsByTagName('body')[0];
});


// API Key
// INCSV57JMRCTRZ1V
