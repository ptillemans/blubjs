var b = require('bonescript');

const RELAY_1 = "P9_14"
const RELAY_2 = "P9_16"
var relayPins = [RELAY_1, RELAY_2];

for(var i in relayPins) {
    b.pinMode(relayPins[i], b.OUTPUT);
    b.digitalWrite(relayPins[i], b.HIGH);
}

function relay1(state) {
    b.digitalWrite(RELAY_1, state ? b.LOW : b.HIGH)
}

function relay2(state) {
    b.digitalWrite(RELAY_2, state ? b.LOW : b.HIGH)
}

module.exports = {
    relay1: relay1,
    relay2: relay2
}