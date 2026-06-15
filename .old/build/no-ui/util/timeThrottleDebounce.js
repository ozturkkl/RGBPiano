"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throttleWithTrailing = throttleWithTrailing;
exports.debounce = debounce;
function throttleWithTrailing(fn, wait) {
    var lastArgs = null;
    var lastCallTime = 0;
    var timeout = null;
    return function throttled() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var now = Date.now();
        var remainingTime = wait - (now - lastCallTime);
        if (remainingTime <= 0) {
            // If enough time has passed, execute the function immediately
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            lastCallTime = now;
            fn.apply(void 0, args);
        }
        else {
            // Store the latest args and set up a trailing call
            lastArgs = args;
            if (!timeout) {
                timeout = setTimeout(function () {
                    timeout = null;
                    lastCallTime = Date.now();
                    if (lastArgs) {
                        fn.apply(void 0, lastArgs);
                        lastArgs = null;
                    }
                }, remainingTime);
            }
        }
    };
}
function debounce(fn, wait) {
    var timeout = null;
    return function debounced() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(function () {
            timeout = null;
            fn.apply(void 0, args);
        }, wait);
    };
}
