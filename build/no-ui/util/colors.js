"use strict";
exports.__esModule = true;
exports.getBlendedRGB = exports.HSLToRGB = exports.RGBToHSL = void 0;
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
exports.RGBToHSL = RGBToHSL;
function HSLToRGB(h, s, l) {
    s /= 100;
    l /= 100;
    var k = function (n) { return (n + h / 30) % 12; };
    var a = s * Math.min(l, 1 - l);
    var f = function (n) { return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); };
    return [255 * f(0), 255 * f(8), 255 * f(4)];
}
exports.HSLToRGB = HSLToRGB;
function getBlendedRGB(_a, _b, ratio) {
    var c1r = _a[0], c1g = _a[1], c1b = _a[2];
    var c2r = _b[0], c2g = _b[1], c2b = _b[2];
    return [
        Math.round(c1r * ratio) + Math.round(c2r * (1 - ratio)),
        Math.round(c1g * ratio) + Math.round(c2g * (1 - ratio)),
        Math.round(c1b * ratio) + Math.round(c2b * (1 - ratio))
    ];
}
exports.getBlendedRGB = getBlendedRGB;
