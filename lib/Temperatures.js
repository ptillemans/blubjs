// JavaScript File
var logger = require("winston")
var Immutable = require("immutable")



var ADD_TEMPERATURE = "ADD_TEMPERATURE";

var initialState = Immutable.fromJS({
    temperatureList: []
});

var MAX_MEASURES = 12*60*24;

module.exports = {


    maxMeasures: function() { return MAX_MEASURES },
    
    addTemperature: function(temp) {
        return {
            type: ADD_TEMPERATURE,
            temperature: temp
        }
    },
    
    temperatureReducer: function(state, action) {
        if (typeof state === 'undefined') {
            state = initialState;
        }
        
        if (action.type === ADD_TEMPERATURE) {
            state = state.updateIn(['temperatureList'], function(list) {
                return list.take(MAX_MEASURES - 1).push(action.temperature)
            });
        }
        
        return state;
    }

}