import { connect } from 'react-redux';
import Chart from '../components/Chart';

const MAX_POINTS = 60;


function getData(data) {
  console.log('getData');
  console.log(data);
  return {
    labels: data.map(o => new Date(o.ts)),
    datasets:[
      {
        label: 'Temperature',
        data: data.map(o => o.actual.toFixed(2)),
        borderWidth: 1,
        borderColor: 'rgba(0,0,255,1)',
        fill: false
      },
      {
        label: 'Target',
        lineTension: 0,
        data: data.map(o => (o.target || 14.0).toFixed(2)),
        borderWidth: 1,
        borderColor: 'rgba(255,255,0,1)',
        fill: false
      },
      {
        label: 'Heater',
        lineTension: 0,
        data: data.map(o => (o.heater_on * o.target).toFixed(2)),
        borderWidth: 1,
        borderColor: 'rgba(255,0,0,1)',
        backgroundColor: 'rgba(255,0,0,0.2)',
        fill: true
      }
    ]
  }
}

const mapStateToProps = function(state) {
  return ({
  type: "line",
  data: getData(state.samples),
  options: {
    responsive: true,
    scales: {
      xAxes: [{
        type: 'time',
        display: true
      }],
      yAxes: [{
        type: 'linear',
        beginAtZero: true,
        max: 30
      }]
    },
    animation: {
      duration: 0
    }
  }
})
}

const mapDispatchToProps = dispatch => {
  return { }
}

console.log(Chart)
const TemperatureChart = connect(mapStateToProps,mapDispatchToProps)(Chart)

export default TemperatureChart
