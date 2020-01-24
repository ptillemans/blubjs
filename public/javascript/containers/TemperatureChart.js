import { connect } from 'react-redux';
import Chart from '../components/Chart';

const MAX_POINTS = 60;


function getData(data) {
  return {
    labels: data.map(o => new Date(o.ts)),
    datasets:[
      {
        label: 'Badkamer',
        data: data.map(o => o.internal ? o.internal.toFixed(2) : null),
        borderWidth: 1,
        borderColor: 'rgba(0,0,255,1)',
        fill: false
      },
      {
        label: 'Hendrik',
        data: data.map(o => o.hendrik ? o.hendrik.toFixed(2) : null),
        borderWidth: 1,
        borderColor: 'rgba(0,255,255,1)',
        fill: false
      },
      {
        label: 'Target',
        lineTension: 0,
        data: data.map(o => o.target ? o.target.toFixed(2) : 14.00),
        borderWidth: 1,
        borderColor: 'rgba(255,255,0,1)',
        fill: false
      },
      {
        label: 'Heater',
        lineTension: 0,
        data: data.map(o => o.heater_on ? o.target.toFixed(2) : 14.00),
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

const TemperatureChart = connect(mapStateToProps,mapDispatchToProps)(Chart)

export default TemperatureChart
