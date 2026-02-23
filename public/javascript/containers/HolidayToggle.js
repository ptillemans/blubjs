import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {updateHoliday} from '../actions';
/* global fetch */

const HolidayToggle = ({isHoliday, updateTarget}) => (
        <div>
            <label class="switch">
                <input type="checkbox" 
                   value={isHoliday}
                   onChange={toggleHoliday}
                   className="slider round"
                   id="toggleHoliday"/>
                <strong>On Holiday</strong>
            </label>
        </div>
);

HolidayToggle.propTypes = {
  toggleHoliday: PropTypes.func.isRequired,
  target: PropTypes.number.isRequired
};

function toggleHoliday(dispatch, isHoliday) {
    var newHoliday = isHoliday ? 0 : 1;
    fetch('/holiday', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({isHoliday: newHoliday})
    }).then(resp => dispatch(updateHoliday(newHoliday)))
    .catch(err => (console.log('error setting target:' + err)));
}

const mapStateToProps = state => {
  return {
     isHoliday: state.is_holiday
  };
};

const mapDispatchToProps = dispatch => {
  return {
      toggleHoliday: (ev) => toggleHoliday(dispatch, Number(ev.isHoliday.value))
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(HolidayToggle);