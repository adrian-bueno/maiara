
import { describe, it } from 'mocha';
import chai from 'chai';

import { generateConditionFunction } from './condition-parser';



const nluResult: any = {
    "input":"weather in Tokyo",
    "intent":{"name":"sampleGetWeather","probability":0.8210636406327836},
    "slots":[
        {
            "entity":"location",
            "range":{"end":16,"start":11},
            "rawValue":"Tokyo",
            "name":"weatherLocation",
            "value": {
                "kind":"Custom",
                "value":"Tokyo"
            }
        }
    ]
};

const contextVariables = new Map<string, string|number|boolean>();
contextVariables.set("name", "Roberto");



chai.should();

describe('Condition function generator', function() {
    describe('generateConditionFunction()', function() {
        it(`"#accident" is false`, function() {
            const func = generateConditionFunction("#accident");
            func(nluResult, contextVariables).should.be.equal(false);
        })
        it(`"#sampleGetWeather" is true`, function() {
            const func = generateConditionFunction("#sampleGetWeather");
            func(nluResult, contextVariables).should.be.equal(true);
        })
        it(`"#sampleGetWeather && $name === 'Roberto'" is true`, function() {
            const func = generateConditionFunction("#sampleGetWeather && $name === 'Roberto'");
            func(nluResult, contextVariables).should.be.equal(true);
        })
        it(`"$name === 'Peter'" is false`, function() {
            const func = generateConditionFunction("$name === 'Peter'");
            func(nluResult, contextVariables).should.be.equal(false);
        })
        it(`"#sampleGetWeather && $name" is true`, function() {
            const func = generateConditionFunction("#sampleGetWeather && $name");
            func(nluResult, contextVariables).should.be.equal(true);
        })
        it(`"#sampleGetWeather && $name && $age" is false`, function() {
            const func = generateConditionFunction("#sampleGetWeather && $name && $age");
            func(nluResult, contextVariables).should.be.equal(false);
        })
        it(`"@time[start] && #intent && @time[end] || @color" is false`, function() {
            const func = generateConditionFunction("@time[start] && #intent && @time[end] || @color");
            func(nluResult, contextVariables).should.be.equal(false);
        })
        it(`"@location[weatherLocation] == 'Tokyo'" is true`, function() {
            const func = generateConditionFunction("@location[weatherLocation] == 'Tokyo'");
            func(nluResult, contextVariables).should.be.equal(true);
        })
        it(`"@location" is true`, function() {
            const func = generateConditionFunction("@location");
            func(nluResult, contextVariables).should.be.equal(true);
        })
        it(`"@location[weatherLocation]" is true`, function() {
            const func = generateConditionFunction("@location[weatherLocation]");
            func(nluResult, contextVariables).should.be.equal(true);
        })
        it(`"@location == 'Tokyo'" is true`, function() {
            const func = generateConditionFunction("@location == 'Tokyo'");
            func(nluResult, contextVariables).should.be.equal(true);
        })
    });

    // TODO continue

});
