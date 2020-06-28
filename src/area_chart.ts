import 'bootstrap/dist/css/bootstrap.min.css';
import * as d3 from 'd3';

interface Chronological { date: Date }
type MarketCap = { date: Date, market_cap: number };
type Price = { date: Date, price: number };
type Volatility = { date: Date, volatility: number };

// set up chart
const margin = { top: 10, right: 10, bottom: 100, left: 150 },
      width = 750 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

const g = d3.select('#chart-area')
    .append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", width + margin.top + margin.bottom)
    .append('g')
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// create scales
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([0, height]);

// add x-axis
const axisBottom = d3.axisBottom(x);

// add y-axis
const axisLeft = d3.axisLeft(y);

// add chart title
g.append("text")
    .attr('x', width / 2)
    .attr('y', margin.top)
    .attr('text-anchor', 'middle')
    .attr('font-size', 'x-large')
    .text("LiteCoin");

// add x-axis label
g.append("text")
    .attr('x', width / 2)
    .attr('y', height + 60)
    .attr('text-anchor', 'middle')
    .text("Time");

// add y-axis label
g.append("text")
    .attr('class', 'y-axis-label')
    .attr('x', -height / 2)
    .attr('y', -100)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)');

// add path element
g.append('path')
    .attr('fill', 'steelblue');

// add x-axis placeholder
g.append('g')
    .attr("class", "axis-bottom")
    .attr("transform", "translate(0, " + height + ")");

// add y-axis placeholder
g.append('g')
    .attr("class", "axis-left");

const dateParser = d3.timeParse("%d/%m/%Y");

function updateChart<T extends Chronological>(data: T[], f: (arg0: T) => number, yAxisLabel: string) {

    const [minDate, maxDate] = d3.extent(data, (d: T) => d.date);
    x.domain([minDate || 0, maxDate || Infinity]);
    (g.select(".axis-bottom") as d3.Selection<SVGGElement, unknown, HTMLElement, any>)
        .call(axisBottom)
        .selectAll('text')
            .attr('y', 10)
            .attr('x', -5)
            .attr('transform', 'rotate(-45)')
            .attr('text-anchor', 'end');

    // update domain of y-axis
    const [minData, maxData] = d3.extent(data, f);
    y.domain([maxData || Infinity, 0]);
    (g.select(".axis-left") as d3.Selection<SVGGElement, unknown, HTMLElement, any>)
        .call(axisLeft);

    // update y-axis label
    g.select('.y-axis-label').text(yAxisLabel);

    const area = d3.area<T>()
        .x(d => x(d.date))
        .y0(d => y(0))
        .y1(d => y(f(d)));

    (g.select('path') as d3.Selection<SVGPathElement, unknown, HTMLElement, any>)
        .datum(data)
        .attr('d', area);
}

document.addEventListener('DOMContentLoaded', async () => {
    // load data
    const data: any  = await d3.json('data/coins.json');

    const marketCapData: Map<string, MarketCap[]> = new Map();
    const priceData: Map<string, Price[]> = new Map();
    const volatilityData: Map<string, Volatility[]> = new Map();
    for (const k in data) {
        marketCapData.set(k, data[k].map((d: any) => {
            return {
                date: dateParser(d['date']),
                market_cap: parseFloat(d['market_cap'])
            } as MarketCap
        }).filter((d: MarketCap) => !isNaN(d.market_cap)));
        priceData.set(k, data[k].map((d: any) => {
            return {
                date: dateParser(d['date']),
                price: parseFloat(d['price_usd'])
            } as Price
        }).filter((d: Price) => !isNaN(d.price)));
        volatilityData.set(k, data[k].map((d: any) => {
            return {
                date: dateParser(d['date']),
                volatility: parseFloat(d['24h_vol'])
            } as Volatility
        }).filter((d: Volatility) => !isNaN(d.volatility)));
    }

    updateChart<Price>(
        priceData.get('litecoin')!,
        (d: Price) => d.price,
        "Price ($USD)"
    );
});
