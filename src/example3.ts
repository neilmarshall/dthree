import * as d3 from 'd3';

document.addEventListener('DOMContentLoaded', async () => {

    // load data
    const buildings: {name: string, height: number}[] = await d3.json('data/buildings.json');

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
        .domain(buildings.map(b => b.name))
        .range([0, width])
        .padding(0.25);

    const y_scale = d3.scaleLinear()
        .domain([d3.max(buildings, b => b.height) || 0, 0])
        .range([0, height]);

    const color_scale = d3.scaleOrdinal<string>()
        .domain(buildings.map(b => b.name))
        .range(d3.schemeCategory10);

    // add x-axis
    const axisBottom = d3.axisBottom(x_scale);
    g.append('g')
        .attr("class", "axis-bottom")
        .attr("transform", "translate(0, " + height + ")")
        .call(axisBottom)
        .selectAll('text')
            .attr('y', 10)
            .attr('x', -5)
            .attr('text-anchor', 'end')
            .attr('transform', 'rotate(-40)')

    // add y-axis
    const axisLeft = d3.axisLeft(y_scale)
        .ticks(3)
        .tickFormat(d => d + 'm');
    g.append('g')
        .attr("class", "axis-left")
        .call(axisLeft);

    // add x-axis label
    g.append("text")
        .attr('x', width / 2)
        .attr('y', height + 140)
        .attr('font-size', '20px')
        .attr('text-anchor', 'middle')
        .text("The world's tallest buildings");

    // add y-axis label
    g.append("text")
        .attr('x', -height / 2)
        .attr('y', -60)
        .attr('font-size', '20px')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .text("Height (m)");

    // add data to chart
    g.selectAll('rect')
        .data(buildings)
        .enter()
        .append('rect')
            .attr('x', b => x_scale(b.name) || 0)
            .attr('y', b => y_scale(b.height))
            .attr('width', () => x_scale.bandwidth())
            .attr('height', b => height - y_scale(b.height))
            .attr('fill', b => color_scale(b.name));
});
