var mqtt = require('mqtt');
var Temperatures = require("./Temperatures");

var client;

const messageRegex = /(\w*)\((\d+)\): (.*)°C/;

function connect(store, hostname) {
    client = mqtt.connect('mqtt://' + hostname);

    client.on('connect', function() {
        client.subscribe('blub/sensors', function(err) {
            if (!err) {
                client.publish('blub/presence', 'Hello mqtt');
            }
        });
    });

    client.on('message', function(topic, message) {
        // message is Buffer
        var msg = message.toString();
        console.log(msg);
        var match = messageRegex.exec(msg);
        if (match) {
            var sensor = match[1];
            // var seq_id = Number.parseInt(match[2]);
            var temperature = Number.parseFloat(match[3]);
            var action = Temperatures.createAddTemperatureAction(temperature, sensor);
            store.dispatch(action);
        }
        else {
            client.publish('blub/errors', 'Cannot parse [' + msg + '] from ' + topic);
        }
    });
}

function disconnect() {
    client.end();
}


module.exports = {
    connect: connect,
    disconnect: disconnect,
};
