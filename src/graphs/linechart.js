import { Graph } from '../index';

export class LineChart extends Graph {
    constructor(data, options) {
        super(data, options);
        const validation = this.validate();
        if (validation) throw validation;
    }

    validate() {
        // require both data and options to exist
        if (!this.data) return 'No data provided to LineChart';
        if (!this.options) return 'No options provided to LineChart';

        return null;
    }
}
