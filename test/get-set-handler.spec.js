import {strict as assert} from "assert";
import {GetSet} from "../lib/get-set.js";
import {defaultValueSymbol} from "../lib/get-set-handler.js";

describe("GetSetHandler", () => {

    describe("#get(target, propertyName[, receiver])", () => {

        it("throws if there is no corresponding GetSetEntry", () => {
            const self = new GetSet({
                id: Number
            });
            assert.throws(() => self.ID, {
                message: "Cannot get property 'ID'. Entry was not defined"
            });
            assert.doesNotThrow(() => self.id);
        });

        it("returns functions as is", () => {
            assert.equal(
                new GetSet({}).hasOwnProperty,
                ({}).hasOwnProperty
            );
        });

    });

    describe("#set(target, propertyName, value[, receiver])", () => {

        it("throws if there is no GetSetEntry", () => {
            const self = new GetSet({
                id: Number
            });
            assert.throws(() => self.ID = 0, {
                message: "Cannot set property 'ID'. Entry was not defined"
            });
            assert.doesNotThrow(() => self.id = 0);
        });

        it("throws if type does not match", () => {
            assert.throws(() => {
                new GetSet({id: Number}).id = "0";
            }, {
                message: "Property 'id' should be of type 'Number', but got 'String'"
            });
            assert.throws(() => {
                new GetSet({id: "Number"}).id = "0";
            }, {
                message: "Property 'id' should be of type 'Number', but got 'String'"
            });
        });

        it("throws if value does not match", () => {
            assert.throws(() => {
                new GetSet({
                    id: [Number, 0, "[0-9]+", "a positive integer"]
                }).id = -1;
            }, {
                message: "Property 'id' should be a positive integer, but got '-1'"
            });
        });

        it("assigns value ", () => {
            const self = new GetSet({
                id: [Number, 0, "[0-9]+"]
            });
            self.id = 1;
            assert.equal(self.id, 1);
        });

        it("resets value by defaultValueSymbol", () => {
            const self = new GetSet({
                id: [Number, 0, "[0-9]+"]
            });
            self.id = 1;
            self.id = defaultValueSymbol;
            assert.equal(self.id, 0);
        });

    });

    describe("#defineProperty(target, propertyName, descriptor)", () => {

        it("prevents override of GetSetEntry", () => {
            const self = new GetSet({
                id: [Number, 0, "[0-9]+"]
            });
            assert.throws(() => {
                Object.defineProperty(self, "id", {
                    value: -1
                });
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
