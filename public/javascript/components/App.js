import React from 'react';
import Footer from './Footer';
import TemperatureChart from '../containers/TemperatureChart';
import TargetSlider from '../containers/TargetSlider';
import TemperatureActuals from '../containers/TemperatureActuals';
import Schedule from '../containers/Schedule';

const App = () => (
    <div className="container">
      <div className="row" width="400" height="400">
        <TemperatureChart />
      </div>
      <div className="row">
        <TargetSlider />
      </div>
      <TemperatureActuals />
      <Schedule />
      <Footer />
    </div>
);

export default App;
