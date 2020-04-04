import {strict as assert} from "assert";
import {GetSetEntry, GetSet, defaultValueSymbol} from "./index.js";

describe("GetSetEntry", () => {

    describe("#acceptsTypeOf(value)", () => {

        it("returns true if type matches", () => {
            assert.equal(
                new GetSetEntry("id", Number).acceptsTypeOf(0),
                true
            );
            assert.equal(
                new GetSetEntry("id", "Number").acceptsTypeOf(0),
                true
            );
        });

        it("returns false if type does not match", () => {
            assert.equal(
                new GetSetEntry("id", Number).acceptsTypeOf("0"),
                false
            );
            assert.equal(
                new GetSetEntry("id", "Number").acceptsTypeOf("0"),
                false
            );
        });

        it("always returns true if no type was provided", () => {
            assert.equal(
                new GetSetEntry("id").acceptsTypeOf("0"),
                true
            );
        });
    });

    describe("#accepts(value)", () => {

        it("returns true if value matches", () => {
            assert.equal(
                new GetSetEntry("id", Number, 0, "[0-9]+").accepts(0),
                true
            );
        });

        it("returns false if value does not match", () => {
            assert.equal(
                new GetSetEntry("id", Number, 0, "[0-9]+").accepts(-1),
                false
            );
        });

        it("always returns true if no value pattern was provided", () => {
            assert.equal(
                new GetSetEntry("id").accepts(-1),
                true
            );
        });
    });

    describe("#assign(value, callback[, context])", () => {

        it("assigns value", () => {
            assert.equal(
                new GetSetEntry("id")
                    .assign(0, () => null)
                    .value,
                0
            );
        });

        it("calls back with propertyName, oldValue, newValue", (done) => {
            new GetSetEntry("id")
                .assign(0, (name, oldValue, newValue) => {
                    assert.equal(name, "id");
                    assert.equal(oldValue, undefined);
                    assert.equal(newValue, 0);
                    done();
                });
        });

        it("respects 'context'", (done) => {
            const context = {
                callback() {
                    assert.equal(this, context);
                    done();
                }
            };
            new GetSetEntry("id")
                .assign(0, context.callback, context);
        });
    });

    describe("#reset(callback[, context])", () => {

        it("resets value to default", () => {
            assert.equal(
                new GetSetEntry("id")
                    .assign(0, () => null)
                    .reset(() => null)
                    .value,
                undefined
            );
        });

        it("calls back with propertyName, oldValue, newValue", (done) => {
            new GetSetEntry("id")
                .assign(0, () => null)
                .reset((name, oldValue, newValue) => {
                    assert.equal(name, "id");
                    assert.equal(oldValue, 0);
                    assert.equal(newValue, undefined);
                    done();
                });
        });

        it("respects 'context'", (done) => {
            const context = {
                callback() {
                    assert.equal(this, context);
                    done();
                }
            };
            new GetSetEntry("id")
                .assign(0, () => null)
                .reset(context.callback, context);
        });
    });
});

describe("GetSet", () => {

    describe("#constructor()", () => {

        it("requires 1 argument", () => {
            assert.throws(() => new GetSet);
        });

        it("defines own properties", () => {
            const self = new GetSet({
                id: Number
            });
            assert.deepEqual(Object.keys(self), ["id"]);
        });
    });

    describe("#resetProperties([whitelist])", () => {

        it("resets properties in whitelist", () => {
            const self = new GetSet({
                id: Number,
                title: String,
                date: String
            });
            Object.assign(self, {
                id: 0,
                title: "Hello World",
                date: "1970"
            });
            self.resetProperties([
                "title",
                "date"
            ]);
            assert.equal(self.id, 0);
            assert.equal(self.title, undefined);
            assert.equal(self.date, undefined);
        });

        it("resets all properties if whitelist is omitted", () => {
            const self = new GetSet({
                id: Number,
                title: String,
                date: String
            });
            Object.assign(self, {
                id: 0,
                title: "Hello World",
                date: "1970"
            });
            self.resetProperties();
            assert.equal(self.id, undefined);
            assert.equal(self.title, undefined);
            assert.equal(self.date, undefined);
        });
    });

    describe("#toJSON([whitelist])", () => {

        it("returns plain object", () => {
            const self = new GetSet({
                id: [Number, 0]
            });
            assert.deepEqual(self.toJSON(), {
                id: 0
            });
        });

        it("respects whitelist", () => {
            const self = new GetSet({
                id: [Number, 0],
                date: [String, "1970"]
            });
            assert.deepEqual(self.toJSON(["id"]), {
                id: 0
            });
        });

        it("plays nice with JSON.stringify()", () => {
            const self = new GetSet({
                id: [Number, 0],
                callback: [Function, () => null]
            });
            assert.equal(JSON.stringify(self), "{\"id\":0}");
        });
    });

    describe("#didChangeProperty(name, oldValue, newValue)", () => {

        it("is called in proper context", (done) => {
            class Post extends GetSet {
                constructor() {
                    super({
                        id: Number
                    });
                }
                didChangeProperty() {
                    assert.equal(this, post);
                    done();
                }
            }
            const post = new Post();
            post.id = 1;
        });
    });
});

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
