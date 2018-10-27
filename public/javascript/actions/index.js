import * as t from '../constants';

export let updateSamplesAction = (data) => ({
    type: t.ADD_SAMPLES,
    payload: data
});

export let updateTargetAction = (target) => ({
    type: t.SET_TARGET,
    payload: target
});

export let updateScheduleAction = (data) => ({
    type: t.SET_SCHEDULE,
    payload: data
})