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

var app = module.exports = express();
var server = http.createServer(app);
var viewEngine = 'pug'; // modify for your view engine

var env = process.env.NODE_ENV || 'development';

// Configuration
app.set('view engine', viewEngine);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(serveStatic(__dirname + '/public'));

app.get('/', function (req, res) {
  ds1820.readTemperature()
  .then(function(temp) {
    res.render('index', { title: 'Hey', message: 'Hello there!', temperature: temp })
  });
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