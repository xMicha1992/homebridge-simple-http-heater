# homebridge-simple-http-heater

Simpler http Heater


A Homebridge plugin to control a water heater via HTTP GET requests.

## Features

- Control your water heater temperature via HTTP GET requests.
- Set custom min, max, and step values for the temperature.
- Configurable HTTP timeout for slow servers.

## Installation
1. Check if the needed package is installed
   - npm install axios homebridge
1. Install Homebridge using the instructions from [homebridge.io](https://homebridge.io).
2. Install the plugin:
  -  npm install -g homebridge-simple-http-heater

## Response from Server:
Example:
http://10.0.0.2:8443/?get
   {
   	"temperature": 38.0
   }


