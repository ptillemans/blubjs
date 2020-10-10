import {combineReducers} from 'redux';
import * as t from '../constants';
import R from 'ramda';

// samples reducer
function samples(state = [], action ) {
    if (action.type === t.ADD_SAMPLES) {
        console.log('received new data');
        return action.payload;
    }
    return state;
}

// target reducer
function target(state = 14, action ) {
    switch (action.type) {
      case t.SET_TARGET:
        console.log('received new target: ' + action.payload);
        return action.payload;
      case t.ADD_SAMPLES:
        console.log("target reducer: " + R.last(action.payload));
        const {target} = R.last(action.payload);
        console.log("target reducer: target=" + target);
        return target || state;
      default:
        return state;
    }
}

// actuals reducer
const initialActuals = {
  target: 14,
  actual: 20,
  heater: "off"
};

function actuals(state = initialActuals, action) {
  switch (action.type) {
    case t.SET_TARGET:
      return { ...state, target: action.payload};
    case t.ADD_SAMPLES:
      if (action.payload === []) return state;
      let sample = R.last(R.filter(t => t.internal, action.payload));
      console.log("actuals reducer: " + JSON.stringify(sample));
      const {internal, hendrik, target, heater} = sample;
      return ({ ...state,
        actual: internal,
        hendrik: hendrik,
        target: target,
        heater: heater});
    default:
      return state;
  }
}

// schedule reducer
function schedule(state = [], action) {
  switch (action.type) {
    case t.SET_SCHEDULE:
      return action.payload;
    default:
      return state;
  }
}


var reducers = combineReducers({
  samples,
  target,
  actuals,
  schedule
});

export default reducers;

