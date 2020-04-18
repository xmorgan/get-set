import {strict as assert} from "assert";
import {GetSetHandler, GetSetEntry, GetSet, readOnly, defaultValue} from "../index.js";

const {willThrow, didChangeProperty} = GetSet.prototype;

describe("new Proxy({}, new GetSetHandler)", () => {

    describe("#get(target, property)", () => {

        it("Returns #value of a GetSetEntry", () => {
            assert.equal(
                new Proxy({
                    id: new GetSetEntry({
                        value: 1
                    })
                }, new GetSetHandler)
                    .id,
                1
            );
        });

        it("Returns regular values", () => {
            assert.equal(
                new Proxy({
                    id: 1
                }, new GetSetHandler)
                    .id,
                1
            );
        });

    });

    describe("#set(target, property, value, receiver)", () => {

        it("Throws, if a property value is not a GetSetEntry", () => {
            assert.throws(() => {
                new Proxy({
                    willThrow
                }, new GetSetHandler)
                    .id = 1;
            }, {
                message: "Cannot set property 'id'. It was not described"
            });
            assert.doesNotThrow(() => {
                new Proxy({
                    id: new GetSetEntry({
                        value: 1
                    })
                }, new GetSetHandler)
                    .id = 1;
            });
        });

        it("Throws, if a property is read-only", () => {
            assert.throws(() => {
                const id = new GetSetEntry({
                    type: readOnly
                });
                new Proxy({
                    willThrow,
                    id
                }, new GetSetHandler)
                    .id = 1;
            }, {
                message: "Cannot set property 'id'. It is read-only"
            });
        });

        it("Throws, if #type does not match", () => {
            assert.throws(() => {
                const id = new GetSetEntry({
                    type: "Number"
                });
                new Proxy({
                    willThrow,
                    id
                }, new GetSetHandler)
                    .id = "1";
            }, {
                message: "Cannot set property 'id'. It does not match type Number"
            });
        });

        it("Throws, if #type function returns false", () => {
            assert.throws(() => {
                const id = new GetSetEntry({
                    type: () => false
                });
                new Proxy({
                    willThrow,
                    id
                }, new GetSetHandler)
                    .id = null;
            }, {
                message: "Cannot set property 'id'. It does not match type pattern"
            });
        });

        it("Throws, if #pattern does not match ", () => {
            assert.throws(() => {
                const id = new GetSetEntry({
                    pattern: /^[0-9]+/
                });
                new Proxy({
                    willThrow,
                    id
                }, new GetSetHandler)
                    .id = "-123";
            }, {
                message: "Cannot set property 'id'. It does not match /^[0-9]+/"
            });
            assert.throws(() => {
                const id = new GetSetEntry({
                    pattern: /^[0-9]+/,
                    hint: "positive integer"
                });
                new Proxy({
                    willThrow,
                    id
                }, new GetSetHandler)
                    .id = "-123";
            }, {
                message: "Cannot set property 'id'. It does not match positive integer"
            });
        });

        it("Throws, if #pattern function returns false", () => {
            assert.throws(() => {
                const id = new GetSetEntry({
                    pattern: () => false
                });
                new Proxy({
                    willThrow,
                    id
                }, new GetSetHandler)
                    .id = null;
            }, {
                message: "Cannot set property 'id'. It does not match pattern"
            });
        });

        it("Updates a property value", () => {
            const id = new GetSetEntry({}, {didChangeProperty});

            const proxy = new Proxy({
                id
            }, new GetSetHandler);

            proxy.id = 1;
            assert.equal(
                proxy.id,
                1
            );
        });

        it("Recognizes default value symbol", () => {
            const id = new GetSetEntry({}, {didChangeProperty});

            const proxy = new Proxy({
                id
            }, new GetSetHandler);

            proxy.id = 1;
            proxy.id = defaultValue;

            assert.equal(
                proxy.id,
                undefined
            );
        });

    });

    describe("#defineProperty(target, property, descriptor)", () => {

        it("Throws, if not enabled", () => {
            assert.throws(() => {
                const proxy = new Proxy({}, new GetSetHandler);
                Object.defineProperty(proxy, "__proto__", {});
            });
            assert.doesNotThrow(() => {
                const proxy = new Proxy({}, new GetSetHandler({defineProperty: true}));
                Object.defineProperty(proxy, "__proto__", {});
            });
        });

    });

    describe("#getOwnPropertyDescriptor(target, property)", () => {

        it("Returns #value of GetSetEntry", () => {
            const proxy = new Proxy({
                id: new GetSetEntry({
                    value: 1
                })
            }, new GetSetHandler);

            assert.equal(
                Object
                    .getOwnPropertyDescriptor(proxy, "id")
                    .value,
                1
            );
        });

    });

});
