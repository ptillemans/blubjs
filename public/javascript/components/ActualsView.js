import React from 'react';

const actualsView = ({actual, target, heater}) => (
  <h1 className="row">
    <span className="col-xs-3 label label-warning">
      {target.toFixed(2)} ℃
    </span>
    <span className="col-xs-offset-1 col-xs-4 label label-primary">
      {actual.toFixed(2)} ℃
    </span>
    <span className="col-xs-offset-1 col-xs-3 label label-danger">
      Heater {heater}
    </span>
  </h1>
);

export default actualsView;