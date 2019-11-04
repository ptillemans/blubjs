// JavaScript File
var Immutable = require("immutable");

var ADD_TEMPERATURE = "ADD_TEMPERATURE";

var initialState = Immutable.fromJS({
  temperatureList: []
});

var MAX_MEASURES = 12 * 60 * 24;


function createAddTemperatureAction(temp) {
  return {
    type: ADD_TEMPERATURE,
    payload: Immutable.fromJS({
      temp: temp,
      ts: Date.now()
    })
  };
};

function temperatureReducer(state, action) {
  if (typeof state === 'undefined') {
    state = initialState;
  }

  if (action) {
    if (action.type === ADD_TEMPERATURE) {
      state = state.updateIn(['temperatureList'], function(list) {
        return list.take(MAX_MEASURES - 1).push(action.payload);
      });
    }
  }

  return state;
};

function startSampling(store, samplingFunction) {
  console.log("enabling periodic sampling...")
  this.job = setInterval(function() {
    samplingFunction()
      .then(createAddTemperatureAction)
      .then(function(data) {
        store.dispatch(data)
      }, 5000);
  });
};

function stopSampling() {
  clearInterval(this.job);
};

module.exports = {
  maxMeasures: function() {
    return MAX_MEASURES;
  },
  createAddTemperatureAction: createAddTemperatureAction,
  temperatureReducer: temperatureReducer,
  startSampling: startSampling
};
