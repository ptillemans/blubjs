var Temperatures = require('../lib/Temperatures');
var test = require('tape');
var Immutable = require('immutable');
var redux = require('redux');
var td = require('testdouble');
var timers = require('testdouble-timers').default;

timers.use(td);

test('action creator for adding temperatures', function(t) {
  t.plan(3);

  var clock = td.timers();

  var expected = 25.0;
  var action = Temperatures.createAddTemperatureAction(expected);
  var actual = action.payload;

  t.equal(action.type, 'ADD_TEMPERATURE');
  t.equal(actual.get('temp'), expected, "Expected given temperature as payload");
  t.equal(actual.get('ts'), Date.now(), "Expected current timestamp on payload");

  td.reset();
});
