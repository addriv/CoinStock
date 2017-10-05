import * as d3 from 'd3';
import parseQuotesData from './quotes_data_parser';

const comparisonChart = function (ticker1Data, ticker2Data, investment, priceType){
  const startDate = new Date(Math.min(ticker1Data[1], ticker2Data[1]));
  const endDate = new Date(Math.max(ticker1Data[2], ticker2Data[2]));
  const minPrice = Math.min(ticker1Data[3], ticker2Data[3]);
  const maxPrice = Math.max(ticker1Data[4], ticker2Data[4]);

  console.log(ticker1Data);
  console.log(ticker2Data);

  //Chart dimensions
  const margin =  { top: 70, bot: 50, left: 50, right: 50 };
  const margin2 = { top: 480, bot: 30, left: 40, right: 40};
  const width = 1000 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bot;
  const height2 = 600 - margin2.top - margin2.bot;

  //Formats
  const legendFormat = d3.timeFormat('%b %d, %Y');

  //Calculate with investment
  // const units = investment ? (investment / parsedData[0][priceType]) : 1;
  const units = 1;

  // Scale
  const xScale = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0,width]);

  const yScale = d3.scaleLinear()
    .domain([units * minPrice - maxPrice * 0.05,
      units * maxPrice + maxPrice * 0.05])
    .range([height, 0]);

  const y2Scale = d3.scaleLinear()
    .domain(yScale.domain())
    .range([height2, 0]);

  //Axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  //Line function
  const priceLine = d3.line()
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(units * d[priceType]); });

  //svg
  const svg = d3.select('chart').append('svg')
    .attr('class', 'svg-chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bot);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  //Append axes
  const xAxisGroup = g.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis);

  const yAxisGroup = g.append('g')
    .call(yAxis);

  //Append price lines
  svg.append('path')
    .attr('d', priceLine(ticker1Data[0]))
    .attr('stroke', 'blue')
    .attr('stroke-width', 1)
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('fill', 'none');

  svg.append('path')
    .attr('d', priceLine(ticker2Data[0]))
    .attr('stroke', 'red')
    .attr('stroke-width', 1)
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('fill', 'none');

  //Statistics and legend bars above chart
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('width', width)
    .attr('height', 30)
    .attr('transform', `translate(${margin.left}, 30)`);
  //
  // legend.append('text')
  //   .attr('class', 'ticker')
  //   .text(`${tickerSym.toUpperCase()}`);

  const dateRange = legend.append('g')
    .attr('class', 'date-selection')
    .style('text-anchor', 'end')
    .attr('transform', `translate(${width}, 0)`);

  dateRange.append('text')
    .text(`${legendFormat(startDate)} -
          ${legendFormat(endDate)}`);

  const tooltip = legend.append('g')
    .attr('class', 'tooltip')
    .style('text-anchor', 'end')
    .attr('transform', `translate(${width}, 30)`);

  const tooltipText = tooltip.append('text');

  //For hover effects
  const focus = g.append('g')
    .attr('class', 'focus')
    .style('display', 'none');

  const focus2 = g.append('g')
    .attr('class', 'focus2')
    .style('display', 'none');

  svg.append('rect')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('class', 'overlay')
    .attr('width', width)
    .attr('height', height)
    .on("mouseover", function() {
      focus.style("display", null);
      focus2.style("display", null);
    })
    .on("mouseout", function() {
      focus.style("display", "none");
      focus2.style("display", "none");
    })
    .on('mousemove', mousemove);

  focus.append('line')
    .attr('class', 'x-hover-line hover-line')
    .attr('y1', 0)
    .attr('y2', height);

  focus.append('line')
    .attr('class', 'y-hover-line hover-line')
    .attr('x1', 0)
    .attr('x2', 0);

  focus2.append('line')
    .attr('class', 'x-hover-line2 hover-line')
    .attr('y1', 0)
    .attr('y2', height);

  focus2.append('line')
    .attr('class', 'y-hover-line2 hover-line')
    .attr('x1', 0)
    .attr('x2', 0);

  focus.append('circle')
    .style('fill', 'blue')
    .attr('r', 4.5);

  focus2.append('circle')
    .style('fill', 'red')
    .attr('r', 4.5);

  focus.append('text')
    .attr('x', 15)
    .attr('dy', '.31em');

  focus2.append('text')
    .attr('x', 15)
    .attr('dy', '.31em');

    // Mouse move handler
  function mousemove(){
    const x0 = xScale.invert(d3.mouse(this)[0]);
    const bisectDate = d3.bisector(
    function(d) { return d.date; }).left;

    //Ticker  1 hover
    const i1 = bisectDate(ticker1Data[0], x0, 1);
    const d01 = ticker1Data[0][i1 - 1];
    const d11 = ticker1Data[0][i1];
    const d1 = x0 - d01.date > d11.date - x0 ? d11 : d01;

    focus.attr('transform', `translate(${xScale(d1.date)},
      ${yScale(units * d1[priceType])})`);
    focus.select('text').text(() => d1[priceType]);
    focus.select('.x-hover-line').attr('y2', height - yScale(units * d1[priceType]));
    focus.select('.y-hover-line').attr('x1', - xScale(d1.date));

    //Ticker 2 hover
    const i2 = bisectDate(ticker2Data[0], x0, 1);
    const d02 = ticker2Data[0][i2 - 1];
    const d12 = ticker2Data[0][i2];
    const d2 = x0 - d02.date > d12.date - x0 ? d12 : d02;

    focus2.attr('transform', `translate(${xScale(d2.date)},
      ${yScale(units * d2[priceType])})`);
    focus2.select('text').text(() => d2[priceType]);
    focus2.select('.x-hover-line2').attr('y2', height - yScale(units * d2[priceType]));
    focus2.select('.y-hover-line2').attr('x1', - xScale(d2.date));
    tooltipText.text(`${tooltipTextFormat(d2)}`);
  }

  function tooltipTextFormat(d){
    if (priceType === 'value'){
      return `${legendFormat(d.date)} - Price: ${d.value}`;
    }
    else {
      return `${legendFormat(d.date)} - Open: ${d.open},
      Close: ${d.close}, High: ${d.high}, Low: ${d.low}`;
    }
  }
};
export default comparisonChart;
