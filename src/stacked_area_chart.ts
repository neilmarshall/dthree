import 'bootstrap/dist/css/bootstrap.min.css';
import * as d3 from 'd3';

type CoinData = { date: Date, bitcoin: number, bitcoin_cash: number, ethereum: number, litecoin: number, ripple: number };

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
const z = d3.scaleOrdinal();

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
    .text("Coin Prices");

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
    .attr('y', -50)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text("Price ($USD)");

const legend = g.append('g')
    .attr('transform', `translate(${0}, ${height + 80})`)

document.addEventListener('DOMContentLoaded', async () => {

    const dateParser = d3.timeParse("%d/%m/%Y");

    // load data
    const data: any  = await d3.csv('data/coins.csv');
    const keys = data.columns.slice(1);
    const coinData: CoinData[] = Array.from(data.values())
        .map((d: any) => {
            return {
                date: dateParser(d['date']) || new Date(),
                bitcoin: parseFloat(d['bitcoin']),
                bitcoin_cash: parseFloat(d['bitcoin_cash']),
                ethereum: parseFloat(d['ethereum']),
                litecoin: parseFloat(d['litecoin']),
                ripple: parseFloat(d['ripple'])
            }
        })
        .filter((d: CoinData) => !isNaN(d.bitcoin) && !isNaN(d.bitcoin_cash) && !isNaN(d.ethereum) && !isNaN(d.litecoin) && !isNaN(d.ripple))
        .sort((d0: CoinData, d1: CoinData) => d0.date < d1.date ? -1 : d0.date > d1.date ? 1 : 0);

    // add x-axis
    g.append('g').attr('class', 'axis-bottom').attr('transform', 'translate(0, ' + height + ')');
    const [minDate, maxDate] = d3.extent(coinData, (d: CoinData) => d.date);
    x.domain([minDate || 0, maxDate || Infinity]);
    (g.select('.axis-bottom') as d3.Selection<SVGGElement, unknown, HTMLElement, any>)
        .call(axisBottom)
        .selectAll('text')
            .attr('y', 10)
            .attr('x', -5)
            .attr('transform', 'rotate(-45)')
            .attr('text-anchor', 'end');

    // add y-axis
    g.append('g').attr('class', 'axis-left');
    const maxTotalPrice = d3.max(
        coinData,
        (c: CoinData) => c.bitcoin + c.bitcoin_cash + c.ethereum + c.litecoin + c.ripple
    );
    y.domain([maxTotalPrice || 0, 0]);
    (g.select('.axis-left') as d3.Selection<SVGGElement, unknown, HTMLElement, any>)
        .call(axisLeft);

    // scale z-axis
    z.domain(keys).range(d3.schemeYlGnBu[keys.length]);

    // add path element(s)
    const stack = d3.stack<CoinData>().keys(keys);
    const series = stack(coinData);

    const area = d3.area<any>()
        .x(d => x(d.data.date))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));

    g.selectAll('.series')
        .data(series)
        .enter().append('g')
        .attr('class', 'series')
        .append('path')
        .attr('fill', (d): any => z(d.key))
        .attr('d', area);

    // add labels to legend
    keys.forEach((k: string, i: number) => {
        const legendItem = legend.append('g')
            .attr('transform', `translate(${i * 120 - k.length}, 0)`);

        legendItem.append('rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', z(k) as string);

        legendItem.append('text')
            .attr('x', 20)
            .attr('y', 10)
            .attr('text-anchor', 'start')
            .attr('font-size', 'smaller')
            .style('text-transform', 'capitalize')
            .text(k.replace('_', ' '));
    });
});
