import { ChordDiagram } from 'index';
import data from 'fixtures/chartdata/chorddiagram.json';
import options from 'fixtures/chartoptions/chorddiagram.json';

window.onload = () => {
    const chart = new ChordDiagram(data, options);
    chart.render(document.querySelector('#chart'));
};
