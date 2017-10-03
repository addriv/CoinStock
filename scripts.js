import * as utils from './utils';
import * as charts from './charts';

function handleAnalyze(){
  const tickerInput = document.getElementById('ticker');
  const chart = document.getElementsByClassName('chart');
  const investment = document.getElementById('investment');

  //Remove charts if they exist
  if (charts.length > 0) { charts[0].remove(); }

  utils.stockAjax(tickerInput.value).then(
    response => charts.chartStock(response, parseInt(investment.value)));
}

function switchTabs(event, tabType){
  
}

document.addEventListener('DOMContentLoaded', () => {
  const analyzeBtn = document.getElementById('analyze');
  const singleTab = document.getElementById('single-tab');
  const comparisonTab = document.getElementById('comparison-tab');

  //Add click events
  analyzeBtn.addEventListener('click', handleAnalyze);
  singleTab.addEventListener('click', switchTabs(event, 'single'));
  comparisonTab.addEventListener('click', switchTabs(event, 'comparison'));
});


// API Key
// INCSV57JMRCTRZ1V
