"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RGBToHSL = RGBToHSL;
exports.HSLToRGB = HSLToRGB;
exports.hexToRgb = hexToRgb;
exports.RGBToHex = RGBToHex;
exports.getBlendedRGB = getBlendedRGB;
function RGBToHSL(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    var l = Math.max(r, g, b);
    var s = l - Math.min(r, g, b);
    var h = s ? (l === r ? (g - b) / s : l === g ? 2 + (b - r) / s : 4 + (r - g) / s) : 0;
    return [
        60 * h < 0 ? 60 * h + 360 : 60 * h,
        100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
        (100 * (2 * l - s)) / 2
    ];
}
function HSLToRGB(h, s, l) {
    s /= 100;
    l /= 100;
    var k = function (n) { return (n + h / 30) % 12; };
    var a = s * Math.min(l, 1 - l);
    var f = function (n) { return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); };
    return [255 * f(0), 255 * f(8), 255 * f(4)];
}
function hexToRgb(hex) {
    var _a, _b;
    return ((_b = (_a = hex
        .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function (_m, r, g, b) { return '#' + r + r + g + g + b + b; })
        .substring(1)
        .match(/.{2}/g)) === null || _a === void 0 ? void 0 : _a.map(function (x) { return parseInt(x, 16); })) !== null && _b !== void 0 ? _b : [0, 0, 0]);
}
function RGBToHex(r, g, b) {
    return ('#' +
        [r, g, b]
            .map(function (x) {
            var hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        })
            .join(''));
}
function getBlendedRGB(_a, _b, ratio) {
    var c1r = _a[0], c1g = _a[1], c1b = _a[2];
    var c2r = _b[0], c2g = _b[1], c2b = _b[2];
    return [
        Math.round(c1r * ratio) + Math.round(c2r * (1 - ratio)),
        Math.round(c1g * ratio) + Math.round(c2g * (1 - ratio)),
        Math.round(c1b * ratio) + Math.round(c2b * (1 - ratio))
    ];
}
