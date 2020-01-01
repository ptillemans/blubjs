var ds1820 = require("./lib/ds1820");
var Temperatures = require("./lib/Temperatures");
var PIDController = require("./lib/PIDController");
var Scheduler = require("./lib/Scheduler");
var Heater = require("./lib/Heater");
var Kafka = require("./lib/Kafka");
var Mqtt = require("./lib/Mqtt");
var app = require("./lib/app");
var redux = require('redux');

const kafkaMiddleware = (store) => (next) => (action) => {
  const message = JSON.stringify(action);
  Kafka.writeMessage(message);
  next(action);
};

function createStore(initialState, pendingEvents) {
  var rootReducer = redux.combineReducers({
    temperature: Temperatures.temperatureReducer,
    pidController: PIDController.pidReducer,
    schedule: Scheduler.reducer
  });
  
  var store = redux.createStore(rootReducer,
    initialState, 
    redux.applyMiddleware(kafkaMiddleware)
  );
  
  if (pendingEvents) {
    pendingEvents.forEach(ev => store.dispatch(ev));
  }
  
  store.subscribe(() => Kafka.saveState(store));
  store.subscribe(() => Heater.updateHeaterRelay(store)); 
  
  Mqtt.connect(store, 'nas.snamellit.com');
  Temperatures.startSampling(store, ds1820.readTemperature);
  Scheduler.startScheduler(store);
  
  var server = app.createServer(__dirname + '/public');
  app.addRoutes(server, store);
  app.startServer(server, 8000);

  return store;
}

console.log('Starting...')
Kafka.loadState(createStore);


// *******************************************************
