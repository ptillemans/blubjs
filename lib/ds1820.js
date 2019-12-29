// JavaScript File
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));

var SENSOR_FILE = "/sys/bus/w1/devices/28-051680f7b2ff/w1_slave";

function readTemperature() {
  return readTemperatureSensorFile()
    .then(parseTemperature);
}

function readTemperatureSensorFile() {
  return fs.readFileAsync(SENSOR_FILE, "utf8");
}

function parseTemperature(contents) {
    const tempText = contents.match("t=\\d+")[0];
    const tempInThousands = tempText.split('=')[1];
    return Promise.resolve(tempInThousands / 1000.0);
}

module.exports = {

    readTemperatureSensorFile: readTemperatureSensorFile,

    parseTemperature: parseTemperature,

    readTemperature: readTemperature,

};
