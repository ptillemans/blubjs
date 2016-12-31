var Temperatures = require('../lib/Temperatures');
var test = require('tape');
var Immutable = require('immutable');
var _ = require('lodash');

test('action creator for adding temperatures', function(t) {
    t.plan(2);
    
    var expected = 25.0;
    var action = Temperatures.addTemperature(expected);
    var actual = action.temperature;
    
    t.equal('ADD_TEMPERATURE', action.type);
    t.equal(actual, expected, "Expected given temperature as payload");
});

test('reducer returns initialstate at first', function(t) {
    t.plan(1);
    
    var state = Temperatures.temperatureReducer(undefined, {});
    var actual = state.get('temperatureList');
    var expected = Immutable.List([]);
    t.equal(actual, expected, "state should be initialized when no state is passed");
    
});

test('reducer adds temperature to back of list', function(t) {
    t.plan(2);
    
    var state = Immutable.fromJS({
        temperatureList: [0.0, 0.0, 0.0]
    })
    
    var expected = 25.0;
    var action = Temperatures.addTemperature(expected);
    var newState = Temperatures.temperatureReducer(state, action);
    var actual = newState.get('temperatureList');
    
    t.equal(4, actual.count(), "Expected temperatureList to grow");
    t.equal(actual.last(), expected, "Expected to have the temperature added at the end of the list");
    
});


test('reducer only keeps 24h worth of temperatures', function(t) {
    t.plan(1);
    
    var nPoints = Temperatures.maxMeasures();
    
    var state = undefined;
    
    var readings = _.times(nPoints + 1, _.constant(20.0) );
    var actual = _(readings)
        .map(Temperatures.addTemperature)
        .reduce(Temperatures.temperatureReducer, state);

    t.equal(actual.get('temperatureList').count(), nPoints);
});
