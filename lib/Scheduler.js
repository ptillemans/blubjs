var Immutable = require('immutable');
var createSetTargetAction = require('./PIDController').createSetTargetAction;

const DEFAULT_SCHEDULE = Immutable.fromJS([
    {25200: 20, 79200: 14},
    {25200: 20, 32400: 14, 57600: 20, 79200: 14},
    {25200: 20, 32400: 14, 57600: 20, 79200: 14},
    {25200: 20, 32400: 14, 57600: 20, 79200: 14},
    {25200: 20, 32400: 14, 57600: 20, 79200: 14},
    {25200: 20, 32400: 14, 57600: 20, 79200: 14},
    {25200: 20, 79200: 14}
]);


function createUpdateSchedule(newSchedule) {
    return {
        type: 'SCHEDULE_UPDATE',
        payload: Immutable.fromJS(newSchedule)
    };
}


function reducer(state, action) {
    if (typeof state === 'undefined') {
        return DEFAULT_SCHEDULE;
    }

    switch (action.type) {
        case 'SCHEDULE_UPDATE':
            return action.payload;
        default:
            return state;
    }
}


function getTargetTemperature(state, dt) {
    let day = dt.getDay();
    let tm = (dt.getHours() * 60 + dt.getMinutes()) * 60 + dt.getSeconds();
    let previousDay = (day) => (day + 7 - 1) % 7;

    let schedule = state.get(day);
    let earlierSchedule = schedule
        .filter((v, k) => (k <= tm));

    console.log('earlier schedule:', JSON.stringify(earlierSchedule))

    let target = earlierSchedule
        .maxBy((v, k) => k);

    if (!target) {
        target = state.get(previousDay(day)).maxBy((v, k) => k)
    }

    return target;
}

// return nil if target has not recently changed
// otherwise the new target temperature
function hasTargetChanged(state, dt) {
    const oldDt = new Date(dt.getTime() - 60000);
    const oldTarget = getTargetTemperature(state, oldDt);
    const newTarget = getTargetTemperature(state, dt);
    if (oldTarget != newTarget)
        return newTarget
    else
        return null

}

function startScheduler(store, samplingFunction) {
    console.log("enabling scheduler...")
    setInterval( function() {
        const changedTarget = hasTargetChanged(store.getState()['schedule'], new Date());
        if (changedTarget)
            store.dispatch(createSetTargetAction(changedTarget))
    }, 30000);

};

module.exports = {
    reducer: reducer,
    createUpdateSchedule: createUpdateSchedule,
    getTargetTemperature: getTargetTemperature,
    hasTargetChanged: hasTargetChanged,
    startScheduler: startScheduler,
    DEFAULT_SCHEDULE: DEFAULT_SCHEDULE
};