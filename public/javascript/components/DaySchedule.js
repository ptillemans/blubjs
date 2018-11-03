import React from 'react';
import R from 'ramda';

const daysOfWeek = [ "Zondag"
                   , "Maandag"
                   , "Dinsdag"
                   , "Woensdag"
                   , "Donderdag"
                   , "Vrijdag"
                   , "Zaterdag"];


const formatTwoDigits = (number) => ("0" + number).slice(-2);

const renderTime = (time) => {
  const mins = (time / 60)>>0;
  const h = formatTwoDigits((mins / 60) >> 0);
  const m = formatTwoDigits(mins % 60);
  return `${h}:${m}`;
};


const renderPoint = (time, temperature) => {
  return (
  <div key={time}>
    <p><b>{renderTime(time)}</b> : {temperature}</p>
  </div>
  );
};

const DaySchedule = (day, schedule) => (
  <div className="daySchedule" key={day}>
    <h3>{daysOfWeek[day]}</h3>
    {R.toPairs(schedule).map(([k, v]) => renderPoint(k, v))}
  </div>
);

export default DaySchedule;
