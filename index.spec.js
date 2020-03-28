import {strict as assert} from "assert";
import {GetSetEntry, GetSet, defaultValueSymbol} from "./index.js";

describe("GetSetEntry", () => {

    describe("#acceptsTypeOf(value)", () => {

        it("returns true if accepts type of specified value", () => {
            const self = new GetSetEntry("id", "Number");
            assert.equal(self.acceptsTypeOf(0), true);
        });

        it("returns false otherwise", () => {
            const self = new GetSetEntry("id", "Number");
            assert.equal(self.acceptsTypeOf("0"), false);
        });

        it("always returns true if no type pattern was provided", () => {
            const self = new GetSetEntry("id");
            assert.equal(self.acceptsTypeOf("0"), true);
        });
    });

    describe("#accepts(value)", () => {

        it("returns true if accepts specified value", () => {
            const self = new GetSetEntry("id", "Number", 0, "[0-9]+");
            assert.equal(self.accepts(0), true);
        });

        it("returns false otherwise", () => {
            const self = new GetSetEntry("id", "Number", 0, "[0-9]+");
            assert.equal(self.accepts(-1), false);
        });

        it("always returns true if no value pattern was provided", () => {
            const self = new GetSetEntry("id", "Number", 0);
            assert.equal(self.accepts(-1), true);
        });
    });

    describe("#assign(value, didChangeCallback, thisArg)", () => {

        it("assigns value", () => {
            const self = new GetSetEntry("id");
            self.assign(0, () => null);
            assert.equal(self.value, 0);
        });

        it("calls didChangeCallback with name, oldValue, newValue", (done) => {
            const self = new GetSetEntry("id", "Number");
            self.assign(0, (propertyName, oldValue, newValue) => {
                assert.equal(propertyName, "id");
                assert.equal(oldValue, undefined);
                assert.equal(newValue, 0);
                done();
            });
        });

    });

    describe("#reset(didChangeCallback, thisArg)", () => {

        it("resets value to default", () => {
            const self = new GetSetEntry("id", "Number");
            self.value = 0;
            self.reset(() => null);
            assert.equal(self.value, undefined);
        });

        it("calls didChangeCallback with name, oldValue, newValue", (done) => {
            const self = new GetSetEntry("id", "Number");
            self.value = 0;
            self.reset((name, oldValue, newValue) => {
                assert.equal(name, "id");
                assert.equal(oldValue, 0);
                assert.equal(newValue, undefined);
                done();
            });
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
                id: "Number"
            });
            assert.deepEqual(Object.keys(self), ["id"]);
        });
    });

    describe("#resetProperties(whitelist)", () => {

        it("resets properties in whitelist", () => {
            const self = new GetSet({
                id: "Number",
                title: "String",
                date: "String"
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
                id: "Number",
                title: "String",
                date: "String"
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

    describe("#toJSON(whitelist)", () => {

        it("returns properties in whitelist", () => {
            const self = new GetSet({
                id: ["Number", 0],
                title: ["String", "Hello World"],
                date: ["String", "1970"]
            });
            assert.deepEqual(self.toJSON(["title", "date"]), {
                title: "Hello World",
                date: "1970"
            });
        });

        it("returns all properties if whitelist is omitted", () => {
            const self = new GetSet({
                id: ["Number", 0],
                title: ["String", "Hello World"],
                date: ["String", "1970"]
            });
            assert.deepEqual(self.toJSON(), {
                id: 0,
                title: "Hello World",
                date: "1970"
            });
        });
    });

    describe("#didChangeProperty(name, oldValue, newValue)", () => {

        it("is called with proper thisArg", (done) => {
            class Post extends GetSet {
                constructor() {
                    super({
                        id: "Number"
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

    describe("#get()", () => {

        it("throws if there is no corresponding GetSetEntry", () => {
            const self = new GetSet({
                id: ""
            });
            assert.throws(() => self.ID, "entry undefined");
            assert.doesNotThrow(() => self.id, "entry defined");
        });

        it("returns functions as is", () => {
            const self = new GetSet({});
            assert.equal(self.hasOwnProperty, ({}).hasOwnProperty);
        });
    });

    describe("#set(value)", () => {

        it("throws if there is no corresponding GetSetEntry", () => {
            const self = new GetSet({
                id: "Number"
            });
            assert.throws(() => self.ID = 0, "entry undefined");
            assert.doesNotThrow(() => self.id = 0, "entry defined");
        });

        it("throws if value is a function", () => {
            const self = new GetSet({});
            assert.throws(() => self.hasOwnProperty = () => true);
        });

        it("throws if type of value does not match pattern", () => {
            const self = new GetSet({
                id: "Number"
            });
            assert.throws(() => self.id = "0");
        });

        it("throws if value does not match pattern", () => {
            const self = new GetSet({
                id: ["Number", 0, "[0-9]+"]
            });
            assert.throws(() => self.id = -1);
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

    describe("#defineProperty(target, name, descriptor)", () => {

        it("prevents override of GetSetEntry", () => {
            const self = new GetSet({
                id: ["Number", 0, "[0-9]+"]
            });
            assert.throws(() => {
                Object.defineProperty(self, "id", {
                    value: -1
                });
            });
        });
    });

    describe("#getOwnPropertyDescriptor(target, name)", () => {

        it("makes GetSetEntry unreachable", () => {
            const self = new GetSet({
                id: ["Number", 0]
            });
            const {value} = Object.getOwnPropertyDescriptor(self, "id");
            assert.equal(value, 0);
        });
    });
});
