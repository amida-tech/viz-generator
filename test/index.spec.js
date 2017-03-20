import * as viz from 'index';
import { expect } from 'chai';

describe('viz', () => {
    it('defines superclass', () => expect(viz.Graph).to.exist);

    it('says hi', () => {
        expect(viz.hello()).to.equal('hello world');
    });
});
