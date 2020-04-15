import {strict as assert} from "assert";
import {GetSet} from "../index.js";

describe("new GetSet(entries)", () => {

    it("requires 1 argument", () => {
        assert.throws(() => {
            new GetSet();
        }, {
            message: "Required 1 argument"
        });
        assert.doesNotThrow(() => {
            new GetSet({});
        });
    });

    it("defines own properties", () => {
        const self = new GetSet({
            id: "Number"
        });
        assert.deepEqual(Object.keys(self), ["id"]);
    });

    describe("#toJSON([whitelist])", () => {

        it("returns plain object", () => {
            const self = new GetSet({
                id: ["Number", 0]
            });
            assert.deepEqual(self.toJSON(), {
                id: 0
            });
        });

        it("respects whitelist", () => {
            const self = new GetSet({
                id: ["Number", 0],
                date: ["String", "1970"]
            });
            assert.deepEqual(self.toJSON(["id"]), {
                id: 0
            });
        });

        it("plays nice with JSON.stringify()", () => {
            const self = new GetSet({
                id: ["Number", 0],
                callback: ["Function", () => null]
            });
            assert.equal(JSON.stringify(self), "{\"id\":0}");
        });

    });

    describe("#resetProperties([whitelist])", () => {

        it("resets properties in whitelist", () => {
            const self = new GetSet({
                id: "Number",
                title: "String"
            });
            Object.assign(self, {
                id: 0,
                title: "Hello World"
            });
            self.resetProperties([
                "title"
            ]);
            assert.deepEqual(self.toJSON(), {
                id: 0,
                title: undefined
            });
        });

        it("resets all properties if whitelist is omitted", () => {
            const self = new GetSet({
                id: "Number",
                title: "String"
            });
            Object.assign(self, {
                id: 0,
                title: "Hello World"
            });
            self.resetProperties();
            assert.deepEqual(self.toJSON(), {
                id: undefined,
                title: undefined
            });
        });

    });

    describe("#didChangeProperty(name, oldValue, newValue)", () => {

        it("is called in proper context", (done) => {
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
