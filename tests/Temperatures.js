var Temperatures = require('../lib/Temperatures');
var test = require('tape');
var Immutable = require('immutable');
var _ = require('lodash');
var redux = require('redux');
var td = require('testdouble');
var timers = require('testdouble-timers').default;

timers.use(td);

test('action creator for adding temperatures', function(t) {
  t.plan(3);

  var clock = td.timers();

  var expected = 25.0;
  var action = Temperatures.addTemperature(expected);
  var actual = action.payload;

  t.equal('ADD_TEMPERATURE', action.type);
  t.equal(actual.get('temp'), expected, "Expected given temperature as payload");
  t.equal(actual.get('ts'), Date.now(), "Expected current timestamp on payload");

  td.reset();
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

  var sample = {temp: 0.0, ts: 0};
  var state = Immutable.fromJS({
    temperatureList: [ sample, sample, sample]
  });

  var expected = 25.0;
  var action = Temperatures.addTemperature(expected);
  var newState = Temperatures.temperatureReducer(state, action);
  var actual = newState.get('temperatureList');
  console.log(actual);
  t.equal(4, actual.count(), "Expected temperatureList to grow");
  t.equal(actual.last().get('temp'), expected, "Expected to have the temperature at the end of the list");

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

test('sample temperature method measure 12 times per minute', function(t) {
  t.plan(12);


  var measureFunction = function() { t.pass(); return Promise.resolve(25.0);  };
  var store = redux.createStore(Temperatures.temperatureReducer);

  var time = Date.now();
  var clock = td.timers();
  clock.tick(time);

  Temperatures.startSampling(store, measureFunction);

  clock.tick(60000);

  td.reset();
});
