// JavaScript File
var Immutable = require("immutable");

var ADD_TEMPERATURE = "ADD_TEMPERATURE";

function createAddTemperatureAction(temp, sensor = 'internal') {
  return {
    type: ADD_TEMPERATURE,
    payload: Immutable.fromJS({
      sensor: sensor,
      temp: temp,
      ts: Date.now()
    })
  };
};

function sample(store, samplingFunction) {
  samplingFunction()
    .then(createAddTemperatureAction)
    .then(store.dispatch)
}

function startSampling(store, samplingFunction) {
  console.log("enabling periodic sampling...")
  this.job = setInterval(sample, 60000, store, samplingFunction)
};

function stopSampling() {
  clearInterval(this.job);
};

module.exports = {
  createAddTemperatureAction: createAddTemperatureAction,
  startSampling: startSampling
};
