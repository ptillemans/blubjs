var test = require('tape');
var {fromJS, List} = require('immutable');
var td = require('testdouble');
var scheduler = require('../lib/Scheduler');


const NEW_SCHEDULE = fromJS([
    {21600: 20, 79200: 14},
    {21600: 20, 32400: 14, 57600: 20, 79200:14},
    {21600: 20, 32400: 14, 57600: 20, 79200:14},
    {21600: 20, 32400: 14, 57600: 20, 79200:14},
    {21600: 20, 32400: 14, 57600: 20, 79200:14},
    {21600: 20, 32400: 14, 57600: 20, 79200:14},
    {21600: 20, 79200: 14}
  ]);

test('the scheduler has 7 days on initialization', function(t) {
  t.plan(3);

  let actual = scheduler.reducer(undefined, {});
  let expected = scheduler.DEFAULT_SCHEDULE;

  t.deepEqual(actual, expected, 'expected state to be initialised');
  t.assert(List.isList(actual), 'expected schedule to be a list');
  t.equal(actual.size, 7, 'expected 7 days in schedule');
});

test('the update schedule action contains the new schedule', function(t) {
  t.plan(2);

  let actual = scheduler.createUpdateSchedule(NEW_SCHEDULE);

  t.equal(actual.type, 'SCHEDULE_UPDATE');
  t.deepEqual(actual.payload, NEW_SCHEDULE);
})

test('the schedule can be updated in bulk', function(t) {
  t.plan(1);

  let action = scheduler.createUpdateSchedule(NEW_SCHEDULE);

  let actual = scheduler.reducer(scheduler.DEFAULT_SCHEDULE, action);
  let expected = NEW_SCHEDULE;

  t.deepEqual(actual, expected, 'expected schedule to be updated.');
});

test('the target temperature can be given for sunday morning', function(t) {
  t.plan(1);

  let d = new Date(2018,5,24,9,30); // sunday

  let state = NEW_SCHEDULE;
  let actual = scheduler.getTargetTemperature(state, d);
  let expected = 20;

  t.equal(actual, expected, 'expected to be warm on sunday.');
});

test('the target temperature can be given for sunday late night', function(t) {
  t.plan(1);

  let d = new Date(2018,5,24,23,30); // sunday

  let state = NEW_SCHEDULE;
  let actual = scheduler.getTargetTemperature(state, d);
  let expected = 14;

  t.equal(actual, expected, 'expected to be cold on sunday late night.');
});

test('the target temperature can be given for sunday very early', function(t) {
  t.plan(1);

  let d = new Date(2018,5,24,3,30); // sunday

  let state = NEW_SCHEDULE;
  let actual = scheduler.getTargetTemperature(state, d);
  let expected = 14;

  t.equal(actual, expected, 'expected to be cold on sunday early morning.');
});

test('the target temperature can be given for monday very early', function(t) {
  t.plan(1);

  let d = new Date(2018,5,25,3,30); // monday very early

  let state = NEW_SCHEDULE;
  let actual = scheduler.getTargetTemperature(state, d);
  let expected = 14;

  t.equal(actual, expected, 'expected to be cold on monday early.');
});

test('the target temperature can be given for monday noon', function(t) {
  t.plan(1);

  let d = new Date(2018,5,25,12,00); // monday noon

  let state = NEW_SCHEDULE;
  let actual = scheduler.getTargetTemperature(state, d);
  let expected = 14;

  t.equal(actual, expected, 'expected to be cold on monday noon.');
});

