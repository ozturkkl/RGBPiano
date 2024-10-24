"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveConfigToFile = void 0;
exports.getSavedConfig = getSavedConfig;
exports.getConfig = getConfig;
exports.updateConfig = updateConfig;
exports.onConfigUpdated = onConfigUpdated;
var events_1 = __importDefault(require("events"));
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
var timeThrottleDebounce_1 = require("./timeThrottleDebounce");
var consts_1 = require("./consts");
var configEmitter = new events_1.default();
var config = consts_1.defaultConfig;
function getConfigPath(app) {
    if (app) {
        return path_1.default.join(app.getPath('exe'), '..', 'user-config.json');
    }
    else {
        return path_1.default.join(__dirname, 'RGBPiano-config.json');
    }
}
function getSavedConfig(app) {
    try {
        var configPath = getConfigPath(app);
        console.log("Loading config from ".concat(configPath));
        var newConfig = JSON.parse((0, fs_1.readFileSync)(configPath, 'utf8'));
        Object.assign(config, newConfig);
    }
    catch (error) {
        console.log('Could not load config file, using default config');
    }
    return config;
}
exports.saveConfigToFile = (0, timeThrottleDebounce_1.debounce)(function (app, c) {
    var configPath = getConfigPath(app);
    console.log("Saving config to ".concat(configPath));
    try {
        (0, fs_1.writeFileSync)(configPath, JSON.stringify(__assign(__assign({}, config), c), null, 2));
    }
    catch (error) {
        console.error('Could not save config file');
        console.error(error);
    }
}, 1000);
function getConfig() {
    return config;
}
function updateConfig(newConfig) {
    var updatedProperties = {};
    getUpdatedProperties(config, newConfig).forEach(function (property) {
        updatedProperties[property] = newConfig[property];
    });
    if (Object.keys(updatedProperties).length > 0) {
        Object.assign(config, newConfig);
        configEmitter.emit('configUpdated', updatedProperties);
    }
}
function onConfigUpdated(listener, invokeImmediately) {
    if (invokeImmediately === void 0) { invokeImmediately = false; }
    var throttled = (0, timeThrottleDebounce_1.throttleWithTrailing)(listener, 22); // 45 FPS
    if (invokeImmediately) {
        listener(config);
    }
    configEmitter.on('configUpdated', function (updatedProperties) {
        throttled(updatedProperties);
    });
}
function isDeepEqual(obj1, obj2) {
    // Check if both are primitives (string, number, boolean, etc.) or functions
    if (obj1 === obj2)
        return true;
    // If either is null or undefined, or if their types differ, they are not equal
    if (obj1 == null || obj2 == null || typeof obj1 !== typeof obj2)
        return false;
    // If they are not objects (i.e., they are functions or other non-object non-primitive types), return false
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object')
        return false;
    // Handle Arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length)
            return false;
        for (var i = 0; i < obj1.length; i++) {
            if (!isDeepEqual(obj1[i], obj2[i]))
                return false;
        }
        return true;
    }
    // If one is array and the other is not, they are not equal
    if (Array.isArray(obj1) !== Array.isArray(obj2))
        return false;
    // Handle Objects
    var keys1 = Object.keys(obj1);
    var keys2 = Object.keys(obj2);
    // If number of keys is different, they are not equal
    if (keys1.length !== keys2.length)
        return false;
    // Check recursively for each key
    for (var _i = 0, keys1_1 = keys1; _i < keys1_1.length; _i++) {
        var key = keys1_1[_i];
        if (!keys2.includes(key) ||
            !isDeepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }
    return true;
}
function getUpdatedProperties(currentConfig, newConfig) {
    var updatedProperties = [];
    for (var key in newConfig) {
        var isDeepEqualResult = isDeepEqual(currentConfig[key], newConfig[key]);
        if (!isDeepEqualResult) {
            updatedProperties.push(key);
        }
    }
    return updatedProperties;
}
