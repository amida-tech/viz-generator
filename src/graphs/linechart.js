import { Graph } from 'graphs/graph';

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

        // option validation
        if (!this.options.plotParams) return 'No plot parameters provided to LineChart';
        if (!this.options.plotParams.x) return 'No x axis specified in LineChart options';
        if (!this.options.plotParams.y) return 'No y axis specified in LineChart options';

        // heder validation
        if (!this.data.header) return 'No header specified in LineChart data';
        if (!this.data.header.values[0][this.options.plotParams.x] ||
            !this.data.header.values[0][this.options.plotParams.x].display_name) {
            return `No header value specified for x axis (${this.options.plotParams.x})`;
        }
        if (!this.data.header.values[0][this.options.plotParams.y] ||
            !this.data.header.values[0][this.options.plotParams.y].display_name) {
            return `No header value specified for y axis (${this.options.plotParams.y})`;
        }
        return null;
    }

    render(node) {
        node.innerHTML = 'line chart!';
    }
}
