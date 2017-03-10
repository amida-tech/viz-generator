import hello from 'index';

describe('viz', () => {
    it('returns \'hello world\'', () => {
        expect(hello).to.exist;
        expect(hello()).to.equal('hello world');
    });
});
