const Utils = {
    number_format(number, decimals, decPoint, thousandsSep) {
        let n = number;
        let prec = decimals;

        const toFixedFix = (num, precision) => {
            const k = 10 ** precision;
            return (Math.round(num * k) / k).toString();
        };

        n = !isFinite(+n) ? 0 : +n;
        prec = !isFinite(+prec) ? 0 : Math.abs(prec);
        const sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep;
        const dec = (typeof decPoint === 'undefined') ? '.' : decPoint;

        // fix for IE parseFloat(0.55).toFixed(0) = 0;
        let s = (prec > 0) ? toFixedFix(n, prec) : toFixedFix(Math.round(n), prec);

        const abs = toFixedFix(Math.abs(n), prec);
        let _;
        let i;

        if (abs >= 1000) {
            _ = abs.split(/\D/);
            i = _[0].length % 3 || 3;

            _[0] = s.slice(0, i + (n < 0)) +
              _[0].slice(i).replace(/(\d{3})/g, `${sep}$1`);
            s = _.join(dec);
        } else {
            s = s.replace('.', dec);
        }

        const decPos = s.indexOf(dec);
        if (prec >= 1 && decPos !== -1 && (s.length - decPos - 1) < prec) {
            s += `${new Array(prec - (s.length - decPos - 1)).join(0)}0`;
        } else if (prec >= 1 && decPos === -1) {
            s += `${dec + new Array(prec).join(0)}0`;
        }

    // integer values should be rounded
        if (Number.isInteger(Number.parseFloat(s)) && s.indexOf(',') < 0) {
            s = Math.round(s).toString();
        }

        return s;
    },


    nFormat(number) {
        const absNumber = Math.abs(number);

        if (absNumber > 999999999999999) {
            return `${Utils.number_format(number / 1000000000000000, 2, '.', ',')}Q`;
        } else if (absNumber > 999999999999) {
            return `${Utils.number_format(number / 1000000000000, 2, '.', ',')}T`;
        } else if (absNumber > 999999999) {
            return `${Utils.number_format(number / 1000000000, 2, '.', ',')}B`;
        } else if (absNumber > 999999) {
            return `${Utils.number_format(number / 1000000, 2, '.', ',')}M`;
        } else if ((absNumber > 999) && (absNumber < 1000000)) {
            return `${Utils.number_format(number / 1000, 2, '.', ',')}K`;
        }
        return Utils.number_format(number, 2, '.', ',');
    },
};

export { Utils };
