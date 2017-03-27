import { LineChart, makeLineChart } from 'graphs/linechart';
import dataFixture from 'fixtures/chartdata/linechart.json';
import optionsFixture from 'fixtures/chartoptions/linechart.json';
import { expect } from 'chai';

describe('LineChart', () => {
    let data;
    let options;
    let target;
    beforeEach(() => {
        data = JSON.parse(JSON.stringify(dataFixture));
        options = JSON.parse(JSON.stringify(optionsFixture));

        // add chart div to install into
        target = document.querySelector('#linechart');
        if (!target) {
            target = document.createElement('div');
            target.id = 'linechart';
            document.body.append(target);
        }
    });

    afterEach(() => {
        while (target.firstChild) {
            target.removeChild(target.firstChild);
        }
    });

    it('exists', () => expect(LineChart).to.exist);

    it('throws an exception with no data', () => {
        expect(() => new LineChart()).to.throw('No data provided to LineChart');
    });

    it('throws an exception with no options', () =>
        expect(() => new LineChart(data)).to.throw('No options provided to LineChart'));

    it('throws an exception with no plot parameters', () => {
        delete options.plotParams;
        expect(() => new LineChart(data, options)).to.throw('No plot parameters provided to LineChart');
    });

    it('throws an exception with no x-axis specified', () => {
        delete options.plotParams.x;
        expect(() => new LineChart(data, options)).to.throw('No x axis specified in LineChart options');
    });

    it('throws an exception with no y-axis specified', () => {
        delete options.plotParams.y;
        expect(() => new LineChart(data, options)).to.throw('No y axis specified in LineChart options');
    });

    it('throws an exception with no data headers specified', () => {
        delete data.header;
        expect(() => new LineChart(data, options)).to.throw('No header specified in LineChart data');
    });

    it('throws an exception with no x-axis header', () => {
        delete data.header.values[0][options.plotParams.x];
        expect(() => new LineChart(data, options)).to.throw(`No header value specified for x axis (${options.plotParams.x})`);
    });

    it('throws an exception with no x-axis display name', () => {
        delete data.header.values[0][options.plotParams.x].display_name;
        expect(() => new LineChart(data, options)).to.throw(`No header value specified for x axis (${options.plotParams.x})`);
    });

    it('throws an exception with no y-axis header', () => {
        delete data.header.values[0][options.plotParams.y];
        expect(() => new LineChart(data, options)).to.throw(`No header value specified for y axis (${options.plotParams.y})`);
    });

    it('throws an exception with no y-axis display name', () => {
        delete data.header.values[0][options.plotParams.y].display_name;
        expect(() => new LineChart(data, options)).to.throw(`No header value specified for y axis (${options.plotParams.y})`);
    });

    it('renders svg into the dom', (done) => {
        new LineChart(data, options).render(document.querySelector('#linechart')).then(() => {
            expect(document.querySelector('svg')).to.be.not.null;
            done();
        });
    });

    it('renders correct number of data points', (done) => {
        new LineChart(data, options).render(document.querySelector('#linechart')).then(() => {
            expect(document.querySelectorAll('.nv-point').length).to.equal((2015 - 1970) + 1);
            done();
        });
    });
});
