var Relay = require('./Relay.js');


function updateHeaterRelay(store) {
    var state = store.getState();
    var heater_on = state.pidController
        .map((v, k) => {
            let last = v.get('history').last();
            let active = last.get('is_active');
            let heater = last.get('heater_on')
            console.log(`Check sensor ${k}, active: ${active}, heater: ${heater}`);
            return v.get('history').last();
        })
        .filter(v => v.get('is_active'))
        .some(v => v.get('heater_on'));
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
            return true;
        case 'HEATER_OFF':
            return false;
        default:
            return state;
    }
}

function updateRelay(store) {
    Relay.relay1(store.getState().heater);
}

module.exports = {
    updateHeaterRelay: updateHeaterRelay,
    reducer: reducer,
    updateRelay: updateRelay,
};