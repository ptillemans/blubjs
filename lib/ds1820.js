// JavaScript File
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var logger = require("winston")

var CAPE_MANAGER_SLOTS_FILE = "/sys/devices/bone_capemgr.9/slots"
var SENSOR_FILE = "/sys/devices/w1_bus_master1/28-051680f7b2ff/w1_slave"

function initDriver() {
  fs.readFileAsync(CAPE_MANAGER_SLOTS_FILE, "utf8")
  .then(function(contents) {
    if (contents.match("DS1820")) {
      logger.info("driver already initialized.")
    } else {
      fs.writeFile(CAPE_MANAGER_SLOTS_FILE,"DS1820", function(err) {
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
      return tempInThousands/1000.0;
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