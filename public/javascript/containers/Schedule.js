import React from 'react';
import R from 'ramda';
import {connect} from 'react-redux';
import DaySchedule from '../components/DaySchedule';



const mapIndexed = R.addIndex(R.map);

const renderDay = (daySchedule, day) => {
  console.log("renderDay", day, "-->", daySchedule);
  return DaySchedule(day, daySchedule);
};

const renderSchedule = mapIndexed(renderDay);

const Schedule = ({schedule}) => {
  console.log("schedule data: ", JSON.stringify(schedule));
  //const s = schedule["schedule"];
  //console.log("schedule: ", JSON.stringify(s));
  return (
  <div className="schedule">
    {mapIndexed(renderDay,schedule)}
  </div>
)};

const mapStateToProps = state => ({
  schedule: state.schedule
});

const mapDispatchToProps = dispatch => ({
  updateSchedule: (ev) => console.log(dispatch, Number(ev.target.value))
});


export default connect(mapStateToProps,mapDispatchToProps)(Schedule);