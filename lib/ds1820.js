// JavaScript File
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var logger = require("winston")

var CAPE_MANAGER_SLOTS_FILE = "/sys/devices/platform/bone_capemgr/slots"
var SENSOR_FILE = "/sys/bus/w1/devices/28-051680f7b2ff/w1_slave"

function initDriver() {
  fs.readFileAsync(CAPE_MANAGER_SLOTS_FILE, "utf8")
    .then(function(contents) {
      if (contents.match("BB-W1-P9.12")) {
        logger.info("driver already initialized.")
      }
      else {
        fs.writeFile(CAPE_MANAGER_SLOTS_FILE, "BB-W1-P9-12", function(err) {
          if (err) throw err;
          logger.info("Temperature sensor initialized.")
        })
      }
    }).catch(function(e) {
      logger.error(e.stack);
    });
};

function readTemperature() {
  return readTemperatureSensorFile()
    .then(function(contents) {
      var tempText = contents.match("t=\\d+")[0];
      var tempInThousands = tempText.split('=')[1];
      return Promise.resolve(tempInThousands / 1000.0);
    });
};

function readTemperatureSensorFile() {
  return fs.readFileAsync(SENSOR_FILE, "utf8")
}

module.exports = {

  readTemperatureSensorFile: readTemperatureSensorFile,

  readTemperature: readTemperature,

  initDriver: initDriver
}
