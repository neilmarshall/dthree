import * as d3 from 'd3';

class Building {
    constructor(public height: number) {}
}

document.addEventListener('DOMContentLoaded', async () => {

    const data: number[] = await d3.json<Building[]>('data/buildings.json')
        .then(json => json.map(d => d.height));

    const svg = d3.select('#svg')
        .append('svg').attr('width', 400).attr('height', 400);

    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
            .attr('x', (d: number, i: number) => 50 * i + 20)
            .attr('y', (d: number, i: number) => 50)
            .attr('width', (d: number, i: number) => 40)
            .attr('height', (d: number, i: number) => d)
            .attr('fill', (d: number, i: number) => 'grey');
});
