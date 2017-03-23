import { ChordDiagram, makeChordDiagram } from 'graphs/chorddiagram';
import dataFixture from 'fixtures/chartdata/chorddiagram.json';
import optionsFixture from 'fixtures/chartoptions/chorddiagram.json';
import { expect } from 'chai';

describe('ChordDiagram', () => {
    it('exists', () => expect(ChordDiagram).to.exist);

    let data;
    let options;
    beforeEach(() => {
        data = JSON.parse(JSON.stringify(dataFixture));
        options = JSON.parse(JSON.stringify(optionsFixture));

        // add chart div to install into
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        const chartDiv = document.createElement('div');
        chartDiv.id = 'chart';
        document.body.append(chartDiv);
    });

    it('throws an exception with no data', () => {
        expect(() => new ChordDiagram()).to.throw('No data provided to ChordDiagram');
    });

    it('throws an exception with no options', () =>
        expect(() => new ChordDiagram(data)).to.throw('No options provided to ChordDiagram'));

    it('renders svg into the dom', (done) => {
        new ChordDiagram(data, options).render(document.querySelector('div')).then(() => {
            expect(document.querySelector('svg')).to.be.not.null;
            done();
        });
    });
});
