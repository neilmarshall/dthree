import 'bootstrap/dist/css/bootstrap.min.css';
import * as d3 from 'd3';

type Country = { continent: string, country: string, income: number | null, life_exp: number | null, population: number};
type DataPoint = { countries: Country[], year: number };

// set up chart
const margin = { top: 10, right: 10, bottom: 100, left: 100 },
      width = 600 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

const g = d3.select('#chart-area')
    .append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", width + margin.top + margin.bottom)
    .append('g')
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// create scales
const x = d3.scaleLog().range([0, width]);
const y = d3.scaleLinear().range([0, height]);
const r = d3.scaleLinear().range([3, 20]);
const continent = d3.scaleOrdinal().range(d3.schemeCategory10);

// add x-axis
const axisBottom = d3.axisBottom(x).tickValues([400, 4000, 40000]).tickFormat(d3.format("$0,"));

// add y-axis
const axisLeft = d3.axisLeft(y).ticks(9);

// add x-axis label
g.append("text")
    .attr('x', width / 2)
    .attr('y', height + 50)
    .attr('text-anchor', 'middle')
    .text("GDP Per Capita ($)");

// add y-axis label
g.append("text")
    .attr('x', -height / 2)
    .attr('y', -60)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text("Life Expectancy (Years)");

const yearText = g.append("text")
    .classed('h4', true)
    .attr('fill', 'grey')
    .attr('x', width - 50)
    .attr('y', height - 20);

const duration = 100;
const t = d3.transition().duration(duration);

function update(data: DataPoint) {
    const { countries, year } = data;

    yearText.transition('t').text(year);

    // JOIN new data with old elements
    const circles = g.selectAll('circle')
        .data(countries.filter(c => c.income && c.life_exp), (c: any) => c.country);

    // EXIT old elements not present in new data
    circles.exit().remove();

    // UPDATE old elements present in new data
    circles
        .transition('t')
            .attr('cx', (c: Country) => x(c.income || 1))
            .attr('cy', (c: Country) => y(c.life_exp || 0))
            .attr('r', (c: Country) => r(c.population || 0));

    // ENTER new elements present in new data
    circles.enter()
        .append('circle')
            .attr('cx', (c: Country) => x(c.income || 1))
            .attr('cy', (c: Country) => y(c.life_exp || 0))
            .attr('r', 0)
            .attr('fill', (c: Country): any => continent(c.continent))
        .transition('t')
            .attr('r', (c: Country) => r(c.population || 0));
}

document.addEventListener('DOMContentLoaded', async () => {
    // load data
    const data: DataPoint[] = await d3.json('data/gapminder.json');

    // set domain by identifying max income, life expectancy, population size and continents
    const minIncome = d3.min(data, dp => d3.min(dp.countries, c => c.income));
    const maxIncome = d3.max(data, dp => d3.max(dp.countries, c => c.income));
    x.domain([minIncome || 1, maxIncome || 0]);
    g.append('g')
        .attr("class", "axis-bottom")
        .attr("transform", "translate(0, " + height + ")")
        .call(axisBottom)
        .selectAll('text')
            .attr('y', 10)
            .attr('x', -5)
            .attr('text-anchor', 'middle');

    const maxLifeExpectancy = d3.max(data, dp => d3.max(dp.countries, c => c.life_exp));
    y.domain([(Math.round((maxLifeExpectancy || 0) / 10) + 1) * 10, 0]);
    g.append('g')
        .attr("class", "axis-left")
        .call(axisLeft);

    const maxPopulation = d3.max(data, dp => d3.max(dp.countries, c => c.population));
    r.domain([0, maxPopulation || 0]);

    const continents = Array.from(new Set(data.map(dp => dp.countries.map(c => c.continent)).reduce((a, c) => a.concat(c), [])));
    continent.domain(continents);

    let i = 0;
    const interval = d3.interval(() => {
        update(data[i]);
        i = (i + 1) % data.length;
    }, duration);
});
