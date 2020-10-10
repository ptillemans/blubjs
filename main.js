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
    pidController: PIDController.pidReducer,
    schedule: Scheduler.reducer,
    heater: Heater.reducer,
  });
  
  var store = redux.createStore(rootReducer,
    initialState, 
    redux.applyMiddleware(kafkaMiddleware)
  );
  console.log("redux store online.");
  
  if (pendingEvents) {
    console.log("applying saved events");
    pendingEvents.forEach(ev => store.dispatch(ev));
  }
  console.log("state ready.");
  
  store.subscribe(() => Kafka.saveState(store));
  store.subscribe(() => Heater.updateHeaterRelay(store));
  store.subscribe(() => Heater.updateRelay(store)); 
  console.log("store suscriptions registered.")
  
  Mqtt.connect(store, 'nas.snamellit.com');
  console.log("Mqtt coneected");
  
  Temperatures.startSampling(store, ds1820.readTemperature);
  Scheduler.startScheduler(store);
  console.log("Temperature sampling active.");
  
  var server = app.createServer(__dirname + '/public');
  app.addRoutes(server, store);
  app.startServer(server, 8000);
  console.log("Server started");

  return store;
}

console.log('Starting...');
Kafka.loadState(createStore);


// *******************************************************
