import * as viz from 'index';

describe('viz', () => {
    it('defines superclass', () => expect(viz.Graph).to.exist);

    it('says hi', () => {
        expect(viz.hello).to.exist;
        expect(viz.hello()).to.equal('hello world');
    });
});
