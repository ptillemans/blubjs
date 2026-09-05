import React from 'react';

const actualsView = ({actual, target, heater}) => (
  <h1 className="row">
    <span className="col-3 badge bg-warning text-dark">
      {target.toFixed(2)} ℃
    </span>
    <span className="offset-1 col-4 badge bg-primary">
      {actual.toFixed(2)} ℃
    </span>
    <span className={`offset-1 col-3 badge ${heater === "on" ? "bg-danger" : "bg-primary"}`}>
      Heater {heater}
    </span>
  </h1>
);

export default actualsView;