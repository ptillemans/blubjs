import $ from 'jquery';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import blubApp from './reducers';
import App from './components/App';
import {updateSamplesAction, updateScheduleAction} from './actions';

// enable jquery for bootstrap helpers
global.$ = global.jQuery = $;

let store = createStore(blubApp);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
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
