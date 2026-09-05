import React from 'react';
import {connect} from 'react-redux';
import {updateTargetAction} from '../actions';
/* global fetch */

const TargetSlider = ({target, updateTarget}) => (
        <div>
            <input type="range"
                   min="12" max="25"
                   value={target}
                   onChange={updateTarget}
                   className="slider"
                   id="targetRange"/>
        </div>
);




function updateTarget(dispatch, target) {
    fetch('/temperature', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({target: target})
    }).then(resp => dispatch(updateTargetAction(target)))
    .catch(err => (console.log('error setting target:' + err)));
}

const mapStateToProps = state => {
  return {
    target: state.target
  };
};

const mapDispatchToProps = dispatch => {
  return {
      updateTarget: (ev) => updateTarget(dispatch, Number(ev.target.value))
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(TargetSlider);