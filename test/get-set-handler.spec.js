import {strict as assert} from "assert";
import {GetSetHandler, GetSetEntry} from "../index.js";

describe("GetSetHandler", () => {

    describe("#get(target, property)", () => {

        it("May return GetSetEntry value", () => {
            const key = new GetSetEntry({value: 1}, {});
            const proxy = new Proxy({key}, new GetSetHandler);
            assert.equal(proxy.key, 1);
        });

        it("May return custom property value", () => {
            const proxy = new Proxy({key: 1}, new GetSetHandler);
            assert.equal(proxy.key, 1);
        });

    });

    describe("#set(target, property, value)", () => {

        it("May update GetSetEntry value", () => {
            const key = new GetSetEntry({}, {
                handlePropertyChange: () => null
            });
            const proxy = new Proxy({key}, new GetSetHandler);
            proxy.key = 1;
            assert.equal(proxy.key, 1);
            assert.equal(key.value, 1);
        });

        it("May update custom property value", () => {
            const proxy = new Proxy({key: 1}, new GetSetHandler());
            proxy.key = 1;
            assert.equal(proxy.key, 1);
        });

    });

    describe("#getOwnPropertyDescriptor(target, property)", () => {

        it("May return descriptor, containing GetSetEntry value", () => {
            const key = new GetSetEntry({value: 1});
            const proxy = new Proxy({key}, new GetSetHandler);
            assert.deepEqual(
                Object.getOwnPropertyDescriptor(proxy, "key"),
                {
                    configurable: true,
                    enumerable: true,
                    value: 1,
                    writable: false
                }
            );
        });

        it("May return descriptor, containing custom property value", () => {
            const target = Object.defineProperty({}, "key", {value:1});
            const proxy = new Proxy(target, new GetSetHandler);
            assert.deepEqual(
                Object.getOwnPropertyDescriptor(proxy, "key"),
                {
                    configurable: false,
                    enumerable: false,
                    value: 1,
                    writable: false
                }
            );
        });

    });

});
