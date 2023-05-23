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
exports.__esModule = true;
exports.onConfigUpdated = exports.updateConfig = exports.getConfig = exports.NUM_LEDS = exports.MAX_NOTE = exports.MIN_NOTE = exports.DATA_PIN = exports.PORT = exports.configPath = void 0;
var events_1 = __importDefault(require("events"));
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
var colors_1 = require("./colors");
exports.configPath = path_1["default"].join(__dirname, 'RGBPiano-config.json');
exports.PORT = 3192;
exports.DATA_PIN = 18;
exports.MIN_NOTE = 21;
exports.MAX_NOTE = 108;
exports.NUM_LEDS = 176;
function getConfig() {
    return config;
}
exports.getConfig = getConfig;
function updateConfig(newConfig) {
    var updatedProperties = {};
    getUpdatedProperties(config, newConfig).forEach(function (property) {
        updatedProperties[property] = newConfig[property];
    });
    if (Object.keys(updatedProperties).length > 0) {
        config = __assign(__assign({}, config), newConfig);
        configEmitter.emit('configUpdated', updatedProperties);
        // write config to file
        (0, fs_1.writeFileSync)(exports.configPath, JSON.stringify(config, null, 2));
    }
}
exports.updateConfig = updateConfig;
function onConfigUpdated(listener) {
    configEmitter.on('configUpdated', function (updatedProperties) {
        listener(updatedProperties);
    });
}
exports.onConfigUpdated = onConfigUpdated;
var hue = Math.round(Math.random() * 360);
var config = {
    BRIGHTNESS: 1,
    BACKGROUND_COLOR: (0, colors_1.HSLToRGB)(hue, 100, 1),
    COLOR: (0, colors_1.HSLToRGB)(hue, 100, 50),
    CONSTANT_VELOCITY: true,
    SELECTED_DEVICE: 'Springbeats vMIDI1'
};
initConfig();
var configEmitter = new events_1["default"]();
function isObject(value) {
    return typeof value === 'object' && value !== null;
}
function getUpdatedProperties(currentConfig, newConfig) {
    var updatedProperties = [];
    for (var key in newConfig) {
        if (!isObject(newConfig[key])) {
            if (currentConfig[key] !== newConfig[key]) {
                updatedProperties.push(key);
            }
        }
        else {
            var nestedUpdatedProperties = getUpdatedProperties(currentConfig[key], newConfig[key]);
            if (nestedUpdatedProperties.length > 0) {
                updatedProperties.push(key);
            }
        }
    }
    return updatedProperties;
}
function initConfig() {
    try {
        config = __assign(__assign({}, config), JSON.parse((0, fs_1.readFileSync)(exports.configPath, 'utf8')));
    }
    catch (error) {
        console.log('Could not load config file, using default config');
    }
}
