import * as d3 from 'd3';

export class ChordMatrix {
    update() {
        this.matrix = [];
        this.objs = [];
        this.entry = {};

        this.layoutCache = { groups: {}, chords: {} };

        this.groups().forEach((group) => {
            this.layoutCache.groups[group.id] = {
                startAngle: group.startAngle,
                endAngle: group.endAngle,
            };
        });

        this.chords().forEach((chord) => {
            this.layoutCache.chords[this.chordId(chord)] = {
                source: {
                    id: chord.source.id,
                    startAngle: chord.source.startAngle,
                    endAngle: chord.source.endAngle,
                },
                target: {
                    id: chord.target.id,
                    startAngle: chord.target.startAngle,
                    endAngle: chord.target.endAngle,
                },
            };
        });

        this.matrixIndex = Object.keys(this.indexHash);

        for (let i = 0; i < this.matrixIndex.length; i += 1) {
            if (!this.matrix[i]) {
                this.matrix[i] = [];
            }
            for (let j = 0; j < this.matrixIndex.length; j += 1) {
                this.objs = this.dataStore.filter(obj =>
                    this.filterFunc(obj,
                        this.indexHash[this.matrixIndex[i]],
                        this.indexHash[this.matrixIndex[j]]));

                const entry = this.reduceFunc(this.objs,
                        this.indexHash[this.matrixIndex[i]],
                        this.indexHash[this.matrixIndex[j]]);

                entry.valueOf = function () {
                    return +this.value;
                };
                this.matrix[i][j] = entry;
            }
        }

        this.chordLayout.matrix(this.matrix);
        return this.matrix;
    }

    data(data) {
        this.dataStore = data;
        return this;
    }

    filter(func) {
        this.filterFunc = func;
        return this;
    }

    reduce(func) {
        this.reduceFunc = func;
        return this;
    }

    layout(d3ChordLayout) {
        this.chordLayout = d3ChordLayout;
        return this;
    }

    groups() {
        return this.chordLayout.groups().map((group) => {
            group.id = this.matrixIndex[group.index];
            return group;
        });
    }

    chords() {
        return this.chordLayout.chords().map((chord) => {
            chord.id = this.chordId(chord);
            chord.source.id = this.matrixIndex[chord.source.index];
            chord.target.id = this.matrixIndex[chord.target.index];
            return chord;
        });
    }

    addKey(key, data) {
        if (!this.indexHash[key]) {
            this.indexHash[key] = { name: key, data: data || {} };
        }
    }

    addKeys(props, fun) {
        for (let i = 0; i < this.dataStore.length; i += 1) {
            for (let j = 0; j < props.length; j += 1) {
                this.addKey(this.dataStore[i][props[j]],
                    fun ? fun(this.dataStore[i], props[j]) : {});
            }
        }
        return this;
    }

    resetKeys() {
        this.indexHash = {};
        return this;
    }

    chordId(d) {
        const s = this.matrixIndex[d.source.index];
        const t = this.matrixIndex[d.target.index];
        return (s < t) ? `${s}__${t}` : `${t}__${s}`;
    }

    groupTween(d3Arc) {
        return (d) => {
            let tween;
            const cached = this.layoutCache.groups[d.id];
            if (cached) {
                tween = d3.interpolateObject(cached, d);
            } else {
                tween = d3.interpolateObject({
                    startAngle: d.startAngle,
                    endAngle: d.startAngle,
                }, d);
            }
            return t => d3Arc(tween(t));
        };
    }

    chordTween(d3Path) {
        return (d) => {
            let tween;
            let groups;
            let cached = this.layoutCache.chords[d.id];

            if (cached) {
                if (d.source.id !== cached.source.id) {
                    cached = { source: cached.target, target: cached.source };
                }
                tween = d3.interpolateObject(cached, d);
            } else {
                if (this.layoutCache.groups) {
                    groups = [];
                    Object.keys(this.layoutCache.groups).forEach((key) => {
                        cached = this.layoutCache.groups[key];
                        if (cached.id === d.source.id || cached.id === d.target.id) {
                            groups.push(cached);
                        }
                    });
                    if (groups.length > 0) {
                        cached = { source: groups[0], target: groups[1] || groups[0] };
                        if (d.source.id !== cached.source.id) {
                            cached = { source: cached.target, target: cached.source };
                        }
                    } else {
                        cached = d;
                    }
                } else {
                    cached = d;
                }

                tween = d3.interpolateObject({
                    source: {
                        startAngle: cached.source.startAngle,
                        endAngle: cached.source.startAngle,
                    },
                    target: {
                        startAngle: cached.target.startAngle,
                        endAngle: cached.target.startAngle,
                    },
                }, d);
            }
            return t => d3Path(tween(t));
        };
    }

    read(d) {
        let g;
        const m = {};
        if (d.source) {
            m.sname = d.source.id;
            m.sdata = d.source.value;
            m.svalue = +d.source.value;
            m.stotal = this.matrix[d.source.index].reduce((k, n) => k + n, 0);
            m.tname = d.target.id;
            m.tdata = d.target.value;
            m.tvalue = +d.target.value;
            m.ttotal = this.matrix[d.target.index].reduce((k, n) => k + n, 0);
        } else {
            g = this.indexHash[d.id];
            m.gname = g.name;
            m.gdata = g.data;
            m.gvalue = d.value;
        }
        m.mtotal = this.matrix.reduce((m1, n1) => m1 + n1.reduce((m2, n2) => m2 + n2, 0));
        return m;
    }
}
