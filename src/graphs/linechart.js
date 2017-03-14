import { Graph } from 'graphs/graph';
import * as nv from 'nvd3';
import * as d3 from 'd3';

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
        const chart = nv.models.lineWithFocusChart();
        chart.yAxis.tickFormat(d3.format('f'));
        d3.select(node)
        .datum(this.reshapeData())
        .call(chart);
    }

    reshapeData() {
        // nvd3 expects
        // [{key: 'name', values:[{ x: <number>, y: <number> }]}]
        return this.data.groups.map(series =>
            ({
                key: series.country_code,
                values: series.values,
            }));
    }
}
