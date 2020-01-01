var Relay = require('./Relay.js');


function updateHeaterRelay(store) {
    var state = store.getState();
    var heater_on = state.pidController
        .filter((v, k) => v.get('is_active'))
        .some((v, k) => v.get('history').last().get('control') < 0);
    console.log(`heater: ${heater_on}`);
    var heater = state.heater;
    if (heater_on && !heater) {
        store.dispatch({type: 'HEATER_ON', payload: null});
    } else if (!heater_on && heater) {
        store.dispatch({type: 'HEATER_OFF', payload: null});
    }
}


function reducer(state, action) {
    if (typeof state === 'undefined') {
        Relay.relay1(false);
        return false;
    }

    switch (action.type) {
        case 'HEATER_ON':
            Relay.relay1(true);
            return true;
        case 'HEATER_OFF':
            Relay.relay1(false);
            return false;
        default:
            return state;
    }
}

module.exports = {
    updateHeaterRelay: updateHeaterRelay,
    reducer: reducer,
};