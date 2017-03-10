import { hello } from 'viz';

describe('viz', () => {
    it('returns \'hello world\'', () => {
        // console.log(vizGenerator);
        // expect(vizGenerator).to.exist;
        // expect(vizGenerator.hello()).to.equal('hello world');
        expect(hello).to.exists;
        expect(hello()).to.equal('hello world');
    });
});
