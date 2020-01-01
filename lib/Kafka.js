const Kafka = require('node-rdkafka');
const Immutable = require('immutable');
const Temperatures = require('./Temperatures')

const EVENT_TOPIC = 'blub.events';

var block_sending_till_initialised = true;


const globalOptions = {
    'group.id': 'blub',
    'metadata.broker.list': 'nas.snamellit.com:9092',
    'offset_commit_cb': function(err, topicPartitions) {

        if (err) {
            // There was an error committing
            console.error(err);
        }
        else {
            // Commit went through. Let's log the topic partitions
            console.log(topicPartitions);
        }

    },
};

var stream = null;

function getStream() {
    if (stream)
        return stream;

    stream = Kafka.Producer.createWriteStream(
        globalOptions, {}, {
            topic: EVENT_TOPIC
        });

    // NOTE: MAKE SURE TO LISTEN TO THIS IF YOU WANT THE STREAM TO BE DURABLE
    // Otherwise, any error will bubble up as an uncaught exception.
    stream.on('error', function(err) {
        // Here's where we'll know if something went wrong sending to Kafka
        console.error('Error in our kafka stream');
        console.error(err);
        stream = null;
    });

    stream.on('close', function() {
        console.log('stream closed.');
    });

    return stream;
}


function writeMessage(message) {
    
    if (block_sending_till_initialised) {
        return;
    }
    
    // Writes a message to the stream
    var queuedSuccess = getStream().write(Buffer.from(message));

    if (queuedSuccess) {
        console.log('We queued our message!');
    }
    else {
        // Note that this only tells us if the stream's queue is full,
        // it does NOT tell us if the message got to Kafka!  See below...
        console.log('Too many messages in our queue already');
    }
}


var messagesToSkip = 0;
const MESSAGES_BETWEEN_SAVES = 100;

function saveState(store) {
    messagesToSkip -= 1;
    if (messagesToSkip <= 0) {
        messagesToSkip = MESSAGES_BETWEEN_SAVES;
        var message = JSON.stringify({ type: 'SAVE_POINT', payload: store.getState() });
        writeMessage(message);
    }
}

function loadState(createStore) {
    console.log('Kafka - Loading state');
    
    var state = undefined;
    var events = undefined;
    var high = 0
    var low = 0
    var consumer = new Kafka.KafkaConsumer(globalOptions);
    consumer
        .on('ready', function() {
            console.log('Kafka - consumer ready.');
            consumer.subscribe([EVENT_TOPIC]);
            consumer.queryWatermarkOffsets(EVENT_TOPIC, 0, 1000, function(err, offsets) {
                if (err) {
                    console.log('Error qeuerying offsets: ' + err);
                } else {
                    high = offsets.highOffset;
                    low = offsets.lowOffset;
                    var offset = Math.max(low, high - MESSAGES_BETWEEN_SAVES);
                    
                    consumer.assign([{ topic: EVENT_TOPIC, partition: 0,  offset: offset}]);
                    consumer.consume();
                }
            });
        })
        .on('data', function(data) {
            console.log('Message found!  ' + data.value.toString());
            var event = JSON.parse(data.value.toString());
            if (event.type === 'SAVE_POINT') {
                console.log('found savepoint');
                state = Immutable.fromJS(event.payload).toObject();
                events = Immutable.List();
            }
            else if (state) {
                console.log('adding replay event.');
                events = events.push({
                    type: event.type,
                    payload: Immutable.fromJS(event.payload)
                });
            }

            console.log('offset ' + data.offset + '/' + high);
            if (data.offset == high - 1) {
                console.log('reached high watermark : all history caught up');
                consumer.unsubscribe();
            }
        })
        .on('unsubscribed', function() {
            console.log('consumer closed.');
            createStore(state, events);
            block_sending_till_initialised = false;
        });

    consumer.connect();
    console.log('Kafka = consumer connected.');


}

module.exports = {
    writeMessage: writeMessage,
    saveState: saveState,
    loadState: loadState,
};