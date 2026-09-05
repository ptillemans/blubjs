const test = require('tape');
const { createStore, combineReducers } = require('redux');
const { pidReducer } = require('../lib/PIDController');
const { reducer: schedule } = require('../lib/Scheduler');
const { createAddTemperatureAction } = require('../lib/Temperatures');
const { createServer, addRoutes } = require('../lib/app');

test('HTTP routes work with the upgraded Express, Pug and Immutable', async t => {
  const store = createStore(combineReducers({ pidController: pidReducer, schedule }));
  store.dispatch(createAddTemperatureAction(20));
  const app = addRoutes(createServer('public'), store);
  const server = app.listen(0, '127.0.0.1');
  try {
    await new Promise((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    const page = await fetch(base);
    t.equal(page.status, 200, 'dashboard renders');
    t.ok((await page.text()).includes('id="root"'), 'dashboard includes the React mount');
    const samples = await (await fetch(`${base}/temperature.json`)).json();
    t.ok(samples.some(sample => sample.internal === 20), 'temperature history is serialized');
    const days = await (await fetch(`${base}/schedule.json`)).json();
    t.equal(days.length, 7, 'schedule contains seven days');
    const response = await fetch(`${base}/temperature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 21 })
    });
    t.equal(response.status, 200, 'target update accepted');
    t.equal(store.getState().pidController.getIn(['internal', 'target']), 21, 'target reaches the store');
  } catch (error) {
    t.fail(error.stack);
  } finally {
    await new Promise(resolve => server.close(resolve));
    t.end();
  }
});
