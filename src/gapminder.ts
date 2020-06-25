import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-slider/dist/css/bootstrap-slider.min.css';
import * as d3 from 'd3';
const Slider = require('bootstrap-slider');

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
    .attr('transform', `translate(${width - 50}, ${height - 20})`)
    .attr('fill', 'grey');

const legend = g.append('g')
    .attr('transform', `translate(${width - 10}, ${height - 125})`)

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

class VisualisationRunner {
    private currentYear: number;
    private filteredData: DataPoint[];
    private interval: any;
    private minYear: number;
    private maxYear: number;
    private slider: any;

    private static readonly PLAY: string = "Play";
    private static readonly PAUSE: string = "Pause";

    constructor(
        public data: DataPoint[],
        public playButton: HTMLElement,
        public resetButton: HTMLElement,
        public filterButton: HTMLElement,
        public yearSlideSelector: string
    ) {
        this.currentYear = 0;
        this.interval = null;
        this.filteredData = this.data;
        (this.resetButton as HTMLButtonElement).disabled = true;
        this.minYear = d3.min(data, dp => parseInt(dp.year.toString())) || 0;
        this.maxYear = d3.max(data, dp => parseInt(dp.year.toString())) || 0;
        this.slider = new Slider(yearSlideSelector, {
            min: this.minYear,
            max: this.maxYear
        });

        this.playButton.addEventListener('click', () => {
            (this.resetButton as HTMLButtonElement).disabled = false;
            switch (this.playButton.innerHTML) {
                case VisualisationRunner.PLAY:
                    this.playButton.innerHTML = VisualisationRunner.PAUSE;
                    this.Play();
                    break;
                case VisualisationRunner.PAUSE:
                    this.playButton.innerHTML = VisualisationRunner.PLAY;
                    this.Pause();
                    break;
                default:
                    throw "something went wrong";
            }
        });

        this.resetButton.addEventListener('click', () => {
            if (this.interval) {
                this.Reset();
                switch (this.playButton.innerHTML) {
                    case VisualisationRunner.PLAY:
                        this.playButton.innerHTML = VisualisationRunner.PAUSE;
                        this.Play();
                        break;
                    case VisualisationRunner.PAUSE:
                        break;
                    default:
                        throw "something went wrong";
                }
            }
        });

        this.filterButton.addEventListener('change', (e) => {
            const continent = (e.target as HTMLButtonElement).value;
            if (continent === "all") {
                this.filteredData = this.data;
            } else {
                this.filteredData = this.data.map(dp => {
                    return {year: dp.year, countries: dp.countries.filter(d => d.continent === continent)}
                });
            }
            if (this.playButton.innerHTML === VisualisationRunner.PLAY) {
                update(this.filteredData[this.currentYear]);
            }
        });

        this.slider.on('slideStop', (selectedYear: number) => {
            this.currentYear = selectedYear - this.minYear;
            if (this.playButton.innerHTML === VisualisationRunner.PLAY) {
                update(this.filteredData[this.currentYear]);
            }
        });
    }

    private Play() {
        this.interval = d3.interval(() => {
            update(this.filteredData[this.currentYear]);
            this.currentYear = (this.currentYear + 1) % this.filteredData.length;
            this.slider.setValue(this.currentYear + this.minYear);
        }, duration);
    }

    private Pause() {
        this.interval.stop();
    }

    private Reset() {
        (this.filterButton as HTMLButtonElement).value = 'all';
        this.filteredData = this.data;
        this.currentYear = 0;
    }
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

    // add labels to legend
    continents.forEach((c, i) => {
        const legendRow = legend.append('g')
            .attr('transform', `translate(0, ${i * 20})`);

        legendRow.append('rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', continent(c) as string);

        legendRow.append('text')
            .attr('x', -10)
            .attr('y', 10)
            .attr('text-anchor', 'end')
            .style('text-transform', 'capitalize')
            .text(c);
    });

    const runner = new VisualisationRunner(
        data,
        document.getElementById('play-button')!,
        document.getElementById('reset-button')!,
        document.getElementById('continent-select')!,
        '#year-slider'
    );
});
