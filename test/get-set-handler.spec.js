import {strict as assert} from "assert";
import {GetSetHandler, GetSetEntry} from "../index.js";

describe("GetSetHandler", () => {

    describe("#get(target, property)", () => {

        it("May return value of GetSetEntry", () => {
            assert.equal(
                new Proxy({
                    key: new GetSetEntry({
                        value: 1
                    }, {})
                }, new GetSetHandler)
                    .key,
                1
            );
        });

        it("May return any other value, that is not GetSetEntry", () => {
            assert.equal(
                new Proxy({
                    key: 1
                }, new GetSetHandler)
                    .key,
                1
            );
        });

    });

    describe("#set(target, property, value, receiver)", () => {

        it("Throws, if property does not point to GetSetEntry", () => {
            assert.throws(() => {
                new Proxy({}, new GetSetHandler).key = 1;
            });
        });
        it("Does not throws, if 'seal' disabled", () => {
            assert.doesNotThrow(() => {
                new Proxy({}, new GetSetHandler({ seal: false })).key = 1;
            });
        });
    });

    describe("#getOwnPropertyDescriptor(target, property)", () => {

        it("Returns value of GetSetEntry", () => {
            const proxy = new Proxy({
                key: new GetSetEntry({
                    value: 1
                }, {})
            }, new GetSetHandler);

            assert.equal(
                Object
                    .getOwnPropertyDescriptor(proxy, "key")
                    .value,
                1
            );
        });

    });

    describe("#defineProperty(target, property, descriptor)", () => {

        it("Throws", () => {
            assert.throws(() => {
                const proxy = new Proxy({}, new GetSetHandler);
                Object.defineProperty(proxy, "key", {});
            });

        });

    });

    describe("#deleteProperty(target, property)", () => {

        it("Throws", () => {
            assert.throws(() => {
                const proxy = new Proxy({
                    key: new GetSetEntry({
                        value: 1
                    })
                }, new GetSetHandler);
                delete proxy.key;
            });
        });

    });

});
