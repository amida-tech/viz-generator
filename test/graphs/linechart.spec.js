import { LineChart, makeLineChart } from 'graphs/linechart';
import data from 'fixtures/chartdata/linechart.json';

describe('LineChart', () => {
    it('exists', () => expect(LineChart).to.exist);

    it('throws exception with no data', () => {
        expect(() => new LineChart()).to.throw('No data provided to LineChart');
    });

    it('throws exception with no options', () =>
        expect(() => new LineChart(data)).to.throw('No options provided to LineChart'));
});
