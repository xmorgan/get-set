import {strict as assert} from "assert";
import {GetSet} from "../index.js";

describe("new GetSet(entries)", () => {

    it("Requires 1 argument", () => {
        assert.throws(() => {
            new GetSet();
        }, {
            message: "Required 1 argument"
        });
        assert.doesNotThrow(() => {
            new GetSet({});
        });
    });

    it("Defines properties", () => {
        assert.equal(
            "id" in new GetSet({
                id: null
            }),
            true
        );
    });

    it.skip("Returns proxy", () => {
        // Any chance to test this?
    });

    describe("#throwException(...message)", () => {

        it("Throws an exception", () => {
            assert.throws(() => {
                new GetSet({}).throwException("Hello", "World");
            }, {
                message: "Hello World"
            });
        });

    });

    describe("#resetProperties([whitelist])", () => {

        it("Resets properties", () => {
            const post = new GetSet({
                id: null,
                title: null
            });
            Object.assign(post, {
                id: 1,
                title: "Hello World"
            }).resetProperties();

            assert.equal(
                post.id,
                undefined
            );
            assert.equal(
                post.title,
                undefined
            );
        });

        it("Recognizes whitelist", () => {
            const post = new GetSet({
                id: null,
                title: null
            });
            Object.assign(post, {
                id: 1,
                title: "Hello World"
            }).resetProperties([
                "title"
            ]);
            assert.equal(
                post.id,
                1
            );
            assert.equal(
                post.title,
                undefined
            );
        });

    });

    describe("#toJSON([whitelist])", () => {

        it("Creates plain object", () => {
            assert.deepEqual(
                new GetSet({
                    id: {
                        value: 1
                    },
                    date: {
                        value: "1970"
                    }
                }).toJSON(),
                {
                    id: 1,
                    date: "1970"
                }
            );
        });

        it("Recognizes whitelist", () => {
            assert.deepEqual(
                new GetSet({
                    id: {
                        value: 1
                    },
                    date: {
                        value: "1970"
                    }
                }).toJSON([
                    "id"
                ]),
                {
                    id: 1
                }
            );
        });

        it("Compatible with JSON.stringify()", () => {
            const post = new GetSet({
                id: {
                    value: 1
                },
                date: {
                    value: "1970"
                }
            });
            assert.equal(
                JSON.stringify(post),
                "{\"id\":1,\"date\":\"1970\"}"
            );
        });

    });

});
