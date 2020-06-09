import * as d3 from 'd3';

class Sales {
    constructor(
        public month: string,
        public revenue: number,
        public profit: number
    ) {}
}

document.addEventListener('DOMContentLoaded', async () => {

    // load data
    const data: Sales[] = await d3.json('data/revenues.json');

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
    const x_scale = d3.scaleBand()
        .domain(data.map(s => s.month))
        .range([0, width])
        .padding(0.25);

    const y_scale = d3.scaleLinear()
        .domain([d3.max(data, s => s.revenue) || 0, 0])
        .range([0, height]);

    const color_scale = d3.scaleSequential(d3.interpolateGreens)
        .domain([0, data.length + 1]);

    // add x-axis
    const axisBottom = d3.axisBottom(x_scale);
    g.append('g')
        .attr("class", "axis-bottom")
        .attr("transform", "translate(0, " + height + ")")
        .call(axisBottom)
        .selectAll('text')
            .attr('y', 10)
            .attr('x', -5)
            .attr('text-anchor', 'middle');

    // add y-axis
    const axisLeft = d3.axisLeft(y_scale)
        .ticks(10)
        .tickFormat(d => '$' + d);
    g.append('g')
        .attr("class", "axis-left")
        .call(axisLeft);

    // add x-axis label
    g.append("text")
        .attr('x', width / 2)
        .attr('y', height + 50)
        .attr('font-size', '20px')
        .attr('text-anchor', 'middle')
        .text("Month");

    // add y-axis label
    g.append("text")
        .attr('x', -height / 2)
        .attr('y', -60)
        .attr('font-size', '20px')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .text("Revenue");

    // add data to chart
    g.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
            .attr('x', s => x_scale(s.month) || 0)
            .attr('y', s => y_scale(s.revenue))
            .attr('width', () => x_scale.bandwidth())
            .attr('height', s => height - y_scale(s.revenue))
            .attr('fill', (_, i) => color_scale(i + 1));
});
