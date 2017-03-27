import { ChordDiagram, makeChordDiagram } from 'graphs/chorddiagram';
import dataFixture from 'fixtures/chartdata/chorddiagram.json';
import optionsFixture from 'fixtures/chartoptions/chorddiagram.json';
import { expect } from 'chai';

describe('ChordDiagram', () => {
    let data;
    let options;
    let target;
    beforeEach(() => {
        data = JSON.parse(JSON.stringify(dataFixture));
        options = JSON.parse(JSON.stringify(optionsFixture));

        // add chart div to install into
        target = document.querySelector('#chorddiagram');
        if (!target) {
            target = document.createElement('div');
            target.id = 'chorddiagram';
            document.body.append(target);
        }
    });

    afterEach(() => {
        while (target.firstChild) {
            target.removeChild(target.firstChild);
        }
    });

    it('exists', () => expect(ChordDiagram).to.exist);

    it('throws an exception with no data', () => {
        expect(() => new ChordDiagram()).to.throw('No data provided to ChordDiagram');
    });

    it('throws an exception with no options', () =>
        expect(() => new ChordDiagram(data)).to.throw('No options provided to ChordDiagram'));

    it('renders svg into the dom', (done) => {
        new ChordDiagram(data, options).render(document.querySelector('#chorddiagram')).then(() => {
            expect(document.querySelector('svg')).to.be.not.null;
            done();
        });
    });
});
