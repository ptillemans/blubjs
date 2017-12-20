/* global $ R Chart */
const MAX_POINTS = 60

function createChart(data) {
  var ctx = document.getElementById("myChart");
  var xs = data.map(function(o) {
      return new Date(o.ts);
    }),
    ys = data.map(function(o) {
      return o.actual.toFixed(2);
    }),
    ys2 = data.map(function(o) {
      return o.target.toFixed(2)
    }),
    ys3 = data.map(function(o) {
      return (o.heater_on * o.target).toFixed(2);
    });

  console.log(data[0]);
  console.log(xs);
  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: xs,
      datasets: [{
        label: 'Temperature',
        data: ys,
        borderWidth: 1,
        borderColor: 'rgba(0,0,255,1)',
        fill: false
      }, {
        label: 'Doel',
        lineTension: 0,
        data: ys2,
        borderWidth: 1,
        borderColor: 'rgba(255,0,0,1)',
        fill: false
      }, {
        label: 'Ketel',
        lineTension: 0,
        data: ys3,
        borderWidth: 1,
        borderColor: 'rgba(255,0,0,0.2)',
        backgroundColor: 'rgba(255,0,0,0.2)'
      }]
    },
    options: {
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit: 'minute',
            unitStepSize: 10,
            displayFormats: {
              minute: 'h:mm'
            }
          },
          display: true
        }]
      }
    }
  });
  return myChart;
}

function updatePoints(chart, o) {

  if (chart.data.labels.length > MAX_POINTS) {
    chart.data.labels.pop();
    chart.data.datasets.forEach(ds => ds.data.pop());
  }
  chart.data.labels.push(o.ts);
  chart.data.datasets[0].data.push(o.actual);
  chart.data.datasets[1].data.push(o.target);
  chart.data.datasets[2].data.push(o.heater_on ? o.target * o.heater_on : 0);
}

function updateChart(chart, data, ts) {
  data.filter(o => o.ts > ts)
    .forEach(o => updatePoints(chart, o))
  chart.update();
}

function updateLabels(sample) {
  $('#actual').html(sample.actual);
  $('#target').html(sample.target);
  $('#targetRange').val(Number(sample.target));
}

function refreshChart() {
  // this requests the file and executes a callback with the parsed result once
  //   it is available
  var lastTs = null;
  var chart;
  $.getJSON('/temperature.json', function(data) {
    chart = createChart(data);
    lastTs = R.last(data).ts;
    updateLabels(R.last(data))
    setInterval(function() {
      $.getJSON('/temperature.json', function(data) {
        console.log('refresh chart.')
        updateChart(chart, data, lastTs);
        lastTs = R.last(data).ts;
        updateLabels(R.last(data))
      });
    }, 30000);
  });
}

refreshChart();
