var test = require('tape');
var Immutable = require('immutable');
var td = require('testdouble');
var timers = require('testdouble-timers').default;
var pid = require('../lib/PIDController');
var temperature = require('../lib/Temperatures');

timers.use(td);

var TEST_DATE = new Date(2018,5,24,12,0);

var TEST_STATE = Immutable.fromJS({
  internal: {
    history: [{
      ts: 0,
      heater_on: false,
      actual: 20,
      target: 14,
      error: 0,
      difference: 0,
      sum: 0,
      control: 0
    }],
    target: 14,
    k_p: 1.5,
    k_d: 50,
    k_i: 0.25,
  }
});

test('action creator for setting target temperature', function(t) {
  t.plan(3);
  const TARGET_TEMP = 20;

  var action = pid.createSetTargetAction(TARGET_TEMP);
  t.equal(action.type, 'SET_TARGET_TEMPERATURE');
  t.equal(action.payload.get('sensor'), 'internal')
  t.equal(action.payload.get('target'), TARGET_TEMP);
})

test('reduce set initial state', function(t) {
  t.plan(1);

  var actual;

  actual = pid.pidReducer(undefined, {});

  var expected = TEST_STATE;
  t.deepEqual(actual, expected, "expected reducer to initialize state");

});

test('reducer set target when reducing the set target action', function(t) {
  t.plan(1);
  var target = 20;
  var action = pid.createSetTargetAction(target);
  var state = pid.pidReducer(TEST_STATE, action);

  t.equal(state.getIn(['internal', 'target']), target, "Expected target to be updated");
});

test('reducer has zero error, difference, sum in equilibrium ', function(t) {
  t.plan(4);

  var action = temperature.createAddTemperatureAction(TEST_STATE.getIn(['internal', 'target']));
  var state = pid.pidReducer(TEST_STATE, action);
  var last = state.getIn(['internal', 'history']).last();
  console.log('last: ' + JSON.stringify(last));
  t.equal(last.get('error'), 0, 'expected no error signal');
  t.equal(last.get('difference'), 0, 'expected no difference signal');
  t.equal(last.get('sum'), 0, 'expected no sum signal');
  t.equal(last.get('heater_on'), false, 'expected heater to stay off');
});

test('reducer updates pid signals', function(t) {
  t.plan(6);

  var action = temperature.createAddTemperatureAction((TEST_STATE.getIn(['internal', 'target']) - 1));
  var state = pid.pidReducer(TEST_STATE, action);
  var last = state.getIn(['internal', 'history']).last();
  t.equal(last.get('error'), -1, 'expected -1 error signal');
  t.equal(last.get('difference'), -1, 'expected -1 difference signal');
  t.equal(last.get('sum'), -1, 'expected -1 sum signal');

  state = pid.pidReducer(state, action);
  last = state.getIn(['internal', 'history']).last();
  t.equal(last.get('error'), -1, 'expected -1 error signal');
  t.equal(last.get('difference'), -1 - -1, 'expected 0 difference signal');
  t.equal(last.get('sum'), -1 + -1, 'expected -2 sum signal');
});

test('reducer does not integrate when error is too big', function(t) {
  t.plan(3);

  var action = temperature.createAddTemperatureAction((TEST_STATE.getIn(['internal', 'target']) - 6));
  var state = pid.pidReducer(TEST_STATE, action);
  var last = state.getIn(['internal', 'history']).last();
  t.equal(last.get('error'), -6, 'expected -1 error signal');
  t.equal(last.get('difference'), -6 - 0, 'expected -1 difference signal');
  t.equal(last.get('sum'), 0 + 0, 'expected 0 sum signal');
});

test('reducer limits sum when it becomes too big', function(t) {
  t.plan(4);

  var action = temperature.createAddTemperatureAction((TEST_STATE.getIn(['internal', 'target']) - 1));
  var state = pid.pidReducer(TEST_STATE, action);
  var last = () => state.getIn(['internal', 'history']).last();
  t.equal(last().get('sum'), -1 + 0, 'expected 0 sum signal');
  state = pid.pidReducer(state, action);
  state = pid.pidReducer(state, action);
  t.equal(last().get('sum'), -3); 
  state = pid.pidReducer(state, action);
  state = pid.pidReducer(state, action);
  t.equal(last().get('sum'), -5);
  state = pid.pidReducer(state, action);
  state = pid.pidReducer(state, action);
  t.equal(last().get('sum'), -5);
});

test('test control signal', function(t) {
  t.plan(5);

  var state = Immutable.fromJS({
    internal: {
      history: [{
        error: -1, // 20 - 19 - (-1) == 2
        sum: 2, // 20 - 19 + 2 == 3
      }],
      target: 19,
      k_p: 0,
      k_d: 0,
      k_i: 0,
    }
  });

  function getControlAfterUpdate(state) {
    var addTempAction = temperature.createAddTemperatureAction(20);
    var nState = pid.pidReducer(state, addTempAction);
    return nState.getIn(['internal', 'history']).last().get('control');
  }

  t.equal(getControlAfterUpdate(state),
    0, '0 when all k are 0');
  t.equal(getControlAfterUpdate(state.setIn(['internal', 'k_p'], 1)),
    1, 'error when k_p is 1');
  t.equal(getControlAfterUpdate(state.setIn(['internal', 'k_d'], 1)),
    2, 'difference when k_d is 1');
  t.equal(getControlAfterUpdate(state.setIn(['internal', 'k_i'], 1)),
    3, 'sum when k_i is 1');
  t.equal(getControlAfterUpdate(state.setIn(['internal', 'k_p'], 1)
                                     .setIn(['internal', 'k_d'], 1)
                                     .setIn(['internal', 'k_i'], 1)),
                                1 + 2 + 3, 
                                'sum of all when all 1');

});

test('test heater turns on and off', function(t) {
  t.plan(2);
  
  var state = Immutable.fromJS({
    internal: {
      history: [{
        error: 0, // 20 - 19 - (-1) == 2
        sum: 0, // 20 - 19 + 2 == 3
      }],
      target: 20,
      k_p: 1,
      k_d: 0,
      k_i: 0,
    }
  });
  
  var addTempAction = temperature.createAddTemperatureAction(19);
  var nState = pid.pidReducer(state, addTempAction);
  t.ok(nState.getIn(['internal', 'heater_on']), "heater should be on when cold");
 
  addTempAction = temperature.createAddTemperatureAction(21);
  nState = pid.pidReducer(state, addTempAction);
  t.notOk(nState.get(['internal', 'heater_on']), "heater should be off when hot");
});