var Immutable = require('immutable');
var Temperatures = require('./Temperatures')

var initialState = Immutable.fromJS({
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
  // 20181105 : severe overshoot, decr pi, incr d
  k_p: 1.5, // 3, // 5,
  k_d: 12, //6, // 3,
  k_i: 0.5, //1, // 2,
})

function createSetTargetAction(target) {
  return {
    type: 'SET_TARGET_TEMPERATURE',
    payload: Number(target)
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
  console.log("pidReducer: " + JSON.stringify(action))
  if (typeof state === 'undefined') {
    return initialState;
  }

  switch (action.type) {
    case 'SET_TARGET_TEMPERATURE':
      return state.set('target', action.payload);
    case 'ADD_TEMPERATURE':
      var temperature = action.payload.get('temp');
      return updateControlSignal(state, temperature);
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

  var newState = Immutable.fromJS({
    'ts': Date.now(),
    'actual': temperature,
    'target': state.get('target'),
    'error': newError,
    'difference': newDifference,
    'sum': newSum,
    'control': control,
    'heater_on': control < 0
  });

  return state
    .set('heater_on', newState.get('heater_on'))
    .updateIn(['history'], list =>
      list.take(Temperatures.maxMeasures() - 1).push(newState));
}

module.exports = {
  createSetTargetAction: createSetTargetAction,
  pidReducer: pidReducer,
}
