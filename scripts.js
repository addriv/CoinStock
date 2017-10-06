import * as utils from './utils';
import * as charts from './charts';
import * as tickerLists from './tickers';
import comparisonChart from './comparison';
import parseQuotesData from './quotes_data_parser';

//Variables for testing
const UNITS = '';
const PRICE_TYPE = 'close';
//Variables for testing

const stockTickers = tickerLists.stockList.map(company => company["Symbol"]);
const coinTickers = tickerLists.coinList.map(coin => coin["Symbol"].toUpperCase());

function handleAnalyze(){
  errorsOff();
  spinnerOn();

  const tickerInput = document.getElementById('ticker');
  const activeCharts = document.getElementsByClassName('svg-chart');
  const investment = document.getElementById('investment');

  //Remove charts if they exist
  for (let i = 0; i < activeCharts.length; i++){
    activeCharts[i].remove();
  }

  //Ajax request and chart based on checked ticker type radio button
  if (document.getElementsByName('single-ticker')[0].checked){
    utils.coinAjax(tickerInput.value.toUpperCase()).then(
      res => {
        if (res.Response === 'Error' || res['Error Message']) {
          spinnerOff();
          errorsOn();
        }
        else {
          charts.chartStock(tickerInput.value, res, parseInt(investment.value));
        }
      });
    }
  else {
    utils.stockAjax(tickerInput.value.toUpperCase()).then(
      res => {
        if (res.Response === 'Error' || res['Error Message']) {
          spinnerOff();
          errorsOn();
        }
        else { charts.chartStock(
        tickerInput.value, res, parseInt(investment.value));
      }
    });
  }
}

function switchTabs(event, tabType){
  return () => {
    let i, tabcontent, tablinks;

    //Get all tabcontent elements and hide them
    tabcontent = document.getElementsByClassName('tabcontent');
    for (i = 0; i < tabcontent.length; i++){
      tabcontent[i].style.display = 'none';
    }

    //Get all tablinks and remove active class
    tablinks = document.getElementsByClassName('tablinks');
    for (i = 0; i < tablinks.length; i++){
      const newClassName = tablinks[i].className.replace('active', '');
      tablinks[i].className = newClassName;
    }

    //Reveal current tab and add active class
    const selectedTab = document.getElementById(tabType);
    selectedTab.style.display = 'block';
    const btnId = `${tabType}-tab`;
    document.getElementById(btnId).className += ' active';
  };
}

function handleTicker(event){
  const ticker = event.target.value.toUpperCase();
  const tickerId = event.target.id;
  const tickerTypeRadios = document.getElementsByName(tickerId);
  const listLabel = document.getElementById('list-label');

  let symbolList;
  if (document.getElementsByName(tickerId)[0].checked){
    listLabel.innerHTML = 'Coin Tickers';
    symbolList =  tickerLists.coinList;
  }
  else {
    listLabel.innerHTML = 'Stock Tickers';
    symbolList = tickerLists.stockList;
  }

  const tickerListUl = document.getElementById('ticker-list');

  const list = ticker ? symbolList
    .filter(
      entity => (
        entity.Symbol.slice(0, ticker.length)
          .toUpperCase() === ticker
      )
    ) : symbolList;

  //Remove list elements in the ul to fill with new list
  while (tickerListUl.firstChild) {
    tickerListUl.removeChild(tickerListUl.firstChild);
  }

  //Append new searchs
  list.forEach(el => {
    const li = document.createElement('li');
    li.innerHTML = `${el.Symbol.toUpperCase()} - ${el.Name}`;
    li.id = tickerId;
    li.addEventListener('click', sendTickerToInput);
    tickerListUl.appendChild(li);
  });
}

function sendTickerToInput(event){
  const tickerId = event.target.id;
  const tickerSym = event.target.innerHTML.split(' - ')[0];
  document.getElementById(tickerId).value = tickerSym;
}

function handleComparison(){
  errorsOff();
  spinnerOn();
  // Remove charts on page
  const activeCharts = document.getElementsByClassName('svg-chart');
  for (let i = 0; i < activeCharts.length; i++){
    activeCharts[i].remove();
  }

  // Get user ticker inputs
  const tickerInputs = Array.from(
    document.getElementsByClassName('ticker-input')
  );

  let ajaxCurried = curryAjax(tickerInputs.length);
  tickerInputs.forEach(input => {
    const tickerId = input.id;
    const tickerTypeRadios = document.getElementsByName(tickerId);

    if (tickerTypeRadios[0].checked) {
      utils.coinAjax(input.value.toUpperCase()).then(res => {
        if (res.Response === 'Error' || res['Error Message']) {
          spinnerOff();
          errorsOn();
        }
        else { ajaxCurried = ajaxCurried(res, input.value); }
      });
    }
    else {
      utils.stockAjax(input.value.toUpperCase()).then(res => {
        if (res.Response === 'Error' || res['Error Message']) {
          spinnerOff();
          errorsOn();
        }
        else { ajaxCurried = ajaxCurried(res, input.value); }
      });
    }
  });

  function curryAjax(numTickers){
    const responses = [];
    const fn = this;

    function _curriedFn(res, sym){
      responses.push(parseQuotesData(res, sym, PRICE_TYPE, UNITS));

      if (responses.length === numTickers){
        comparisonChart(responses, PRICE_TYPE);
      }
      else {
        return _curriedFn;
      }
    }

    return _curriedFn;
  }
}

function spinnerOff(){
  document.getElementById('loading-spinner').style.display = 'none';
}

function spinnerOn(){
  document.getElementById('loading-spinner').style.display = 'block';
}

function errorsOn(){
  document.getElementById('errors').style.display = 'block';
}

function errorsOff(){
  document.getElementById('errors').style.display = 'none';
}


document.addEventListener('DOMContentLoaded', () => {
  //Get button elements
  const analyzeBtn = document.getElementById('analyze');
  const singleTab = document.getElementById('single-tab');
  const comparisonTab = document.getElementById('comparison-tab');
  const comparisonBtn = document.getElementById('run-comparison');

  //Add click events
  comparisonBtn.addEventListener('click', handleComparison);
  analyzeBtn.addEventListener('click', handleAnalyze);
  singleTab.addEventListener('click', switchTabs(event, 'single'));
  comparisonTab.addEventListener('click', switchTabs(event, 'comparison'));

  //Pull initial data
  comparisonBtn.click();

  //Add input change event
  const tickerInput = document.getElementById('single-ticker');
  const tickerInput1 = document.getElementById('ticker-1');
  const tickerInput2 = document.getElementById('ticker-2');
  tickerInput.addEventListener('keyup', handleTicker);
  tickerInput1.addEventListener('keyup', handleTicker);
  tickerInput2.addEventListener('keyup', handleTicker);


  //Initial fill ticker list ul with stock list
  const tickerListUl = document.getElementById('ticker-list');
  tickerLists.stockList.map((ticker, i) => {
    const li = document.createElement('li');
    li.innerHTML = `${tickerLists.stockList[i]["Symbol"].toUpperCase()}
      - ${tickerLists.stockList[i]["Name"]}`;
    // li.addEventListener('click', sendTickerToInput(event, 'ticker-1'));

    tickerListUl.appendChild(li);
  });
});


// INCSV57JMRCTRZ1V
