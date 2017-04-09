import d3, { event as currentEvent } from 'd3';
import { Graph } from 'graphs/graph';
import { ChordMatrix } from 'chorddiagram/chordmatrix';
import { Utils } from 'utils';

export class ChordDiagram extends Graph {
    constructor(data, options) {
        super(data, options);

        const validation = this.validate();
        if (validation) throw validation;
    }

    validate() {
        // require both data and options to exist
        if (!this.data) return 'No data provided to ChordDiagram';
        if (!this.options) return 'No options provided to ChordDiagram';
        if (!this.options.primary) return 'No primary country provided to ChordDiagram';
        if (!this.options.partners) return 'No partner countries specified to ChordDiagram';
        if (!this.options.plotParams.year) return 'No year specified to ChordDiagram';
        if (!this.options.indicator) return 'No indicator specified to ChordDiagram';
        return null;
    }

    render(node) {
        return new Promise((resolve, reject) => {
            let container;

            function resetChords() {
                currentEvent.preventDefault();
                currentEvent.stopPropagation();
                container.selectAll('path.chord').style('opacity', 0.9);
            }

            function dimChords(d) {
                currentEvent.preventDefault();
                currentEvent.stopPropagation();
                container.selectAll('path.chord').style('opacity', (p) => {
                    if (d.source) {
                        return (p.id === d.id) ? 0.9 : 0.1;
                    }
                    return (p.source.id === d.id || p.target.id === d.id) ? 0.9 : 0.1;
                });
            }

            function groupClick(d) {
                currentEvent.preventDefault();
                currentEvent.stopPropagation();
                // TODO addFilter
                resetChords();
            }

            function chordMouseover(d) {
                currentEvent.preventDefault();
                currentEvent.stopPropagation();
                dimChords(d);
                d3.select(node).select('.tooltip')
                .style('opacity', 1);
                // TODO $scope.updateTooltip(chordMatrix.read(d));
            }

            function hideTooltip() {
                currentEvent.preventDefault();
                currentEvent.stopPropagation();
                d3.select(node).select('.tooltip').style('opacity', 0);
                resetChords();
            }

            const size = [this.options.width, this.options.height];
            const marg = [0, 0, 0, 0];
            const dims = [];
            dims[0] = size[0] - marg[1] - marg[3];
            dims[1] = size[1] - marg[0] - marg[2];

            const colors = d3.scale.ordinal().range(Utils.colorScaleWBarr);
            const primaryOverride = (d) => {
                if (d === this.options.primary) {
                    return Utils.colorPrimary;
                }
                return colors(d);
            };

            const chord = d3.layout.chord()
            .padding(0.02)
            .sortGroups(d3.descending)
            .sortSubgroups(d3.ascending);

            const chordMatrix = new ChordMatrix();
            chordMatrix.layout(chord)
                .filter((item, r, c) => (item.partner1 === r.name && item.partner2 === c.name) ||
                (item.partner1 === c.name && item.partner2 === r.name))
            .reduce((items, r, c) => {
                let value;
                if (!items[0]) {
                    value = 0;
                } else {
                    value = items.reduce((m, n) => {
                        if (r === c) {
                            return m + (n.value1 + n.value2);
                        }
                        return m + (n.partner1 === r.name ? n.value1 : n.value2);
                    }, 0);
                }
                return { value, data: items };
            });

            const innerRadius = (dims[1] / 2) - 100;

            const arc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(innerRadius + 20);

            const path = d3.svg.chord().radius(innerRadius);

            // remove existing contents of node first
            d3.select(node).html('');
            const svg = d3.select(node).append('svg')
                .attr('class', 'chart')
                .attr({ width: '100%', height: '100%' })
                .attr('preserveAspectRatio', 'xMidYMin meet')
                .attr('viewBox', `0 0 ${size[0]} ${size[1]}`);

            container = svg.append('g')
                .attr('class', 'container')
                .attr('transform', `translate(${(dims[0] / 2) + marg[3]},${(dims[1] / 2) + marg[0]})`);

            const messages = svg.append('text')
                .attr('class', 'messages')
                .attr('transform', 'translate(10,10)')
                .text('Updating...');


            messages.attr('opacity', 1);
            messages.transition().duration(1000).attr('opacity', 0);

            chordMatrix.data(this.reshapeData(this.data))
                .resetKeys()
                .addKeys(['partner1', 'partner2'])
                .update();

            const groups = container.selectAll('g.group')
                .data(chordMatrix.groups(), d => d.id);

            const gEnter = groups.enter()
                .append('g')
                .attr('class', 'group');

            gEnter.append('path')
                .style('pointer-events', 'none')
                .style('fill', d => primaryOverride(d.id))
                .attr('d', arc);

            gEnter.append('text')
                .attr('dy', '.35em')
                .on('click', groupClick)
                .on('mouseover', dimChords)
                .on('mouseout', resetChords)
                .text(d => d.id);

            groups.select('path')
                .transition().duration(2000)
                .attrTween('d', chordMatrix.groupTween(arc));

            groups.select('text')
                .transition()
                .duration(2000)
                .attr('transform', (d) => {
                    d.angle = (d.startAngle + d.endAngle) / 2;
                    const r = `rotate(${((d.angle * 180) / Math.PI) - 90})`;
                    const t = ` translate(${innerRadius + 26})`;
                    return r + t + (d.angle > Math.PI ? ' rotate(180)' : ' rotate(0)');
                })
                .attr('text-anchor', d => (d.angle > Math.PI ? 'end' : 'begin'));

            groups.exit().select('text').attr('fill', 'orange');
            groups.exit().select('path').remove();

            groups.exit().transition().duration(1000)
                .style('opacity', 0)
                .remove();

            const chords = container.selectAll('path.chord')
                .data(chordMatrix.chords(), d => d.id);

            chords.enter().append('path')
                .attr('class', 'chord')
                .style('fill', d => primaryOverride(d.source.id))
                .attr('d', path)
                .on('mouseover', chordMouseover)
                .on('mouseout', hideTooltip);

            chords.transition().duration(2000)
                .attrTween('d', chordMatrix.chordTween(path));

            chords.exit().remove();

            resolve();
        });
    }

    reshapeData() {
        const primary = this.options.primary;
        const data = this.data;
        const partners = this.options.partners;
        const indicator = this.options.indicator;
        const result = [];
        let primaryData = data.data.find(d => d.id === primary);
        if (!primaryData) {
            return null;
        }
        primaryData = primaryData.indicators.find(d => d.id === indicator);
        if (!primaryData) {
            return null;
        }
        for (let i = 0; i < partners.length; i += 1) {
            const partner2 = partners[i];

            // primary to partner value
            const primaryToPartnerData = primaryData.partners.find(d => d.partner === partner2);
            let value1;
            if (!primaryToPartnerData ||
                !primaryToPartnerData.values[this.options.plotParams.year]) {
                value1 = 0;
            } else {
                value1 = primaryToPartnerData.values[this.options.plotParams.year];
            }

            // partner to primary value
            let value2;
            let partnerToPrimaryData = data.data.find(d => d.id === partner2);
            if (!partnerToPrimaryData) {
                value2 = 0;
            } else {
                partnerToPrimaryData =
                    partnerToPrimaryData.indicators.find(d => d.id === indicator);
                if (!partnerToPrimaryData) {
                    value2 = 0;
                } else {
                    partnerToPrimaryData =
                        partnerToPrimaryData.partners.find(d => d.partner === primary);
                    if (!partnerToPrimaryData ||
                        !partnerToPrimaryData.values[this.options.plotParams.year]) {
                        value2 = 0;
                    } else {
                        value2 = partnerToPrimaryData.values[this.options.plotParams.year];
                    }
                }
            }
            result.push({ partner1: primary, partner2, value1, value2 });
        }

        // sum non-partner countries to form "Other" group
        const other = primaryData.partners.reduce((acc, partner) => {
            if (partners.includes(partner.partner)) {
                return acc;
            }
            return acc + (partner.values[this.options.plotParams.year] || 0);
        }, 0);
        result.push({ partner1: primary, partner2: 'Other', value1: other, value2: other });
        return result;
    }
}

export default function makeChordDiagram(data, options, node) {
    const cd = new ChordDiagram(data, options);
    cd.render(node);
}
