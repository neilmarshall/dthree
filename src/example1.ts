import * as d3 from 'd3';

document.addEventListener('DOMContentLoaded', async () => {
    d3.select('#mySVG').append('rect')
        .attr('x', 100)
        .attr('y', 20)
        .attr('width', 200)
        .attr('height', 10)
        .attr('fill', 'blue');

    const data = await d3.json('data/aggregated_names_data.json')
        .then(json => {
            return json.data.slice(0, 5).map(d => d.count);
        })
        .catch(err => console.error(err));


    const svg = d3.select('#SVG2').append('svg').attr('width', 400).attr('height', 400);

    const circles = svg.selectAll('circle')
        .data(data);

    circles.enter()
        .append('circle')
            .attr('cx', (d, i) => i * 75 + 50)
            .attr('cy', 200)
            .attr('r', (d, i, g) => { console.log(g); return d / 200 })
            .attr('fill', (d, i) => d > 10000 ? 'red' : 'green');
});
