import * as d3 from 'd3';

console.log('A basic walkthrough of D3 scales');

console.log('Ordinal Scales - These map a discrete domain to a discrete range');

console.log("const ordinalScale = d3.scaleOrdinal().domain(['a', 'b', 'c']).range([4, 5]);");
const ordinalScale = d3.scaleOrdinal().domain(['a', 'b', 'c']).range([4, 5]);  // if not using TypeScript could write this simply as d3.scaleOrdinal(['a', 'b', 'c'], [4, 5])

console.log('We have now mapped the elements a, b, and c to the values 4, 5, and 4 - noting that as the length of the domain and range are different, the range "wraps around"');

for (let k of ['a', 'b', 'c']) {
    console.log(`ordinalScale(${k})`);
    console.log(ordinalScale(k));
}

console.log('Band Scales - These map a discrete domain to a continuous, numeric range. They are useful to calculate the x-position and width of bars in a bar chart.');

console.log("const bandScale = d3.scaleBand().domain(['a', 'b', 'c', 'd']).range([0, 10]).paddingInner(0.1).paddingOuter(0.1);");
const bandScale = d3.scaleBand().domain(['a', 'b', 'c', 'd']).range([0, 10]).paddingInner(0.1).paddingOuter(0.1);

console.log('This will divide the range [0, 10] into 2 outer paddings of 0.1 units, 3 inner paddings of 0.1 units, and 4 bars of (1 - 0.1 - 0.1) units).');
console.log('So each band will be 10 / (2 * 0.1 + 3 * 0.1 + 4 * 0.8) * 0.8 = 2.16 units');
console.log("bandScale.bandwidth();");
console.log(bandScale.bandwidth());
console.log("bandScale.step();");
console.log(bandScale.step());
for (let k of ['a', 'b', 'c', 'd']) {
    console.log(`bandScale(${k})`);
    console.log(bandScale(k));
}

