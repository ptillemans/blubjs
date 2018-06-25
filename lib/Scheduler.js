var Immutable = require('immutable');

const DEFAULT_SCHEDULE = Immutable.fromJS([
    {25200: 20, 79200: 14},
    {25200: 20, 32400: 14, 57600: 20, 79200:14},
    {25200: 20, 32400: 14, 57600: 20, 79200:14},
    {25200: 20, 32400: 14, 57600: 20, 79200:14},
    {25200: 20, 32400: 14, 57600: 20, 79200:14},
    {25200: 20, 32400: 14, 57600: 20, 79200:14},
    {25200: 20, 79200: 14}
  ]);


function createUpdateSchedule(newSchedule) {
  return {
    type: 'SCHEDULE_UPDATE',
    payload: newSchedule
  };
}


function reducer(state, action) {
  console.log("scheduler: " + JSON.stringify(action));
  console.log("scheduler state: " + state);
  
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
    .filter((v, k) => {
      console.log("v, k:", v, k);
      return (k < tm)});

  console.log('earlier schedule:', JSON.stringify(earlierSchedule))

  let target = earlierSchedule
    .maxBy((v, k) => k);

  if (!target) {
    target = state.get(previousDay(day)).maxBy((v, k) => k)
  }

  return target;
}



module.exports = {
  reducer: reducer,
  createUpdateSchedule: createUpdateSchedule,
  getTargetTemperature: getTargetTemperature,
  DEFAULT_SCHEDULE: DEFAULT_SCHEDULE
};