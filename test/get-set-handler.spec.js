import {strict as assert} from "assert";
import {GetSet, constant, defaultValueSymbol} from "../index.js";

describe("new GetSetHandler()", () => {

    describe("#get(target, propertyName[, receiver])", () => {

        it("returns entry value", () => {
            assert.equal(
                new GetSet({
                    id: [Number, 0]
                }).id,
                0
            );
        });

        it("returns non-entry as is", () => {
            assert.equal(
                new GetSet({}).id,
                undefined
            );
        });

    });

    describe("#set(target, propertyName, value[, receiver])", () => {

        it("throws if property was not described", () => {
            assert.throws(() => {
                new GetSet({}).id = 0;
            }, {
                message: "Cannot set property 'id'. It was not described"
            });
            assert.doesNotThrow(() => {
                new GetSet({id: ""}).id = 0;
            });
        });


        it("throws if type does not match pattern", () => {
            assert.throws(() => {
                new GetSet({id: "Number"}).id = "0";
            }, {
                message: "Property 'id' should be of type 'Number', but got 'String'"
            });
        });

        it("throws if custom type validator returns false", () => {
            assert.throws(() => {
                new GetSet({id: () => false}).id = "0";
            }, {
                message: "Property 'id' does not accept type of value '0'"
            });
        });

        it("throws if value does not match pattern", () => {
            assert.throws(() => {
                new GetSet({
                    id: ["Number", 0, "[0-9]+", "a positive integer"]
                }).id = -1;
            }, {
                message: "Property 'id' should be a positive integer, but got '-1'"
            });
        });

        it("throws if custom value validator returns false", () => {
            assert.throws(() => {
                new GetSet({
                    id: ["Number", 0, () => false]
                }).id = -1;
            }, {
                message: "Property 'id' does not accept value '-1'"
            });
        });

        it("throws if value cannot be changed", () => {
            assert.throws(() => {
                new GetSet({
                    id: [constant, 1]
                }).id = 0;
            }, {
                message: "Property 'id' is constant"
            });
        });

        it("assigns value ", () => {
            const self = new GetSet({
                id: ["Number", 0, "[0-9]+"]
            });
            self.id = 1;
            assert.equal(self.id, 1);
        });

        it("resets value by defaultValueSymbol", () => {
            const self = new GetSet({
                id: ["Number", 0, "[0-9]+"]
            });
            self.id = 1;
            self.id = defaultValueSymbol;
            assert.equal(self.id, 0);
        });

    });

    describe("#defineProperty(target, propertyName, descriptor)", () => {

        it("prevents override of GetSetEntry", () => {
            const self = new GetSet({
                id: "Number"
            });
            assert.throws(() => {
                Object.defineProperty(self, "id", {
                    value: null
                });
            }, {
                message: "Property 'id' should be of type 'Number', but got 'Null'"
            });
        });

    });

    describe("#getOwnPropertyDescriptor(target, propertyName)", () => {

        it("makes GetSetEntry unreachable", () => {
            const self = new GetSet({
                id: ["Number", 0]
            });
            const {value} = Object.getOwnPropertyDescriptor(self, "id");
            assert.equal(value, 0);
        });

    });

});
