# Thermostat for BeagleBone Black

This project will make a BBB in a thermostat with a web interface

# Components

## BeagleBone Black

this project uses the Cloud9 tool in the vanilla image.

## DS-18B20 sensor

I used for this project a DS-18B20 sensor. I ordered a couple of waterproof
sensors with a sturdy long cable.

Hooked the output up to P9.12.

This requires some bit of extension to the firmware :

    $ dtc -O dtb -o DS1820-00A0.dtbo -b 0 -@ onewire/DS1820-00A0.dts
    $ sudo cp w1-00A0.dtbo /lib/firmware/

See [Temperature Monitoring with the BBB](http://www.bonebrews.com/temperature-monitoring-with-the-ds18b20-on-a-beaglebone-black/).

To enable the kernel driver, do:

    $ echo DS1820 >/sys/devices/bone_capemgr.9/slots


## 2-Relay Module

I ordered on e-bay a couple of relay boards for the arduino. They have a
darlington to convert a digital output to a current to activate the relay.

It are 5V relay, but they seem to reliably operate with the 3V3 coming from the
pin of the BBB. I might rewire it to use the 5V to save some power dissipation
in the voltage regulator.

The relays are hooked up to P9.14 and P9.16 as I am not planning to use the PWM
outputs at the moment.

# Development

## Runtime and build (2026)

Use Node.js 24 or newer and npm. Install the locked dependencies and build the dashboard:

```sh
npm ci
npm run build
npm test
```

`npm run build` bundles React and Chart.js into `public/bundle.js` and copies
Bootstrap CSS. `npm run make` is an alias; `npm run watch` rebuilds the development
bundle when source files change. The build uses esbuild with React's automatic JSX
transform. The Chart.js time axis uses the date-fns adapter.

Tests use tape and testdouble; failures return a nonzero exit code.
Run `npm audit` to check the installed dependency tree for known vulnerabilities.

The thermostat entry point (`node main.js`) requires BeagleBone hardware and its
board-provided `bonescript` module, which is not installed by this package. Hardware
control must be checked on the target board after upgrading Node.js.

## Immutable JS

We'll use unidirectional data flow which in enforced with immutable js.

Experience shows this keeps chaos in check.

## Redux

Good experience with Redux. Want more of it, this time server-side.

## Redux Thunk

To do the asynchronous processing, but keep the codebase *pure* we immediately
add  the thunk-middleware to evaluate functions in the middleware.

## node-cron

Any non trivial project needs background jobs, and over the years the bar for
being non-trivial gets lower and lower.

Node cron is a simple library using the age-old cron syntax to schedule jobs.

so we can run tasks like

    var cron = require('cron');
    cronJob = cron.job('*/5 * * * *', function() {/* do something */});
    cronJob.start();

to run a function every 5 seconds. Perfect.

# Notes on rejected technologies

## ES6 with Babel

I tried it but it takes too much diskspace and it is too slow so I removed it 
again. So we'll stick with ES5 for the time being.

This breaks my heart... but not as much as having to wait 30s each time I do 
something.

## WebPack

Same story but did not try it, yet. Might reconsider, but for the time being it
is no longer considered.

