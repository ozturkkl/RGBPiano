'use strict'
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i]
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
        }
        return t
      }
    return __assign.apply(this, arguments)
  }
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
exports.__esModule = true
exports.onConfigUpdated =
  exports.updateConfig =
  exports.getConfig =
  exports.NUM_LEDS =
  exports.MAX_NOTE =
  exports.MIN_NOTE =
  exports.DATA_PIN =
  exports.PORT =
  exports.configPath =
    void 0
var events_1 = __importDefault(require('events'))
var fs_1 = require('fs')
var path_1 = __importDefault(require('path'))
exports.configPath = path_1['default'].join(__dirname, 'RGBPiano-config.json')
exports.PORT = 3192
exports.DATA_PIN = 18
exports.MIN_NOTE = 21
exports.MAX_NOTE = 108
exports.NUM_LEDS = 177
function getConfig() {
  return config
}
exports.getConfig = getConfig
function updateConfig(newConfig) {
  var updatedProperties = {}
  compareProperties(config, newConfig, updatedProperties)
  if (Object.keys(updatedProperties).length > 0) {
    config = __assign(__assign({}, config), newConfig)
    configEmitter.emit('configUpdated', updatedProperties)
    // write config to file
    ;(0, fs_1.writeFileSync)(exports.configPath, JSON.stringify(config, null, 2))
  }
}
exports.updateConfig = updateConfig
function onConfigUpdated(listener) {
  configEmitter.on('configUpdated', function (updatedProperties) {
    listener(updatedProperties)
  })
}
exports.onConfigUpdated = onConfigUpdated
var config = {
  BRIGHTNESS: 1,
  BACKGROUND_COLOR: [0, 2, 2],
  COLOR: [0, 255, 255],
  CONSTANT_VELOCITY: true,
  SELECTED_DEVICE: 'Springbeats vMIDI1'
}
initConfig()
var configEmitter = new events_1['default']()
function isObject(value) {
  return typeof value === 'object' && value !== null
}
function compareProperties(currentConfig, newConfig, updatedProperties, path) {
  if (path === void 0) {
    path = ''
  }
  for (var key in newConfig) {
    var currentVal = currentConfig[key]
    var newVal = newConfig[key]
    var nestedPath = path ? ''.concat(path, '.').concat(key) : key
    if (isObject(currentVal) && isObject(newVal)) {
      compareProperties(currentVal, newVal, updatedProperties, nestedPath)
    } else if (currentVal !== newVal) {
      updatedProperties[nestedPath] = newVal
    }
  }
}
function initConfig() {
  try {
    config = __assign(
      __assign({}, config),
      JSON.parse((0, fs_1.readFileSync)(exports.configPath, 'utf8'))
    )
  } catch (error) {
    console.log('Could not load config file, using default config')
  }
}
