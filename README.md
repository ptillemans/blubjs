# Thermostat for BeagleBone Black

This project will make a BBB in a thermostat with a web interface

# Components

## BeagleBone Black

this project uses the Cloud9 tool in the vanilla image.

## DS-18B20 sensor

I used for this project a DS-18B20 sensor. I ordered a couple of waterproof 
sensors with a sturdy long cable.

Hooked the output up to P9.12.

## 2-Relay Module

I ordered on e-bay a couple of relay boards for the arduino. They have a 
darlington to convert a digital output to a current to activate the relay.

It are 5V relay, but they seem to reliably operate with the 3V3 coming from the
pin of the BBB. I might rewire it to use the 5V to save some power dissipation 
in the voltage regulator.

The relays are hooked up to P9.14 and P9.16 as I am not planning to use the PWM 
outputs at the moment.
