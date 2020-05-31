import * as d3 from 'd3';

class Building {
    constructor(public name: string, public height: number) {}
}

document.addEventListener('DOMContentLoaded', async () => {

    const SVG_WIDTH = 400;
    const SVG_HEIGHT = 400;

    const buildings: Building[] = await d3.json('data/buildings.json');

    const svg = d3.select('#svg')
        .append('svg')
            .attr('width', SVG_WIDTH)
            .attr('height', SVG_HEIGHT);

    const x_scale = d3.scaleBand()
        .domain(buildings.map(b => b.name))
        .range([0, SVG_WIDTH])
        .padding(0.2);

    const y_scale = d3.scaleLinear()
        .domain([0, d3.max(buildings, b => b.height)])
        .range([0, SVG_HEIGHT]);

    const color_scale = d3.scaleOrdinal()
        .domain(buildings.map(b => b.name))
        .range(d3.schemeCategory10);

    svg.selectAll('rect')
        .data(buildings)
        .enter()
        .append('rect')
            .attr('x', (b: Building) => x_scale(b.name))
            .attr('y', (b: Building) => SVG_HEIGHT - y_scale(b.height))
            .attr('width', () => x_scale.bandwidth())
            .attr('height', (b: Building) => y_scale(b.height))
            .attr('fill', (b: Building) => color_scale(b.name));
});
