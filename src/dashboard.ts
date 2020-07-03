import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-slider/dist/css/bootstrap-slider.min.css';
import * as d3 from 'd3';
import { interpolatePath } from 'd3-interpolate-path';
const Slider = require('bootstrap-slider');

/*
 * TODO - make date slider more granular (days, not years)
 * TODO - add chart context with fixed x-axis and a brush and an area chart
 * TODO - make line chart respond to change in context brush
 * TODO - make date slider respond to change in context brush
 * TODO - make context brush respond to change in date slider
 * TODO - add a Bootstrap datepicker
 * TODO - add a donut chart showing market cap / volatility / price split between coins, based on selected date in datepicker
 * TODO - make donut chart sensitive to datepicker
 * TODO - make line chart reflect colors in donut chart, i.e. when coin is changed line chart color changes
 * TODO - make coin selector sensitive to clicking on sections of donit chart
 */

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
        .attr("height", height + margin.top + margin.bottom)
    .append('g')
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// create scales
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([0, height]);

// add x-axis
const axisBottom = d3.axisBottom(x);

// add y-axis
const axisLeft = d3.axisLeft(y);

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
    .attr('class', 'line')
    .attr('fill', 'none')
    .attr('stroke', 'grey')
    .attr('stroke-width', '2px');

// add x-axis placeholder
g.append('g')
    .attr("class", "axis-bottom")
    .attr("transform", "translate(0, " + height + ")");

// add y-axis placeholder
g.append('g')
    .attr("class", "axis-left");

const duration = 1500;

const dateParser = d3.timeParse("%d/%m/%Y");

function updateChart<T extends Chronological>(data: T[], f: (arg0: T) => number, yAxisLabel: string) {

    const [minDate, maxDate] = d3.extent(data, (d: T) => d.date);
    x.domain([minDate || 0, maxDate || Infinity]);
    (g.select(".axis-bottom") as d3.Selection<SVGGElement, unknown, HTMLElement, any>)
        .transition()
        .duration(duration)
        .call(axisBottom)
        .selectAll('text')
            .attr('y', 10)
            .attr('x', -5)
            .attr('transform', 'rotate(-45)')
            .attr('text-anchor', 'end');

    // update domain of y-axis
    const [minData, maxData] = d3.extent(data, f);
    y.domain([maxData || Infinity, minData || 0]);
    (g.select(".axis-left") as d3.Selection<SVGGElement, unknown, HTMLElement, any>)
        .transition()
        .duration(duration)
        .call(axisLeft);

    // update y-axis label
    g.select('.y-axis-label').text(yAxisLabel);

    const lineBuilder = d3.line<T>()
        .x(d => x(d.date))
        .y(d => y(f(d)));

    (g.select('.line') as d3.Selection<SVGPathElement, unknown, HTMLElement, any>)
        .datum(data)
        .transition()
        .duration(duration)
        .attrTween('d', function (d: any) {
            const previous = d3.select(this).attr('d');
            const current = lineBuilder(d) as string;
            return interpolatePath(previous, current);
        });
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

    function update() {
        const [minYear, maxYear] = slider.getValue();
        const selectedCoin = (document.getElementById('coin-select') as HTMLSelectElement).value;
        const selectedOutput = (document.getElementById('output-select') as HTMLSelectElement).value;
        const dateFilter = (d: Chronological) => d.date.getFullYear() >= minYear && d.date.getFullYear() <= maxYear;
        switch (selectedOutput) {
            case "market_cap":
                updateChart<MarketCap>(
                    marketCapData.get(selectedCoin)!.filter(dateFilter),
                    (d: MarketCap) => d.market_cap,
                    "Market Capitalisation ($USD)"
                );
                break;
            case "price_usd":
                updateChart<Price>(
                    priceData.get(selectedCoin)!.filter(dateFilter),
                    (d: Price) => d.price,
                    "Price ($USD)"
                );
                break;
            case "24h_vol":
                updateChart<Volatility>(
                    volatilityData.get(selectedCoin)!.filter(dateFilter),
                    (d: Volatility) => d.volatility,
                    "24 Hour Trading Volume ($USD)"
                );
                break;
            default:
                throw "Something went wrong!";
        }
    }

    // set up date slider
    const dates: Date[] = Object.values(data).reduce((a: any[], c: any) => a.concat(c), []).map((d: any) => dateParser(d.date)!);
    const [minDate, maxDate] = d3.extent(dates);
    const slider = new Slider('#date-slider', {
        min: minDate!.getFullYear(),
        max: maxDate!.getFullYear(),
        value: [minDate!.getFullYear(), maxDate!.getFullYear()],
        tooltip_position: 'bottom'
    });

    slider.on('slideStop', update);

    document.getElementById("coin-select")!.addEventListener('change', update);
    document.getElementById("output-select")!.addEventListener('change', update);

    update();
});
