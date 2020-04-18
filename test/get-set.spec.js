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
        const post = new GetSet({
            author: new GetSet({
                name: {}
            })
        });
        assert.equal(
            "author" in post,
            true
        );
        assert.equal(
            "name" in post.author,
            true
        );
    });

    it("Defines GetSet entries as read-only", () => {
        const post = new GetSet({
            author: new GetSet({
                name: {}
            })
        });
        assert.throws(() => {
            post.author = null;
        });
        assert.doesNotThrow(() => {
            post.author.name = null;
        });
    });

    describe("#didChangeProperty({name, oldValue, newValue})", () => {

        it("Called with proper arguments", (done) => {
            class Post extends GetSet {
                constructor() {
                    super({
                        author: new GetSet({
                            name: {}
                        })
                    });
                }
                didChangeProperty({name}) {
                    assert.equal(this, post);
                    assert.equal(name, "author.name");
                    done();
                }
            }
            const post = new Post;
            post.author.name = "";
        });

    });

    describe("#willThrow(exception)", () => {

        it("Called in a proxy context", (done) => {
            class Post extends GetSet {
                constructor() {
                    super({
                        id: {
                            type: "Number"
                        }
                    });
                }
                willThrow(exception) {
                    assert.equal(this, post);
                    assert.equal(exception instanceof Error, true);
                    done();
                }
            }
            const post = new Post;
            post.id = "";
        });

    });

    describe("#toDefaults([whitelist])", () => {

        it("Resets properties", () => {
            const post = new GetSet({
                author: new GetSet({
                    name: {}
                })
            });
            post.author.name = "John";
            post.toDefaults();

            assert.equal(
                post.author.name,
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
            }).toDefaults([
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
                    author: new GetSet({
                        name: {}
                    })
                }).toJSON(),
                {
                    author: {
                        name: undefined
                    }
                }
            );
        });

        it("Recognizes whitelist", () => {
            assert.deepEqual(
                new GetSet({
                    id: {},
                    date: {}
                }).toJSON([
                    "id"
                ]),
                {
                    id: undefined
                }
            );
        });

        it("Compatible with JSON.stringify()", () => {
            const post = new GetSet({
                author: new GetSet({
                    name: {
                        value: ""
                    }
                })
            });
            assert.equal(
                JSON.stringify(post),
                '{"author":{"name":""}}'
            );
        });

    });

});
