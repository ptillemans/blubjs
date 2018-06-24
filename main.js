// *******************************************************
// expressjs template
//
// assumes: npm install express
// defaults to jade engine, install others as needed
//
// assumes these subfolders:
//   public/
//   public/javascripts/
//   public/stylesheets/
//   views/
//
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var errorHandler = require('errorhandler');
var Promise = require('bluebird');

var ds1820 = require("./lib/ds1820");
var Temperatures = require("./lib/Temperatures");
var PIDController = require("./lib/PIDController.js")

ds1820.initDriver();

var app = module.exports = express();
var server = http.createServer(app);
var viewEngine = 'pug'; // modify for your view engine

console.log('express initialized.')
var env = process.env.NODE_ENV || 'development';

var redux = require('redux');


var rootReducer = redux.combineReducers({
  temperature: Temperatures.temperatureReducer,
  pidController: PIDController.pidReducer
});
var store = redux.createStore(rootReducer);

console.log('redux initialized.')

Temperatures.startSampling(store, ds1820.readTemperature);

// Configuration
app.set('view engine', viewEngine);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(serveStatic(__dirname + '/public'));

console.log('app configured.');

app.get('/', function(req, res) {
  var state = store.getState().pidController;
  var sample = state.get('history').last();
  res.render('index', {
    title: 'Blub',
    message: '',
    actual: sample.actual,
    target: sample.target,
  });
});

app.get('/temperature.json', function(req, res) {
  var state = store.getState().pidController;
  var minuteMeasured = function(o) {
    return 60000 * Math.floor(o.get('ts') / 60000);
  };
  var within24h = function(o) {
    var ts = o.get('ts');
    var beginning = Date.now() - 24*60*60*1000;
    return ts > beginning;
  }

  var averageSamples = function(keys) {
    return function(v, k) {
      var cnt = v.count();
      var averages = {};
      var sum = (a, b) => a + b;
      var avg = (key) => v.map((o) => o.get(key))
        .reduce(sum, 0) / cnt;
      var addAvg = (sample, key) => Object.assign(sample, {
        [key]: avg(key)
      });

      return keys.reduce(addAvg, {
        ts: k
      });
    };
  }
  var raw = state.get('history')
  var data = raw
    .filter(within24h)
    .groupBy(minuteMeasured)
    .map(averageSamples(['actual', 'target', 'heater_on', 'error', 'difference', 'sum', 'control']))
    .toArray();

  res.json(data);
});

app.post('/temperature', function(req, res) {
  var data = req.body;
  console.log('post temperature:' + JSON.stringify(data));
  var target = Number(data.target);
  if (target > 4 && target <= 25) {

    store.dispatch(PIDController.createSetTargetAction(data.target))

    var resp = Object.assign(data, {
      accepted: true
    })
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(resp));
  } else {
    res.status(400).send('target should be between 4 and 25 degrees celcius.')
  }
})

console.log('Routes created.');

if ('development' == env) {
  app.use(errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
};

if ('production' == env) {
  app.use(express.errorHandler());
};

app.listen(8000, function() {
  console.log('Ready');
});
// *******************************************************
