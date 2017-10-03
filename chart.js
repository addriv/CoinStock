import $ from 'jquery';
import * as d3 from 'd3';

const pingApi = (ticker) => {
  $.ajax({
    method: 'GET',
    url: `http://www.alphavantage.co/query?function=TIME_SERIES_DAILY&outputsize=compact&symbol=${ticker}&apikey=INCSV57JMRCTRZ1V`,
  }).then(response => {
    const quotes = response["Time Series (Daily)"];
    const dates = Object.keys(quotes).sort();
    const data = dates.map(date => {
      return {
        date: date,
        open: parseFloat(quotes[date]["1. open"]),
        close: parseFloat(quotes[date]["4. close"]),
        low: parseFloat(quotes[date]["3. low"]),
        high: parseFloat(quotes[date]["2. high"]),
        volume: parseInt(quotes[date]["5. volume"])
      };
    });

    let minClose, minOpen, minLow, minHigh, maxClose, maxOpen, maxLow, maxHigh;

    minClose = minOpen = minLow = minHigh = 99999999999;
    maxClose = maxOpen = maxLow = maxHigh = 0;


    data.forEach(dayStat => {
      if (minClose > dayStat.close) { minClose = dayStat.close; }
      if (maxClose < dayStat.close) { maxClose = dayStat.close; }
      if (minOpen > dayStat.open) { minOpen = dayStat.open; }
      if (maxOpen < dayStat.open) { maxOpen = dayStat.open; }
      if (minLow > dayStat.low) { minLow = dayStat.low; }
      if (maxLow < dayStat.low) { maxLow = dayStat.low; }
      if (minHigh > dayStat.high) { minHigh = dayStat.high; }
      if (maxHigh < dayStat.high) { maxHigh = dayStat.high; }
    });

    const margin = 30;
    const width = 1000 - 2 * margin;
    const height = 600 - 2 * margin;

    // Scale
    const xScale = d3.scaleTime()
      .domain([new Date(dates[0]), new Date(dates.slice(-1))])
      .range([0,width]);

    // const x = d3.time.scale().range([0, width]);
    const yScale = d3.scaleLinear()
      .domain([minClose, maxClose])
      .range([height, 0]);

    //Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    //Line function
    const priceLine = d3.line()
      .x(function(d) { return xScale(new Date(d.date)); })
      .y(function(d) { return yScale(d.close); });
      // .interpolate('linear');

    //svg
    const svg = d3.select('body').append('svg')
      .attr('class', 'chart')
      .attr('width', width + 2 * margin)
      .attr('height', height + 2 * margin)
      .attr('style', 'outline: thin solid');

    //Append axes
    const xAxisGroup = svg.append('g')
      .attr('transform', `translate(${margin}, ${height + margin})`)
      .call(xAxis);

    const yAxisGroup = svg.append('g')
      .attr('transform', `translate(${margin}, ${margin})`)
      .call(yAxis);

    //Append line
    svg.append('path')
      .attr('d', priceLine(data))
      .attr('stroke', 'blue')
      .attr('stroke-width', 1)
      .attr('transform', `translate(${margin}, ${margin})`)
      .attr('fill', 'none');

  });

};

document.addEventListener('DOMContentLoaded', () => {
  const tickerInput = document.getElementById('ticker');
  const analyzeBtn = document.getElementById('analyze');

  //Add click event to analyze button
  analyzeBtn.addEventListener('click', () => {
    //Remove charts if they exist
    const charts = document.getElementsByClassName('chart');
    if (charts.length > 0) { charts[0].remove(); }

    pingApi(tickerInput.value);
  });
});





// API Key
// INCSV57JMRCTRZ1V
