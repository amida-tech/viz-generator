import { LineChart, makeLineChart } from 'graphs/linechart';

describe('LineChart', () => {
    it('throws exception with no data', () => {
        expect(() => new LineChart()).to.throw(/No data provided/);
    });
});
