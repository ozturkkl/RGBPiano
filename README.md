# RGBPiano

Piano RGB LED controller. Will light up LED strip when keys are pressed. Strictly uses websockets for communication between the host and the client. Built this because I am using the midi port on my keyboard for other things and wanted a super solid web based solution. Inspired by [onlaj/Piano-LED-Visualizer](https://github.com/onlaj/Piano-LED-Visualizer).

![led-piano](https://github.com/ozturkkl/RGBPiano/assets/51798197/996cd7ff-adf1-42fd-bbfb-e13fc2055af6)

## Getting Started

### Prepare your hardware --> [instructions](https://tutorials-raspberrypi.com/connect-control-raspberry-pi-ws2812-rgb-led-strips/)

You will need for a better list of hardware and setup instructions visit [onlaj/Piano-LED-Visualizer](https://github.com/onlaj/Piano-LED-Visualizer):

- Raspberry Pi Zero WH
- Micro SD card minimum 8GB
- 5V 6A power supply should be sufficient
- DC socket with quick connection
- A WS2812 type adressible RGB LED strip, the better the quality the better the color reproduction

### Download and install node for both the host and the client systems

1. Access your raspberry pi zero using ssh using this [guide](https://medium.com/@nikosmouroutis/how-to-setup-your-raspberry-pi-and-connect-to-it-through-ssh-and-your-local-wifi-ac53d3839be9)

2. Install node 11 on rpi zero using this [guide](https://hassancorrigan.com/blog/install-nodejs-on-a-raspberry-pi-zero/):

   - `wget https://nodejs.org/dist/latest-v11.x/node-v11.15.0-linux-armv6l.tar.gz`
   - `tar xvfJ node-v11.15.0-linux-armv6l.tar.gz`
   - `sudo cp -R node-v11.15.0-linux-armv6l/* /usr/local/`

3. Install node 11 on your host system using this [link](https://nodejs.org/en/download):
   - Windows systems also need to install VS build tools, you can try `npm install --global --production windows-build-tools` or visit [here](https://visualstudio.microsoft.com/downloads/?q=build+tools)

### Clone this repo

1. Clone this repo to your host system and raspberry pi zero
2. Navigate to the repo and run: 
   - PI ----> `npm run pi:install && npm run pi:start`
   - HOST ----> use dist app or `npm run electron:install && npm run electron` for debug mode

### Future work

- [x] Complete MVP, ability to control the strip with the keyboard using websockets
- [x] Add ability to save settings
- [ ] Add ability to control the strip with google home
- [ ] Add UI to select midi input device, color, brightness, etc.
- [ ] Create RPI image to make setup easier
- [ ] Create packaged version of the app for windows, mac, and linux (don't know if will ever do this)
- [ ] Maybe support for basic API to control the strip?
- [ ] Make app work in sync with keysight (maybe, depends on how much I use keysight going forward)
