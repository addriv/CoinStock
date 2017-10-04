import * as utils from './utils';
import * as charts from './charts';
import comparisonChart from './comparison';
import * as tickerLists from './tickers';
import * as d3 from 'd3';
import parseQuotesData from './quotes_data_parser';

const tickers = tickerLists.stockList.map(company => company["Symbol"]);
const coinTickers = tickerLists.coinList.map(coin => coin["Symbol"].toUpperCase());
const combinedTickers = tickers.concat(coinTickers);

// utils.coinAjax().then(response => console.log(response));

function handleAnalyze(){
  const tickerInput = document.getElementById('ticker');
  const activeCharts = document.getElementsByClassName('svg-chart');
  const investment = document.getElementById('investment');

  //Remove charts if they exist
  for (let i = 0; i < activeCharts.length; i++){
    activeCharts[i].remove();
  }

  //Ajax request and chart based on checked ticker type radio button
  if (document.getElementsByName('ticker-type')[0].checked){
    utils.stockAjax(tickerInput.value).then(
      response => charts.chartStock(tickerInput.value, response, parseInt(investment.value)));
  }
  else {
    utils.coinAjax(tickerInput.value).then(
      response => charts.chartStock(
        tickerInput.value, response, parseInt(investment.value)
      )
    );
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
  const autofill = document.getElementById('autofill');

  let symbolList;
  if (document.getElementsByName('ticker-type')[0].checked){
    symbolList =  tickerLists.stockList;
  }
  else { symbolList = tickerLists.coinList; }

  const list = symbolList
    .filter(
      entity => entity["Symbol"]
        .slice(0, ticker.length).toUpperCase() === ticker
    );
  // const list = tickers.filter(symbol => symbol.slice(0, ticker.length) === ticker);
  const listLength = 5;

  //Remove all child elements in autofill
  while (autofill.firstChild) {
    autofill.removeChild(autofill.firstChild);
  }

  if (!ticker || list.length === 1 && ticker === list[0]["Symbol"]) { return; }

  //Append new searchs
  for (let i = 0; i < listLength && i < list.length; i++){
    const li = document.createElement('li');
    li.innerHTML = `${list[i]["Symbol"].toUpperCase()} - ${list[i]["Name"]}`;
    autofill.appendChild(li);
  }
}

function handleComparison(){
  const ticker1 = document.getElementById('ticker-1').value;
  const ticker2 = document.getElementById('ticker-2').value;
  const investment = document.getElementById('investment');

  let firstQuote;
  utils.coinAjax(ticker1).then(
    response1 => {
      firstQuote = parseQuotesData(response1, 'close');
      return utils.stockAjax(ticker2);
    }).then(
      response2 => {
        const secondQuote = parseQuotesData(response2, 'close');
        comparisonChart(firstQuote, secondQuote, parseInt(investment.value));
      }
    );

}


document.addEventListener('DOMContentLoaded', () => {
  //Get button elements
  const analyzeBtn = document.getElementById('analyze');
  const singleTab = document.getElementById('single-tab');
  const comparisonTab = document.getElementById('comparison-tab');
  const comparisonBtn = document.getElementById('run-comparison');

  //Add input change envent
  const tickerInput = document.getElementById('ticker');
  tickerInput.addEventListener('keyup', handleTicker);

  //Add click events
  analyzeBtn.addEventListener('click', handleAnalyze);
  singleTab.addEventListener('click', switchTabs(event, 'single'));
  comparisonTab.addEventListener('click', switchTabs(event, 'comparison'));
  comparisonBtn.addEventListener('click', handleComparison);
});


// INCSV57JMRCTRZ1V
