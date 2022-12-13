var mqtt = require('mqtt');
var Temperatures = require("./Temperatures");

var client;

const messageRegex = /(\w*)\((\d+)\): (.*)°C/;

function connect(store, hostname) {
    let mqttUrl = `mqtt://${hostname}:1883`
    console.log(`subcribing to Mqtt server ${mqttUrl}.`)

    client = mqtt.connect(mqttUrl, {clientId:"blubjs"});
    client.on('error', function(err) { console.log(`Mqtt error: ${err}`) });

    client.on('offline', function() { console.log(`Mqtt offline.`)} )
    
    client.on('connect', function() {
        console.log(`successfully connected to Mqtt server ${mqttUrl} topics.`)
        for (var topic in ['blub/sensors', 'zigbee2mqtt/Buro Lotte Temperature', 'zigbee2mqtt/Mezzanine Temperature']) {
            client.subscribe(topic, function(err) {
                if (!err) {
                    client.publish('blub/errors', `cannot subscribe to ${topic}`);
                }
            });
            console.log(`subscribed to ${topic}.`)
        }
    });
    
    client.on('message', function(topic, message) {
        console.log(`received on ${topic} message ${message}.`)
        if (topic === "blub/sensors") {
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
        } else if (topic.startsWith('zigbee2mqtt/')) {
            var data = JSON.parse(message.toString());
            var sensor = topic.split("/")[1]
            var temperature = data["temperature"]
            var action = Temperatures.createAddTemperatureAction(temperature, sensor);
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
