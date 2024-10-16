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
exports.onConfigUpdated = exports.updateConfig = exports.getConfig = exports.saveConfigToFile = exports.getSavedConfig = exports.INPUT_DEVICE_REFRESH_INTERVAL = exports.MAX_NOTE = exports.MIN_NOTE = exports.DATA_PIN = exports.PORT = void 0;
var events_1 = __importDefault(require("events"));
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
var colors_1 = require("./colors");
var timeThrottleDebounce_1 = require("./timeThrottleDebounce");
var configEmitter = new events_1.default();
var hue = 18;
exports.PORT = 3192;
exports.DATA_PIN = 18;
exports.MIN_NOTE = 21;
exports.MAX_NOTE = 108;
exports.INPUT_DEVICE_REFRESH_INTERVAL = 10000;
var config = {
    BRIGHTNESS: 1,
    BACKGROUND_BRIGHTNESS: 0.03,
    BACKGROUND_COLOR_RGB: (0, colors_1.HSLToRGB)(hue, 100, 50),
    NOTE_PRESS_COLOR_RGB: (0, colors_1.HSLToRGB)(hue, 100, 50),
    CONSTANT_VELOCITY: true,
    SELECTED_DEVICE: 'Springbeats vMIDI1',
    LED_INVERT: true,
    LED_END_COUNT: 177,
    LED_START_COUNT: 0,
    AUTO_CONNECT_BLE_DEVICES: [
        {
            id: '48:B6:20:19:80:CE',
            port: 'Springbeats vMIDI2'
        },
        {
            id: '48:B6:20:22:01:4A',
            port: 'Springbeats vMIDI3'
        }
    ]
};
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
        config = __assign(__assign({}, config), JSON.parse((0, fs_1.readFileSync)(configPath, 'utf8')));
    }
    catch (error) {
        console.log('Could not load config file, using default config');
    }
    return config;
}
exports.getSavedConfig = getSavedConfig;
exports.saveConfigToFile = (0, timeThrottleDebounce_1.debounce)(function (app) {
    var configPath = getConfigPath(app);
    console.log("Saving config to ".concat(configPath));
    try {
        (0, fs_1.writeFileSync)(configPath, JSON.stringify(config, null, 2));
    }
    catch (error) {
        console.error('Could not save config file');
        console.error(error);
    }
}, 1000);
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
    }
}
exports.updateConfig = updateConfig;
function onConfigUpdated(listener) {
    var throttled = (0, timeThrottleDebounce_1.throttleWithTrailing)(listener, 22); // 45 FPS
    configEmitter.on('configUpdated', function (updatedProperties) {
        throttled(updatedProperties);
    });
}
exports.onConfigUpdated = onConfigUpdated;
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
            !isDeepEqual(obj1[key], obj2[key]))
            return false;
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
