"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throttleWithTrailing = throttleWithTrailing;
exports.debounce = debounce;
function throttleWithTrailing(fn, wait) {
    var lastArgs = null;
    var lastCallTime = 0;
    var timeout = null;
    return function throttled(arg) {
        var now = Date.now();
        var remainingTime = wait - (now - lastCallTime);
        if (remainingTime <= 0) {
            // If enough time has passed, execute the function immediately
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            lastCallTime = now;
            fn(arg);
        }
        else {
            // Store the latest args and set up a trailing call
            lastArgs = arg;
            if (!timeout) {
                timeout = setTimeout(function () {
                    timeout = null;
                    lastCallTime = Date.now();
                    if (lastArgs) {
                        fn(lastArgs);
                        lastArgs = null;
                    }
                }, remainingTime);
            }
        }
    };
}
function debounce(fn, wait) {
    var timeout = null;
    return function debounced(arg) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(function () {
            timeout = null;
            fn(arg);
        }, wait);
    };
}
