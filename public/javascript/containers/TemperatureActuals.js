import { connect } from 'react-redux';
import ActualsView from '../components/ActualsView';

const MAX_POINTS = 60;

const mapStateToProps = (state) =>({
  target: state.actuals.target,
  actual: state.actuals.actual,
  heater: state.actuals.heater ? "on" : "off"
});
  
const mapDispatchToProps = dispatch => {
  return { }
}

console.log(Chart)
const TemperatureChart = connect(mapStateToProps,mapDispatchToProps)(ActualsView)

export default TemperatureChart
