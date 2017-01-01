
function updateChart(data) {
  var ctx = document.getElementById("myChart");
  var xs = data.map(function(o) {return new Date(o.ts);}),
      ys = data.map(function(o) {return o.temp.toFixed(2);}),
      ys2 = data.map(function(o) {return o.temp > 20 ? 0 : 30;});

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
        label: 'Ketel',
        data: ys2,
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
            unitStepSize: 5,
            displayFormats: {
              minute: 'h:mm'
            }
          },
          display: true
        }]
      }
    }
  });
}

function fetchJSONFile(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var data = JSON.parse(httpRequest.responseText);
        if (callback) callback(data);
      }
    }
  };
  httpRequest.open('GET', path);
  httpRequest.send();
}

// this requests the file and executes a callback with the parsed result once
//   it is available
fetchJSONFile('/temperature.json', function(data){
  updateChart(data.slice(-60));
});
