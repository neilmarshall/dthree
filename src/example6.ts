import * as d3 from 'd3';

type Sales = { month: string, revenue: number, profit: number };

// set up chart
const margin = { top: 10, right: 10, bottom: 100, left: 100 },
      width = 600 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

const g = d3.select('body')
    .append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", width + margin.top + margin.bottom)
    .append('g')
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// create scales
const x = d3.scaleBand()
    .range([0, width])
    .padding(0.25);

const y = d3.scaleLinear()
    .range([0, height]);

// add x-axis
const axisBottom = d3.axisBottom(x);
const xAxisGroup = g.append('g')
    .attr("class", "axis-bottom")
    .attr("transform", "translate(0, " + height + ")");

// add y-axis
const axisLeft = d3.axisLeft(y)
    .ticks(10)
    .tickFormat(d => '$' + d);
const yAxisGroup = g.append('g')
    .attr("class", "axis-left");

// add x-axis label
g.append("text")
    .attr('x', width / 2)
    .attr('y', height + 50)
    .attr('font-size', '20px')
    .attr('text-anchor', 'middle')
    .text("Month");

// add y-axis label
const y_axis_label = g.append("text")
    .attr('x', -height / 2)
    .attr('y', -60)
    .attr('font-size', '20px')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)');

const t = d3.transition().duration(750);

function update(data: Sales[], flag: boolean) {
    const value = flag ? "revenue" : "profit";

    x.domain(data.map((s: Sales) => s.month))
    y.domain([d3.max(data, (s: Sales) => s[value]) || 0, 0])

    xAxisGroup
        .call(axisBottom)
        .selectAll('text')
            .attr('y', 10)
            .attr('x', -5)
            .attr('text-anchor', 'middle');

    yAxisGroup.call(axisLeft);

    const color_scale = d3.scaleOrdinal(d3.schemeBlues[data.length])
        .domain(data.map((s: Sales) => s.month));

    // JOIN new data with old elements
    const circles = g.selectAll('circle')
        .data(data, (s: any) => s.month);

    // EXIT old elements not present in data -- this will act on elements NOT matched by the key function `s => s.month`
    circles.exit()
        .transition('t')
            .attr('r', 0)
            .remove();

    // UPDATE old elements present in new data -- behaviour here essentially responds to behaviour after the timeout callback when data already exists
    circles
        .transition('t')
            .attr('cx', (s: Sales) => (x(s.month) || 0) + x.bandwidth() / 2 || 0)
            .attr('cy', (s: Sales) => y(s[value]))
            .attr('r', 10);

    // ENTER new elements present in new data -- code here essentially responds to behaviour on page load when all data is new
    circles.enter()
        .append('circle')
            .attr('cx', (s: Sales) => (x(s.month) || 0) + x.bandwidth() / 2 || 0)
            .attr('cy', (s: Sales) => y(s[value]))
            .attr('r', 0)
            .attr('fill', (s: Sales) => color_scale(s.month))
        .transition('t')
            .attr('r', 10);

    y_axis_label.text(value.slice(0, 1).toUpperCase() + value.slice(1)
);
}

document.addEventListener('DOMContentLoaded', async () => {
    // load data
    const data: Sales[] = await d3.json('data/revenues.json');

    let flag = true;

    update(data, flag);

    d3.interval(() => {
        flag = !flag;
        update(flag ? data : data.slice(1), flag)
    }, 1000);
});
