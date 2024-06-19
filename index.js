const axios = require('axios');

let Service, Characteristic;

class WaterTemperatureAccessory {
  constructor(log, config) {
    this.log = log;
    this.name = config.name;
    this.getURL = config.getURL;
    this.setURL = config.setURL;
    this.maxTemp = config.maxTemp;
    this.minTemp = config.minTemp;
    this.minStep = config.minStep || 0.5; // Standardwert 0.5, falls nicht angegeben
    this.timeout = config.timeout * 1000 || 2000; // Standardwert 2000ms (2 Sekunden), falls nicht angegeben

    // Erstelle einen neuen Thermostat-Service
    this.service = new Service.Thermostat(this.name);

    // Wir setzen die Modi auf HEAT und machen sie nicht änderbar
    this.service.getCharacteristic(Characteristic.CurrentHeatingCoolingState)
      .setValue(Characteristic.CurrentHeatingCoolingState.HEAT)
      .setProps({
        validValues: [Characteristic.CurrentHeatingCoolingState.HEAT]
      })
      .on('get', (callback) => {
        callback(null, Characteristic.CurrentHeatingCoolingState.HEAT);
      });

    this.service.getCharacteristic(Characteristic.TargetHeatingCoolingState)
      .setValue(Characteristic.TargetHeatingCoolingState.HEAT)
      .setProps({
        validValues: [Characteristic.TargetHeatingCoolingState.HEAT]
      })
      .on('get', (callback) => {
        callback(null, Characteristic.TargetHeatingCoolingState.HEAT);
      })
      .on('set', (value, callback) => {
        callback(null);  // Ignoriere Set-Operationen
      });

    // Initialisiere die Temperatur-Charakteristiken
    this.service.getCharacteristic(Characteristic.CurrentTemperature)
      .on('get', this.getCurrentTemperature.bind(this));

    this.service.getCharacteristic(Characteristic.TargetTemperature)
      .on('get', this.getTargetTemperature.bind(this))
      .on('set', this.setTargetTemperature.bind(this));

    // Setze die Temperaturgrenzen und Schritte
    this.service.getCharacteristic(Characteristic.TargetTemperature)
      .setProps({
        minValue: this.minTemp,
        maxValue: this.maxTemp,
        minStep: this.minStep // Verwende den konfigurierbaren minStep
      });

    this.service.getCharacteristic(Characteristic.TemperatureDisplayUnits)
      .setValue(Characteristic.TemperatureDisplayUnits.CELSIUS);

    // Initiale Aktualisierung der Temperatur, um HomeKit mitzuteilen, dass das Gerät bereit ist
    this.updateTemperature();
  }

  // Methode zur Abfrage und Aktualisierung der aktuellen Temperatur
  async updateTemperature() {
    try {
      const response = await axios.get(this.getURL, { timeout: this.timeout });
      const currentTemperature = this.parseTemperatureResponse(response.data);
      this.log(`Fetched current temperature: ${currentTemperature}`);
      this.service.getCharacteristic(Characteristic.CurrentTemperature).updateValue(currentTemperature);
      this.service.getCharacteristic(Characteristic.TargetTemperature).updateValue(currentTemperature);
    } catch (error) {
      this.log('Error updating temperature:', error.message);
    }
  }

  // Methode zur Abfrage der aktuellen Temperatur
  async getCurrentTemperature(callback) {
    try {
      const response = await axios.get(this.getURL, { timeout: this.timeout });
      const currentTemperature = this.parseTemperatureResponse(response.data);
      this.log(`Current temperature: ${currentTemperature}`);
      callback(null, currentTemperature);
    } catch (error) {
      this.log('Error getting current temperature:', error.message);
      callback(error);
    }
  }

  // Methode zur Abfrage der Zieltemperatur
  async getTargetTemperature(callback) {
    try {
      const response = await axios.get(this.getURL, { timeout: this.timeout });
      const targetTemperature = this.parseTemperatureResponse(response.data);
      this.log(`Target temperature: ${targetTemperature}`);
      callback(null, targetTemperature);
    } catch (error) {
      this.log('Error getting target temperature:', error.message);
      callback(error);
    }
  }

  // Methode zur Einstellung der Zieltemperatur
  async setTargetTemperature(value, callback) {
    try {
      const response = await axios.get(`${this.setURL}${value}`, { timeout: this.timeout });
      // Prüfe auf JSON-Antwort mit 'success' Feld
      if (response.data && response.data.success) {
        this.log(`Successfully set target temperature to: ${value}`);
        callback(null);
      }
      // Falls die Antwort nicht den erwarteten Formaten entspricht
      else {
        this.log(`Failed to set target temperature: Server response was not successful`);
        callback(new Error('Failed to set target temperature'));
      }
    } catch (error) {
      this.log('Error setting target temperature:', error.message);
      callback(error);
    }
  }

  // Hilfsmethode zum Parsen der Temperaturantwort
  parseTemperatureResponse(data) {
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        this.log('Received plain text response:', data);
        return parseFloat(data);
      }
    }
    if (typeof data === 'object' && data.temperature !== undefined) {
      this.log('Received JSON response:', data);
      return parseFloat(data.temperature);
    }
    this.log('Unexpected response format:', data);
    throw new Error('Unexpected response format');
  }

  getServices() {
    return [this.service];
  }
}

// Exportiere die Funktion zur Registrierung des Plugins
module.exports = (homebridge) => {
  // Wir erhalten hier die HAP-Klassen von HomeBridge
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  // Registriere das Plugin
  homebridge.registerAccessory('homebridge-simple-http-heater', 'WaterTemperature', WaterTemperatureAccessory);
};
