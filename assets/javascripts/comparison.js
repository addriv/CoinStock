import * as d3 from 'd3';
import parseQuotesData from './quotes_data_parser';

const comparisonChart = function (data, priceType){
  const ticker1Data  = data[0];
  const ticker2Data = data[1];
  const startDate = new Date(Math.min(ticker1Data[1], ticker2Data[1]));
  const endDate = new Date(Math.max(ticker1Data[2], ticker2Data[2]));

  //Chart dimensions
  const margin =  { top: 80, bot: 140, left: 80, right: 80 };
  const margin2 = { top: 480, bot: 50, left: 80, right: 80};
  const width = 900 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bot;
  const height2 = 600 - margin2.top - margin2.bot;
  const colors = { 1: d3.color('rgba(42, 184, 255, 0.49)'), 2: d3.color('#ffa6c9') };

  //Formats
  const legendFormat = d3.timeFormat('%b %d, %Y');

  //Calculate with investment
  const units = 1;

  // Scale
  const xScale = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0,width]);

  const x2Scale = d3.scaleTime()
    .domain(xScale.domain())
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(ticker1Data[0], function(d) { return d[priceType]; }))
    .range([height, 0]);

  const yScale2 = d3.scaleLinear()
    .domain(d3.extent(ticker2Data[0], function(d) { return d[priceType]; }))
    .range([height, 0]);

  const y2Scale = d3.scaleLinear()
    .domain(d3.extent(ticker1Data[0], function(d) { return d.volume; }))
    .range([height2, 0]);

  const y3Scale = d3.scaleLinear()
    .domain(d3.extent(ticker2Data[0], function(d) { return d.volume; }))
    .range([height2, 0]);

  // Axes
  const xAxis = d3.axisBottom(xScale);
  const x2Axis = d3.axisBottom(x2Scale);
  const yAxis = d3.axisLeft(yScale);
  const yAxis2 = d3.axisRight(yScale2);
  const y2Axis = d3.axisLeft(y2Scale).ticks(4);
  const y3Axis = d3.axisRight(y3Scale).ticks(4);

  // Brush
  const brush = d3.brushX()
    .extent([[0,0], [width, height2]])
    .on('brush end', brushed);

  // Zoom
  const zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on('zoom', zoomed);

  // Line function
  const priceLine = d3.line()
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(units * d[priceType]); });

  const priceLine2 = d3.line()
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale2(units * d[priceType]); });

  const volumeLine = d3.line()
    .x(function(d) { return x2Scale(d.date); })
    .y(function(d) { return y2Scale(units * d.volume); });

  const volumeLine2 = d3.line()
    .x(function(d) { return x2Scale(d.date); })
    .y(function(d) { return y3Scale(units * d.volume); });

  //svg
  const svg = d3.select('chart').append('svg')
    .attr('class', 'svg-chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bot);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  svg.append('defs').append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('width', width)
    .attr('height', height);

  const context = svg.append('g')
    .attr('class', 'context')
    .attr('transform', `translate(${margin2.left}, ${margin2.top})`);

  //Append axes
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis);

  g.append('g')
    .call(yAxis);

  g.append('g')
    .attr('transform', `translate(${width}, 0)`)
    .call(yAxis2);

  context.append('g')
    .attr('transform', `translate(0, ${height2})`)
    .call(x2Axis);

  context.append('g')
    .attr('transform', `translate(0, 0)`)
    .call(y2Axis);

  context.append('g')
    .attr('transform', `translate(${width}, 0)`)
    .call(y3Axis);

  //Append price lines
  const ticker1Price = g.append('path')
    .datum(ticker1Data[0])
    .attr('class', 'ticker-1-price')
    .attr('d', priceLine)
    .attr('stroke', colors[1])
    .attr('stroke-width', 1)
    .attr('fill', 'none');


  const ticker2Price = g.append('path')
    .datum(ticker2Data[0])
    .attr('class', 'ticker-2-price')
    .attr('d', priceLine2)
    .attr('stroke', colors[2])
    .attr('stroke-width', 1)
    .attr('fill', 'none');

  const totalLength = ticker1Price.node().getTotalLength();
  const totalLength2 = ticker2Price.node().getTotalLength();

  ticker1Price
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
      .duration(5000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0)
      .on('end', ()=> ticker1Price.attr('stroke-dasharray', '0 0'));

  ticker2Price
    .attr("stroke-dasharray", totalLength2 + " " + totalLength2)
    .attr("stroke-dashoffset", totalLength2)
    .transition()
      .duration(5000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0)
      .on('end', ()=> ticker2Price.attr('stroke-dasharray', '0 0'));

  context.append('path')
    .datum(ticker1Data[0])
    .attr('class', 'ticker-3-price')
    .attr('d', volumeLine)
    .attr('stroke', colors[1])
    .attr('stroke-width', 1)
    .attr('fill', 'none');

  context.append('path')
    .datum(ticker2Data[0])
    .attr('class', 'ticker-4-price')
    .attr('d', volumeLine2)
    .attr('stroke', colors[2])
    .attr('stroke-width', 1)
    .attr('fill', 'none');

  //Statistics and legend bars above chart
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('width', width)
    .attr('height', 30)
    .attr('transform', `translate(${margin.left}, 30)`);

  const dateRange = legend.append('g')
    .attr('class', 'date-selection')
    .style('text-anchor', 'end')
    .attr('transform', `translate(${width}, 10)`);

  dateRange.append('text')
    .text(`${legendFormat(startDate)} -
          ${legendFormat(endDate)}`);

  const tooltip = legend.append('g')
    .attr('class', 'tooltip')
    .style('text-anchor', 'end')
    .style('color', '')
    .attr('transform', `translate(${width}, 30)`);

  legend.append('g').append('text')
    .attr('transform', 'translate(0, 30)')
    .style('fill', colors[1])
    .text(ticker1Data[5].toUpperCase());

  const tooltip2 = legend.append('g')
    .attr('class', 'tooltip2')
    .style('text-anchor', 'end')
    .style('color', '')
    .attr('transform', `translate(${width}, 45)`);

  legend.append('g').append('text')
    .attr('transform', 'translate(0, 45)')
    .style('fill', colors[2])
    .text(ticker2Data[5].toUpperCase());

  const tooltipText = tooltip.append('text').style('fill', colors[1]);
  const tooltip2Text = tooltip2.append('text').style('fill', colors[2]);

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
    .on("mouseover", focusOn)
    .on("mouseout", focusOff)
    .on('mousemove', mousemove)
    .call(zoom);

  focus.append('line')
    .attr('class', 'x-hover-line hover-line')
    .attr('y1', 0)
    .attr('stroke', colors[1])
    .attr('y2', height);

  focus.append('line')
    .attr('class', 'y-hover-line hover-line')
    .attr('stroke', colors[1])
    .attr('x1', 0)
    .attr('x2', 0);

  focus2.append('line')
    .attr('class', 'x-hover-line2 hover-line')
    .attr('stroke', colors[2])
    .attr('y1', 0)
    .attr('y2', height);

  focus2.append('line')
    .attr('class', 'y-hover-line2 hover-line')
    .attr('stroke', colors[2])
    .attr('x1', 0)
    .attr('x2', width);

  focus.append('circle')
    .style('fill', colors[1])
    .attr('r', 4.5);

  focus2.append('circle')
    .style('fill', colors[2])
    .attr('r', 4.5);

  focus.append('text')
    .attr('x', 15)
    .attr('dy', '.31em');

  focus2.append('text')
    .attr('x', 15)
    .attr('dy', '.31em');

  //Brush
  context.append('g')
    .attr('class', 'brush')
    .call(brush)
    .call(brush.move, xScale.range());

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
    tooltipText.text(`${tooltipTextFormat(d1)}`);

    //Ticker 2 hover
    const i2 = bisectDate(ticker2Data[0], x0, 1);
    const d02 = ticker2Data[0][i2 - 1];
    const d12 = ticker2Data[0][i2];
    const d2 = x0 - d02.date > d12.date - x0 ? d12 : d02;

    focus2.attr('transform', `translate(${xScale(d2.date)},
      ${yScale2(units * d2[priceType])})`);
    focus2.select('text').text(() => d2[priceType]);
    focus2.select('.x-hover-line2').attr('y2', height - yScale2(units * d2[priceType]));
    focus2.select('.y-hover-line2').attr('x2', width - xScale(d2.date));
    tooltip2Text.text(`${tooltipTextFormat(d2)}`);
  }

  function tooltipTextFormat(d){
    return `Price(USD) - Open: ${d.open},
    Close: ${d.close}, High: ${d.high}, Low: ${d.low}, Volume: ${Math.round(d.volume/1000)}K`;
  }

  function brushed(){
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;
    focusOff();
    const s = d3.event.selection || xScale.range();
    // const range = d3.event.selection;
    // console.log(new Date(x2Scale.invert(range[0])));
    // dateRange.text(`${legendFormat(new Date(range[0]))} - ${legendFormat(new Date(range[1]))}`);
    xScale.domain(s.map(x2Scale.invert, x2Scale));
    g.select('.ticker-1-price').attr('d', priceLine);
    g.select('.ticker-2-price').attr('d', priceLine2);
    g.select('.x-axis').call(xAxis);
    svg.select('.zoom').call(zoom.transform, d3.zoomIdentity
      .scale(width / (s[1] - s[0]))
      .translate(-s[0], 0));
  }

  function zoomed(){
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return;
    focusOff();
    const t = d3.event.transform;
    xScale.domain(t.rescaleX(x2Scale).domain());
    g.select('.ticker-1-price').attr('d', priceLine);
    g.select('.ticker-2-price').attr('d', priceLine2);
    g.select('.x-axis').call(xAxis);
    context.select('.brush').call(brush.move, xScale.range().map(t.invertX, t));
  }

  function focusOff() {
    focus.style("display", "none");
    focus2.style("display", "none");
  }

  function focusOn() {
    focus.style("display", null);
    focus2.style("display", null);
  }
};
export default comparisonChart;
