import {strict as assert} from "assert";
import {EventEmitter} from "events";
import {GetSet} from "../index.js";

describe("GetSet", () => {

    describe(".extends(Base[, options])", () => {

        it("Returns new GetSet class, that extends base class.", () => {
            const GetSetEmitter = GetSet.extends(EventEmitter);
            assert.equal(
                new GetSetEmitter({}) instanceof EventEmitter,
                true
            );
        });

        it("Recognizes 'seal' option", (done) => {
            const GetSetEmitter = GetSet.extends(EventEmitter, {
                seal: false
            });
            new GetSetEmitter({})
                .on("test", () => done())
                .emit("test");
        });

    });

    describe("#constructor(descriptors)", () => {

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
            const map = new GetSet({
                keyOne: {},
                keyTwo: {}
            });
            assert.deepEqual(Object.keys(map), [
                "keyOne",
                "keyTwo"
            ]);
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
                title: {},
                date: {}
            });

            Object.assign(post, {
                title: "Hello World",
                date: "1970"
            })
                .toDefaults(["title"]);

            assert.equal(post.title, undefined);
            assert.equal(post.date, "1970");
        });

    });

    describe("#toJSON([whitelist])", () => {

        it("Returns plain object", () => {
            assert.deepEqual(
                new GetSet({
                    author: new GetSet({
                        name: {}
                    })
                })
                    .toJSON(),
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
                    title: {},
                    date: {}
                })
                    .toJSON(["title"]),
                {
                    title: undefined
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

    describe("#didChangeProperty(name, oldValue, newValue)", () => {

        it("Bubbles", (done) => {
            class Post extends GetSet {
                constructor() {
                    super({
                        title: {},
                        author: new GetSet({
                            name: {}
                        })
                    });
                }
                didChangeProperty(name) {
                    paths.delete(name);
                    paths.size || done();
                }
            }

            const post = new Post;
            const paths = new Set([
                "title",
                "author.name"
            ]);
            post.title = "";
            post.author.name = "";
        });

    });

    describe("#didRejectProperty(name, reason)", () => {

        it("Bubbles", (done) => {
            class Post extends GetSet {
                constructor() {
                    super({
                        title: { type: "String" },
                        author: new GetSet({
                            name: { type: "String" }
                        })
                    });
                }
                didRejectProperty(name) {
                    paths.delete(name);
                    paths.size || done();
                }
            }
            const post = new Post;
            const paths = new Set([
                "title",
                "author.name"
            ]);
            console.error = () => null;
            post.title = null;
            post.author.name = null;
        });

    });

});
