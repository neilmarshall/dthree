import * as d3 from 'd3';

class DataPoint {
    constructor(public count:number) {}
}

document.addEventListener('DOMContentLoaded', async () => {
    d3.select('#mySVG').append('rect')
        .attr('x', 100)
        .attr('y', 20)
        .attr('width', 200)
        .attr('height', 10)
        .attr('fill', 'blue');

    const data = [10779, 10338, 9603, 9385, 7887];

    const svg = d3.select('#SVG2').append('svg').attr('width', 400).attr('height', 400);

    const circles = svg.selectAll('circle')
        .data(data);

    circles.enter()
        .append('circle')
        .attr('cx', (d: any, i: number) => i * 75 + 50)
            .attr('cy', 200)
            .attr('r', (d: any, i: number, g: object) => { console.log(g); return d / 200 })
            .attr('fill', (d: any) => d > 10000 ? 'red' : 'green');
});
