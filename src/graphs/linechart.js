import * as d3 from 'd3';
import * as nv from 'nvd3';
import { Graph } from 'graphs/graph';
import { Utils } from 'utils';

require('../styles/linechart.css');

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
        return new Promise((resolve, reject) => {
            const tickSize = 6;
            const pointSize = 50;

            const chart = nv.models.lineChart();
            chart.yAxis.tickFormat(Utils.nFormat);
            // space labels to accommodate outer ticks
            chart.xAxis.axis.tickPadding(10);
            chart.yAxis.axis.tickPadding(10);
            chart.color(Utils.colorScaleWBarr);
            // force tick svg location to remove grid lines and create outer ticks
            chart.dispatch.on('renderEnd', () => {
                // NOTE can't use .tickSize because that doesn't kick in until render
                d3.select(node).selectAll('.nv-x .tick line').attr('y2', tickSize).style('stroke', 'lightgray');
                d3.select(node).selectAll('.nv-y .tick line').attr('x2', -tickSize).style('stroke', 'lightgray');

                const makePath = (orient, tickSizeOuter) => {
                    const k = orient === 'left' ? -1 : 1;
                    const range = (orient === 'left' ? chart.yAxis : chart.xAxis)
                    .scale().range();
                    const range0 = range[0];
                    const range1 = range[range.length - 1];
                    const result = orient === 'left'
                    ? `M${k * tickSizeOuter},${range0}H0V${range1}H${k * tickSizeOuter}`
                    : `M${range0},${k * tickSizeOuter}V0H${range1}V${k * tickSizeOuter}`;
                    return result;
                };
                d3.select(node).select('.nv-x path.domain')
                .attr('d', makePath('bottom', tickSize));
                d3.select(node).select('.nv-y path.domain')
                .attr('d', makePath('left', tickSize));
                resolve();
            });
            // force point size to match existing design
            chart.lines.scatter.pointSize(pointSize);
            d3.select(node).append('svg')
            .datum(this.reshapeData())
            .call(chart);

            // force draw point fills to approximate existing design
            d3.select(node).selectAll('.nv-point')
            .style('fill-opacity', '1')
            .style('stroke', 'white')
            .style('stroke-opacity', '1');
            // force stroke-opacity to 1 on x-axis to show
            d3.select(node).selectAll('.domain')
            .style('stroke-opacity', '1')
            .style('stroke', 'lightgray');
        });
    }

    reshapeData() {
        // nvd3 expects
        // [{key: 'name', values:[{ x: <number>, y: <number> }]}]
        return this.data.groups.map(series =>
            ({
                key: series.country_code,
                color: this.options.primary === series.country_code ? Utils.colorPrimary : null,
                values: series.values,
            }));
    }
}
