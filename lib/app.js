var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var errorHandler = require('errorhandler');

var PIDController = require("./PIDController");
var Scheduler = require("./Scheduler");

var Immutable = require('immutable');
var R = require('ramda');

function createServer(staticPath) {
    var app = express();
    http.createServer(app);
    var viewEngine = 'pug'; // modify for your view engine
    
    // Configuration
    app.set('view engine', viewEngine);
    app.use(serveStatic(staticPath));
    return app;
}


function addRoutes(app, store) {
        
    
    // create application/json parser
    var jsonParser = bodyParser.json();
    
    console.log('app configured.');
    
    app.get('/', function(req, res) {
      var state = store.getState().pidController.get('internal');
      var sample = state.get('history').last();
      res.render('index', {
        title: 'Blub',
        message: '',
        actual: sample.actual,
        target: sample.target,
      });
    });
    
    app.get('/temperature.json', function(req, res) {
      var data = store.getState().pidController
        .map((sensor, sensorName) => Immutable.List(sensor.get('history')
          .map(x => {
            var ts = x.get('ts'); 
            var d = {target: x.get('target'), heater: x.get('heater_on') || 0}; 
            d[sensorName] = x.get('actual'); 
            console.log(sensorName + ": " + ts + " -> " + d);
            return [ts, Immutable.fromJS(d)];
        })))
        .reduce((a, x) => a.concat(x))
        .flatten()
        .flatten()
        .groupBy(x => x[0])
        .map((temps, ts) => temps.reduce((a, v) => a.merge(v[1]), Immutable.Map({ts: ts})))
        .toList();
        
      res.json(data);
    }); 
    
    app.post('/temperature', jsonParser, function(req, res) {
      var data = req.body;
      console.log('post temperature:' + JSON.stringify(data));
      var target = Number(data.target);
      if (target > 4 && target <= 25) {
    
        store.dispatch(PIDController.createSetTargetAction(data.target));
    
        var resp = Object.assign(data, {
          accepted: true
        });
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(resp));
      } else {
        res.status(400).send('target should be between 4 and 25 degrees celcius.');
      }
    });
    
    app.get('/schedule.json', function(req, res) {
      var state = store.getState().schedule;
    
      res.json(state.toArray());
    
    });
    
    app.post('/schedule', jsonParser, function(req, res) {
        const data = req.body;
        console.log('POST schedule: ' + JSON.stringify(data));
        store.dispatch(Scheduler.createUpdateSchedule(data));
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(store.getState()['schedule']));
    });
    
    return app;
    
}

function startServer(app, port) {
    var env = process.env.NODE_ENV || 'development';
    if ('development' == env) {
      app.use(errorHandler({
        dumpExceptions: true,
        showStack: true
      }));
    }
    
    if ('production' == env) {
      app.use(express.errorHandler());
    }
    
    app.listen(port, function() {
      console.log('Ready, listening on port ' + port);
    });
}


module.exports = {
   createServer: createServer,
   addRoutes: addRoutes,
   startServer: startServer,
};