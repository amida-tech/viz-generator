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

    wrapName(name) {
        const MAX_LENGTH = this.options.maxLength || 13;
        if (name.length < MAX_LENGTH) return name;

        // try splitting before parentheses
        const byParen = name.split(' (');
        if (byParen.every(el => el.length < MAX_LENGTH)) {
            return byParen.join('\n(');
        }

        // try splitting after comma
        const byComma = name.split(', ');
        if (byComma.every(el => el.length < MAX_LENGTH)) {
            return byComma.join(',\n');
        }

        // break on a space
        const bySpace = name.split(' ');
        let minBySpace = [name];
        let min = name.length;
        for (let i = 0; i < bySpace.length; i += 1) {
            const split = [bySpace.slice(0, i + 1).join(' '),
                bySpace.slice(i + 1).join(' ')];
            const splitLength = Math.max.apply(null, split.map(s => s.length));
            if (splitLength < min) {
                min = splitLength;
                minBySpace = split;
            }
        }

        return minBySpace.join('\n');
    }

    render(node) {
        return new Promise((resolve, reject) => {
            let container;

            const resetChords = () => {
                currentEvent.preventDefault();
                currentEvent.stopPropagation();
                container.selectAll('path.chord').style('opacity', 0.9);
            };

            const dimChords = (d) => {
                currentEvent.preventDefault();
                currentEvent.stopPropagation();
                container.selectAll('path.chord').style('opacity', (p) => {
                    if (d.source) {
                        return (p.id === d.id) ? 0.9 : 0.1;
                    }
                    return (p.source.id === d.id || p.target.id === d.id) ? 0.9 : 0.1;
                });
            };

            const updateToolTip = (data) => {
                // partner1 will be reference country
                const partner1Name =
                this.data.partners.find(p => p.id === data.sdata.data[0].partner1).name;
                const partner2 = this.data.partners.find(p => p.id === data.sdata.data[0].partner2);
                const value1 = data.sdata.data[0].displayValue1;
                const value2 = data.sdata.data[0].displayValue2;
                const partner2Name = partner2 ? partner2.name : 'Other';
                const location = d3.mouse(node);
                d3.select(node).select('.tooltip').html(
                `<i>${partner1Name} \u21FE ${partner2Name}: ${Utils.nFormat(value1)}</i><br/>
                    <i>${partner2Name} \u21FE ${partner1Name}: ${Utils.nFormat(value2)}</i>`)
                .style('left', `${location[0]}px`)
                .style('top', `${location[1]}px`);
            };

            const chordMatrix = new ChordMatrix();

            const chordMouseover = (d) => {
                currentEvent.preventDefault();
                currentEvent.stopPropagation();
                dimChords(d);
                d3.select(node).select('.tooltip')
                .style('opacity', 1);
                updateToolTip(chordMatrix.read(d));
            };

            const hideTooltip = () => {
                currentEvent.preventDefault();
                currentEvent.stopPropagation();
                d3.select(node).select('.tooltip').style('opacity', 0);
                resetChords();
            };

            const size = [this.options.width, this.options.height];
            const marg = [20, 20, 20, 20];
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
            d3.select(node).append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0)
                .style('text-align', 'center');

            const svg = d3.select(node).append('svg')
                .attr('class', 'chart')
                .attr({ width: '100%', height: '100%' })
                .attr('preserveAspectRatio', 'xMidYMin slice')
                .attr('viewBox', `0 0 ${size[0]} ${size[1]}`);

            container = svg.append('g')
                .attr('class', 'container')
                .attr('transform', `translate(${(dims[0] / 2) + marg[3]},${(dims[1] / 2) + marg[0]})`);

            const reshaped = this.reshapeData(this.data);
            if (reshaped === null) {
                reject(new Error('No data available for reference country'));
                d3.select(node).html('');
            }
            chordMatrix.data(reshaped)
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
                .on('mouseover', dimChords)
                .on('mouseout', resetChords)
                .text((d) => {
                    if (d.id === 'Other') return d.id;
                    return this.wrapName(
                        this.data.countries.find(country => country.id === d.id).name);
                });

            // convert new lines to tspans
            container.selectAll('g.group text').call((texts) => {
                const wrapTspan = function () {
                    const text = d3.select(this);
                    const components = text.text().split('\n');
                    if (components.length > 1) {
                        text.text(null);
                        text.append('tspan')
                            .attr('x', 0)
                            .attr('dy', `${parseFloat(text.attr('dy')) - 0.6}em`)
                            .text(components[0]);
                        text.append('tspan')
                            .attr('x', 0)
                            .attr('dy', `${parseFloat(text.attr('dy')) + 0.6}em`)
                            .text(components[1]);
                    }
                };
                texts.each(wrapTspan);
            });

            groups.select('text')
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
            let displayValue1;
            if (!primaryToPartnerData ||
                !primaryToPartnerData.values[this.options.plotParams.year]) {
                displayValue1 = 0;
            } else {
                displayValue1 = primaryToPartnerData.values[this.options.plotParams.year];
            }
            const value1 = Math.abs(displayValue1);

            // partner to primary value
            let displayValue2;
            let partnerToPrimaryData = data.data.find(d => d.id === partner2);
            if (!partnerToPrimaryData) {
                displayValue2 = 0;
            } else {
                partnerToPrimaryData =
                    partnerToPrimaryData.indicators.find(d => d.id === indicator);
                if (!partnerToPrimaryData) {
                    displayValue2 = 0;
                } else {
                    partnerToPrimaryData =
                        partnerToPrimaryData.partners.find(d => d.partner === primary);
                    if (!partnerToPrimaryData ||
                        !partnerToPrimaryData.values[this.options.plotParams.year]) {
                        displayValue2 = 0;
                    } else {
                        displayValue2 = partnerToPrimaryData.values[this.options.plotParams.year];
                    }
                }
            }
            const value2 = Math.abs(displayValue2);
            if (value1 !== 0 && value2 !== 0) {
                result.push({
                    partner1: primary,
                    partner2,
                    value1,
                    value2,
                    displayValue1,
                    displayValue2,
                });
            }
        }

        // sum non-partner countries to form "Other" group
        const displayRefToOther = primaryData.partners.reduce((acc, partner) => {
            if (partners.includes(partner.partner)) {
                return acc;
            }
            return acc + (partner.values[this.options.plotParams.year] || 0);
        }, 0);
        const displayOtherToRef = data.otherData.data.reduce((acc, otherCountry) => {
            if (partners.includes(otherCountry.id)) return acc;
            const indicatorData = otherCountry.indicators[0].partners[0];
            return acc + (indicatorData.values[this.options.plotParams.year] || 0);
        }, 0);

        const refToOther = Math.abs(displayRefToOther);
        const otherToRef = Math.abs(displayOtherToRef);

        if (refToOther !== 0) {
            result.push({
                partner1: primary,
                partner2: 'Other',
                value1: refToOther,
                value2: otherToRef,
                displayValue1: displayRefToOther,
                displayValue2: displayOtherToRef,
            });
        }

        if (result.length === 0) {
            return null;
        }
        return result;
    }
}

export default function makeChordDiagram(data, options, node) {
    const cd = new ChordDiagram(data, options);
    cd.render(node);
}
