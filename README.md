# homebridge-simple-http-heater

Simpler http Heater


A Homebridge plugin to control a water heater via HTTP GET requests.

## Features

- Control your water heater temperature via HTTP GET requests.
- Set custom min, max, and step values for the temperature.
- Configurable HTTP timeout for slow servers.

## Installation
1. Check if the needed package is installed
   ```sh
      npm install axios homebridge
   ```
1. Install Homebridge using the instructions from [homebridge.io](https://homebridge.io).
2. Install the plugin:
   ```sh
      npm install -g homebridge-simple-http-heater
   ```

## Getting Started
| name        | type           | description  |
| ------------- |:-------------:| :-----|
| name      | < string > | required: Defines the name which is later displayed in HomeKit |
| getURL      |  < string >      |   required: Defines the url to get the temperature |
| maxTemp | < int >      |    required: Defines the maximum temperature |
| minTemp | < int >      |    required: Defines the minimum temperature |
| minStep | < float >      |    optional: Defines steps - If not present, 0.5 is default |
| timeout | < int >      |    optional: Defines timeout from Server in seconds - If not present, 2 seconds is default |


***config.json***
   ```sh
"accessories": [
        {
            "accessory": "WaterTemperature",
            "name": "Water Heater",
            "getURL": "http://10.0.0.1:80/?get",
            "setURL": "http://10.0.0.1:80/?set=",
            "maxTemp": 60,
            "minTemp": 30,
            "minStep": 0.5,
            "timeout": 5
        }
    ]
 ```

## Expected response from server:
### GET Temperature
http://10.0.0.1:80/?get
```json

   {
   	"temperature": 38.0
   }
```
### SET Temperature
http://10.0.0.1:80/?set=50.0
```json
{
	"success": true,
	"temperature": 50.0
}
```


