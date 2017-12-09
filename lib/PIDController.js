var Immutable = require('immutable');

var initialState = Immutable.fromJS({
  heater_on: 0,
  target: 14,
  error: 0,
  difference: 0,
  sum: 0,
  k_p: 0,
  k_d: 0,
  k_i: 0,
})
    
function setTargetTemperature(target) {
  return {
    type: 'SET_TARGET_TEMPERATURE',
    payload: target
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
  if (typeof state === 'undefined') {
    return initialState;
  }
  
  switch (action.type) {
    case 'SET_TARGET_TEMPERATURE': 
      return state.set('target', action.payload);
    case 'ADD_TEMPERATURE':
      var temperature = action.payload.get('temp');
      console.log('Temperature: ' + temperature);
      var last_error = state.get('error');
      var error = temperature - state.get('target');
      return state
        .set('error', error)
        .set('difference', error - last_error)
        .set('sum', updateIntegralTerm(state.get('sum'), error));
    default:
      return state;
  }
}

function controlSignal(state) {
  var p = state.get('error') * state.get('k_p');
  var i = state.get('sum') * state.get('k_i');
  var d = state.get('difference') * state.get('k_d');
  return p + i + d;
}

module.exports = {
  setTargetTemperature: setTargetTemperature,
  pidReducer: pidReducer,
  controlSignal: controlSignal,
}

