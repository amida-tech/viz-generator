import { LineChart } from 'index';
import data from 'fixtures/chartdata/linechart.json';
import options from 'fixtures/chartoptions/linechart.json';

require('./index.html');

window.onload = () => {
    const chart = new LineChart(data, options);
    chart.render(document.querySelector('#chart'));
};
