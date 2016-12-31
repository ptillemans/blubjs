// JavaScript File
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var logger = require("winston")

var CAPE_MANAGER_SLOTS_FILE = "/sys/devices/bone_capemgr.9/slots"
var SENSOR_FILE = "/sys/devices/w1_bus_master1/28-051680f7b2ff/w1_slave"

exports.readSlotsFile = function() {
    fs.readFileAsync(CAPE_MANAGER_SLOTS_FILE, "utf8")
    .then(function(contents) {
        console.log(contents);
    }).catch(function(e) {
        logger.error(e.stack);
    });
};


module.exports = {
    
    readTemperatureSensorFile: function() {
        return fs.readFileAsync(SENSOR_FILE, "utf8")
    },

    readTemperature: function() {
        return this.readTemperatureSensorFile()
            .then(function(contents) {
                var tempText = contents.match("t=\\d+")[0];
                var tempInThousands = tempText.split('=')[1];
                return tempInThousands/1000.0;
            });
    }
}