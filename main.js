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

var ds1820 = require("./lib/ds1820");
var Temperatures = require("./lib/Temperatures");

var app = module.exports = express();
var server = http.createServer(app);
var viewEngine = 'pug'; // modify for your view engine

var env = process.env.NODE_ENV || 'development';

var redux = require('redux');


var rootReducer = redux.combineReducers({
  temperature: Temperatures.temperatureReducer
});
var store = redux.createStore(rootReducer);

if ('development' == env) {
  Temperatures.startSampling(store, function() {
    return Promise.resolve(Math.random()*10 + 15.0); });
} else {
  Temperatures.startSampling(store, ds1820.readTemperature);
};

// Configuration
app.set('view engine', viewEngine);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(serveStatic(__dirname + '/public'));

app.get('/', function (req, res) {
  var state = store.getState().temperature;
  var sample = state.get('temperatureList').last();
  res.render('index', { title: 'Hey', message: 'Hello there!', temperature: sample.get('temp').toFixed(2) });
});

app.get('/temperature.json', function (req, res) {
  var state = store.getState().temperature;
  var minuteMeasured = function(o) {return 60000 * Math.floor(o.get('ts')/60000);};
  var averageSamples = function(v, k) {
    var cnt = v.count();
    var sum = v.map(function(o) {return o.get('temp');})
        .reduce(function(a, v) {return a + v;}, 0);
    return sum/cnt;
  };
  var toSample = function(v, k) {return {ts: k, temp: v};};

  var data = state.get('temperatureList')
      .groupBy(minuteMeasured)
      .map(averageSamples)
      .map(toSample)
      .toArray();

  res.json(data);
});

if ('development' == env) {
  app.use(errorHandler({ dumpExceptions: true, showStack: true }));
};

if ('production' == env) {
  app.use(express.errorHandler());
};

app.listen(8000, function () {
  console.log('Ready');
});
// *******************************************************
