import * as d3 from 'd3';

export const chartStock = function (tickerSym, ajaxResponse, investment){
  let data, startDate, endDate, minPrice, maxPrice, priceVariable;

  if (Object.keys(ajaxResponse)[0] === "history"){
    data = ajaxResponse["history"]
      .reverse()
      .map(quote => ({ date: quote["timestamp"], value: quote["value"]}));

    startDate = data[0].date;
    endDate = data[data.length - 1].date;

    data.forEach(point => {
      if (!minPrice || minPrice > point.value) { minPrice = point.value; }
      if (!maxPrice || maxPrice < point.value) { maxPrice = point.value; }
    });

    priceVariable = "value";
  }
  else {
    const quotes = ajaxResponse["Time Series (Daily)"];
    const dates = Object.keys(quotes).sort();
    startDate = dates[0];
    endDate = dates.slice(-1);

    data = dates.map(date => {
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

    data.forEach(dayStat => {
      if (!minClose || minClose > dayStat.close) { minClose = dayStat.close; }
      if (!maxClose || maxClose < dayStat.close) { maxClose = dayStat.close; }
      if (!minOpen || minOpen > dayStat.open) { minOpen = dayStat.open; }
      if (!maxOpen || maxOpen < dayStat.open) { maxOpen = dayStat.open; }
      if (!minLow || minLow > dayStat.low) { minLow = dayStat.low; }
      if (!maxLow || maxLow < dayStat.low) { maxLow = dayStat.low; }
      if (!minHigh || minHigh> dayStat.high) { minHigh = dayStat.high; }
      if (!maxHigh || maxHigh < dayStat.high) { maxHigh = dayStat.high; }
    });

    minPrice = minClose;
    maxPrice = maxClose;
    priceVariable = 'close';
  }

  const metaData = ajaxResponse["Meta Data"];

  //Chart dimensions
  const margin =  { top: 70, bot: 50, left: 50, right: 50 };
  const width = 1000 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bot;

  //Formats
  const legendFormat = d3.timeFormat('%b %d, %Y');

  //Calculate with investment
  const units = investment ? (investment / data[0][priceVariable]) : 1;

  // Scale
  const xScale = d3.scaleTime()
    .domain([new Date(startDate), new Date(endDate)])
    .range([0,width]);

  // const x = d3.time.scale().range([0, width]);
  const yScale = d3.scaleLinear()
    .domain([units * minPrice, units * maxPrice])
    .range([height, 0]);

  //Axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  //Line function
  const priceLine = d3.line()
    .x(function(d) { return xScale(new Date(d.date)); })
    .y(function(d) { return yScale(units * d[priceVariable]); });

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

  //Append price line
  svg.append('path')
    .attr('d', priceLine(data))
    .attr('stroke', 'blue')
    .attr('stroke-width', 1)
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('fill', 'none');

  //Statistics and legend bars above chart
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('width', width)
    .attr('height', 30)
    .attr('transform', `translate(${margin.left}, 30)`);

  legend.append('text')
    .attr('class', 'ticker')
    .text(`${tickerSym.toUpperCase()}`);

  const dateRange = legend.append('g')
    .attr('class', 'date-selection')
    .style('text-anchor', 'end')
    .attr('transform', `translate(${width}, 0)`);

  dateRange.append('text')
    .text(`${legendFormat(new Date(startDate))} -
          ${legendFormat(new Date(endDate))}`);

  const tooltip = legend.append('g')
    .attr('class', 'tooltip')
    .style('text-anchor', 'end')
    .attr('transform', `translate(${width}, 30)`);

  const tooltipText = tooltip.append('text');

  //For hover effects
  const focus = g.append('g')
    .attr('class', 'focus')
    .style('display', 'none');

  svg.append('rect')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('class', 'overlay')
    .attr('width', width)
    .attr('height', height)
    .on("mouseover", function() { focus.style("display", null); })
    .on("mouseout", function() { focus.style("display", "none"); })
    .on('mousemove', mousemove);

  focus.append('line')
    .attr('class', 'x-hover-line hover-line')
    .attr('y1', 0)
    .attr('y2', height);

  focus.append('line')
    .attr('class', 'y-hover-line hover-line')
    .attr('x1', 0)
    .attr('x2', 0);

  focus.append('circle').attr('r', 4.5);

  focus.append('text')
    .attr('x', 15)
    .attr('dy', '.31em');

    // Mouse move handler
  function mousemove(){
    const x0 = xScale.invert(d3.mouse(this)[0]);
    const bisectDate = d3.bisector(
    function(d) { return new Date(d.date); }).left;
    const i = bisectDate(data, x0, 1);
    const d0 = data[i - 1];
    const d1 = data[i];
    const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    focus.attr('transform', `translate(${xScale(new Date(d.date))},
      ${yScale(units * d[priceVariable])})`);
    focus.select('text').text(() => d[priceVariable]);
    focus.select('.x-hover-line').attr('y2', height - yScale(units * d[priceVariable]));
    focus.select('.y-hover-line').attr('x1', - xScale(new Date(d.date)));
    tooltipText.text(`${tooltipTextFormat(d)}`);
  }

  function tooltipTextFormat(d){
    if (priceVariable === 'value'){
      return `${legendFormat(new Date(d.date))} - Price: ${d.value}`;
    }
    else {
      return `${legendFormat(new Date(d.date))} - Open: ${d.open},
      Close: ${d.close}, High: ${d.high}, Low: ${d.low}`;
    }
  }
};
