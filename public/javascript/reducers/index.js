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
        const {target} = R.last(action.payload);
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
      const {internal, hendrik, heater} = R.last(R.filter(t => t.internal, action.payload));
      return ({ ...state,
        actual: internal,
        hendrik: hendrik,
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

