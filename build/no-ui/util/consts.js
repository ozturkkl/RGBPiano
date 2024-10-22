"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIDI_INPUT_DEVICE_IDLE_REFRESH_INTERVAL = exports.MAX_NOTE = exports.MIN_NOTE = exports.DATA_PIN = exports.PORT = exports.defaultConfig = void 0;
var colors_1 = require("./colors");
exports.defaultConfig = {
    BRIGHTNESS: 1,
    BACKGROUND_BRIGHTNESS: 0.03,
    BACKGROUND_COLOR_RGB: (0, colors_1.HSLToRGB)(18, 100, 50),
    NOTE_PRESS_COLOR_RGB: (0, colors_1.HSLToRGB)(18, 100, 50),
    CONSTANT_VELOCITY: true,
    LED_RECEIVE_FROM: 'Springbeats vMIDI1',
    LED_INVERT: true,
    LED_END_COUNT: 177,
    LED_START_COUNT: 0,
    AUTO_CONNECT_BLE_DEVICES: [
        {
            id: '48:B6:20:19:80:CE',
            port: 'Springbeats vMIDI2',
        },
        {
            id: '48:B6:20:22:01:4A',
            port: 'Springbeats vMIDI3',
        },
    ],
};
exports.PORT = 3192;
exports.DATA_PIN = 18;
exports.MIN_NOTE = 21;
exports.MAX_NOTE = 108;
exports.MIDI_INPUT_DEVICE_IDLE_REFRESH_INTERVAL = 10000;
