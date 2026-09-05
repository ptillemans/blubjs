import $ from 'jquery';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import blubApp from './reducers';
import App from './components/App';
import {updateSamplesAction, updateScheduleAction} from './actions';


let store = createStore(blubApp,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);

function fetchSamples(store) {
  $.getJSON('/temperature.json', function(data) {
    let action = updateSamplesAction(data);
    store.dispatch(action);
  });
}

function fetchSchedule(store) {
  $.getJSON('/schedule.json', (data) => {
    let action = updateScheduleAction(data);
    store.dispatch(action);
  });
}

fetchSamples(store);
fetchSchedule(store);
setInterval(function() {
  console.log('fetching new data');
  fetchSamples(store);
}, 30000);
