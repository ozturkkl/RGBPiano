'use strict'
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i)
          ar[i] = from[i]
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from))
  }
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
exports.__esModule = true
exports.RgbStrip = void 0
var rpi_ws281x_native_1 = __importDefault(require('rpi-ws281x-native'))
var color_1 = __importDefault(require('color'))
var config_1 = require('./config')
var RgbStrip = /** @class */ (function () {
  function RgbStrip() {
    var _this = this
    this.channel = (0, rpi_ws281x_native_1['default'])(config_1.NUM_LEDS, {
      stripType: rpi_ws281x_native_1['default'].stripType.WS2812,
      gpio: config_1.DATA_PIN,
      brightness: (0, config_1.getConfig)().BRIGHTNESS * 255,
      invert: false
    })
    this.colors = this.channel.array
    ;(0, config_1.onConfigUpdated)(function (updatedProperties) {
      if (updatedProperties.BRIGHTNESS) {
        _this.setBrightness(updatedProperties.BRIGHTNESS)
      }
      if (updatedProperties.BACKGROUND_COLOR) {
        _this.setBackgroundColor.apply(_this, updatedProperties.BACKGROUND_COLOR)
      }
    })
  }
  RgbStrip.prototype.setBrightness = function (brightness) {
    this.channel.brightness = brightness * 255
    rpi_ws281x_native_1['default'].render()
  }
  RgbStrip.prototype.setPixelColor = function (
    pixelPositionRatio,
    velocityRatio,
    red,
    green,
    blue
  ) {
    if (velocityRatio === void 0) {
      velocityRatio = 1
    }
    if (red === void 0) {
      red = 255
    }
    if (green === void 0) {
      green = 255
    }
    if (blue === void 0) {
      blue = 255
    }
    var bgColor = (0, config_1.getConfig)().BACKGROUND_COLOR
    var blendedColor = color_1['default'].rgb(
      Math.round(red * velocityRatio) + Math.round(bgColor[0] * (1 - velocityRatio)),
      Math.round(green * velocityRatio) + Math.round(bgColor[1] * (1 - velocityRatio)),
      Math.round(blue * velocityRatio) + Math.round(bgColor[2] * (1 - velocityRatio))
    )
    // if no pixel position is specified, set all pixels to the same color
    if (pixelPositionRatio === undefined) {
      this.colors.fill(blendedColor.rgbNumber())
    } else {
      var pixelPosition = Math.round((config_1.NUM_LEDS - 2) * pixelPositionRatio) + 1
      this.colors[pixelPosition] = blendedColor.rgbNumber()
    }
    rpi_ws281x_native_1['default'].render()
  }
  RgbStrip.prototype.setBackgroundColor = function (red, green, blue) {
    if (red === void 0) {
      red = 0
    }
    if (green === void 0) {
      green = 0
    }
    if (blue === void 0) {
      blue = 0
    }
    this.colors.fill(color_1['default'].rgb(red, green, blue).rgbNumber())
    rpi_ws281x_native_1['default'].render()
  }
  // reset(): void {
  //   ws281x.reset()
  // }
  RgbStrip.prototype.handleNotePress = function (data) {
    // note
    if (data.midiChannel === 144) {
      if ((0, config_1.getConfig)().CONSTANT_VELOCITY) {
        data.noteVelocityRatio = data.noteVelocityRatio === 0 ? 0 : 1
      }
      this.setPixelColor.apply(
        this,
        __spreadArray(
          [data.notePositionRatio, data.noteVelocityRatio],
          (0, config_1.getConfig)().COLOR,
          false
        )
      )
    }
    // pedal
    if (data.midiChannel === 176) {
      // disabled until other notes disappearing is fixed
      // this.setBackgroundColor(
      //   ...BACKGROUND_COLOR.map((c) => c * (noteVelocityRatio === 1 ? 2 : 1))
      // );
    }
  }
  return RgbStrip
})()
exports.RgbStrip = RgbStrip
