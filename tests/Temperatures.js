var Temperatures = require('../lib/Temperatures');
var test = require('tape');
var Immutable = require('immutable');
var redux = require('redux');
var td = require('testdouble');


test('action creator for adding temperatures', function(t) {
  t.plan(3);

  td.replace(Date, "now", () => 1710000000000);

  var expected = 25.0;
  var action = Temperatures.createAddTemperatureAction(expected);
  var actual = action.payload;

  t.equal(action.type, 'ADD_TEMPERATURE');
  t.equal(actual.get('temp'), expected, "Expected given temperature as payload");
  t.equal(actual.get('ts'), Date.now(), "Expected current timestamp on payload");

  td.reset();
});
