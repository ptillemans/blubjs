var test = require('tape')
var ds1820 = require("../lib/ds1820")

test("read sensor file", function(t) {
    t.plan(2);
    
    ds1820.readTemperatureSensorFile()
        .then(function(content) {
            t.equal(content.trim().split('\n').length, 2 , "temperature file should contain 2 lines");
            t.ok(content.match('t=\\d+'), "temperature file should contain temperature");
        })
        .catch(function(err) {
            t.fail(err);
        });
    
});

test("read temperature and test if about room temperature", function(t) {
    t.plan(2);
    
    ds1820.readTemperature()
    .then(function(temp) {
        t.ok(temp < 25.0, "Temperature should be lower than 25 degrees, but was " + temp);
        t.ok(temp > 15.0, "Temperature should be higher than 15 degrees, but was " + temp);
    })
    .catch(function(err) {
        t.fail(err);
    })
})

