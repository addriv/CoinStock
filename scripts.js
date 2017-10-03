import * as utils from './utils';
import * as charts from './charts';
import * as d3 from 'd3';

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
    // debugger;
    document.getElementById(btnId).className += ' active';
  };
}

document.addEventListener('DOMContentLoaded', () => {
  //Get button elements
  const analyzeBtn = document.getElementById('analyze');
  const singleTab = document.getElementById('single-tab');
  const comparisonTab = document.getElementById('comparison-tab');

  let nasdaqList;
  d3.csv('./companylist.csv', function(err, data) {
    nasdaqList = data;
  });

  //Add input change envent


  //Add click events
  analyzeBtn.addEventListener('click', handleAnalyze);
  singleTab.addEventListener('click', switchTabs(event, 'single'));
  comparisonTab.addEventListener('click', switchTabs(event, 'comparison'));
});


// INCSV57JMRCTRZ1V
