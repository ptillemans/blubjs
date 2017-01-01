// JavaScript File
var logger = require("winston");
var Immutable = require("immutable");
var CronJob = require('cron').CronJob;

var ADD_TEMPERATURE = "ADD_TEMPERATURE";

var initialState = Immutable.fromJS({
  temperatureList: []
});

var MAX_MEASURES = 12*60*24;




function addTemperature(temp) {
  return {
    type: ADD_TEMPERATURE,
    temperature: temp
  };
};

function temperatureReducer(state, action) {
  if (typeof state === 'undefined') {
    state = initialState;
  }

  if (action) {
    if (action.type === ADD_TEMPERATURE) {
      state = state.updateIn(['temperatureList'], function(list) {
        return list.take(MAX_MEASURES - 1).push(action.temperature);
      });
    }
  }

  return state;
};

function startSampling(state, samplingFunction) {
  this.job = new CronJob('*/5 * * * * *', function() {
    var t = samplingFunction();
    state.dispatch(addTemperature(t));
  });

  this.job.start();
};

function stopSampling() {
  this.job.stop();
};

module.exports = {
  maxMeasures: function() { return MAX_MEASURES; },
  addTemperature: addTemperature,
  temperatureReducer: temperatureReducer,
  startSampling: startSampling
};
