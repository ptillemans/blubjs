var Immutable = require('immutable');
var Temperatures = require('./Temperatures');

var initialPidState = Immutable.fromJS({
  history: [{
    ts: 0,
    heater_on: false,
    actual: 20,
    target: 16,
    error: 0,
    difference: 0,
    sum: 0,
    control: 0
  }],
  target: 16,
  // 20181105 : severe overshoot, decr pi, incr d
  k_p: 1.5, // 3, // 5,
  k_d: 48, // 12, //6, // 3,
  k_i: 0.1, // 0.5, //1, // 2,
});

var initialState = Immutable.fromJS({
  internal: initialPidState,
});

function createSetTargetAction(target, sensor = 'internal') {
  return {
    type: 'SET_TARGET_TEMPERATURE',
    payload: Immutable.fromJS({
      sensor: sensor,
      target: target
    }),
  };
}

function updateIntegralTerm(sum, error) {
  if (Math.abs(error) > 2)
    return 0;
  var new_sum = sum + error;
  if (Math.abs(new_sum) > 5)
    return sum;
  return new_sum;
}

function pidReducer(state, action) {
  console.log("pidReducer: " + JSON.stringify(action));
  if (typeof state === 'undefined') {
    return initialState;
  }


  switch (action.type) {
    case 'SET_TARGET_TEMPERATURE':
      var sensor = action.payload.get('sensor', 'internal');
      var pidState = state.get(sensor, initialPidState);
      pidState = pidState.set('target', action.payload.get('target'));
      return state.set(sensor, pidState);
    case 'ADD_TEMPERATURE':
      sensor = action.payload.get('sensor', 'internal');
      pidState = state.get(sensor, initialPidState);
      var temperature = action.payload.get('temp');
      pidState = updateControlSignal(pidState, temperature);
      return state.set(sensor, pidState);
    default:
      return state;
  }
}

function updateControlSignal(state, temperature) {
  var lastState = state.get('history').last();

  var newError = temperature - state.get('target');
  var newDifference = newError - lastState.get("error");
  var newSum = updateIntegralTerm(lastState.get("sum"), newError);

  var p = newError * state.get('k_p');
  var i = newSum * state.get('k_i');
  var d = newDifference * state.get('k_d');
  var control = p + i + d;
  console.log(`control ${control} <- (p: ${p}, i: ${i}, d: ${d})`)

  var newState = Immutable.fromJS({
    'is_active': true,
    'ts': Date.now(),
    'actual': temperature,
    'target': state.get('target'),
    'error': newError,
    'difference': newDifference,
    'sum': newSum,
    'control': control,
    'heater_on': control < 0,
  });

  var history = state.get('history');
  history = averageHistory(history);
  history = history.push(newState);
  
  return state
    .set('heater_on', newState.get('heater_on'))
    .set('history', history);
}


const AVERAGE_PERIOD = 5 * 60 * 1000; // in ms

function averageHistory(raw) {
  var periodMeasured = function(o) {
    return AVERAGE_PERIOD * Math.floor(o.get('ts') / AVERAGE_PERIOD);
  };
  var within24h = function(o) {
    var ts = o.get('ts');
    var beginning = Date.now() - 24 * 60 * 60 * 1000;
    return ts > beginning;
  };

  var averageSamples = function(keys) {
    return function(v, k) {
      var cnt = v.count();
      var sum = (a, b) => a + b;
      var avg = (key) => v.map(o => o.get(key))
        .reduce(sum, 0) / cnt;
      var addAvg = (sample, key) => Object.assign(sample, {
        [key]: avg(key)
      });

      return keys.reduce(addAvg, {
        ts: k,
        is_active: v.some(o => o.get('is_active')),
        heater_on: v.some(o => o.get())
      });
    };
  };
  
  var keys = Immutable.fromJS(['actual', 'target', 'heater_on', 'error', 'difference', 'sum', 'control']);
  return raw
    .filter(within24h)
    .groupBy(periodMeasured)
    .map(averageSamples(keys))
    .map(o => Immutable.fromJS(o))
    .toList();

}

module.exports = {
  createSetTargetAction: createSetTargetAction,
  pidReducer: pidReducer,
  averageHistory: averageHistory,
};
