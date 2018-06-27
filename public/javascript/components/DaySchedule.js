import React from 'react';
import R from 'ramda';

const daysOfWeek = [ "Zondag"
                   , "Maandag"
                   , "Dinsdag"
                   , "Woensdag"
                   , "Donderdag"
                   , "Vrijdag"
                   , "Zaterdag"];

const renderPoint = (time, temperature) => {
  console.log("renderPoint:", time, temperature);
  return (
  <div key={time}>
    <p><b>{time}</b> : {temperature}</p>
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
