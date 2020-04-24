import {strict as assert} from "assert";
import {GetSetEntry, GetSet, readOnly, defaultValue} from "../index.js";

const {handlePropertyChange} = GetSet.prototype;

describe("GetSetEntry", () => {

    describe("#constructor({name, type, value, pattern, hint}, owner)", () => {

        it("Requires at least 1 argument", () => {
            assert.throws(() => {
                new GetSetEntry;
            });
            assert.doesNotThrow(() => {
                new GetSetEntry({});
            });
        });

        it("Throws, if 'type' neither a string, nor a function", () => {
            assert.throws(() => {
                new GetSetEntry({
                    name: "bad-type",
                    type: null
                }, {});
            }, {
                message: "Entry 'bad-type': Cannot define 'type', using null (Null)"
            });
        });

        it("Throws, if 'pattern' neither a regexp, nor a function", () => {
            assert.throws(() => {
                new GetSetEntry({
                    name: "bad-pattern",
                    pattern: null
                }, {});
            }, {
                message: "Entry 'bad-pattern': Cannot define 'pattern', using null (Null)"
            });
        });

    });

    describe("#throw(...message)", () => {

        it("Throws an error", () => {
            assert.throws(() => {
                new GetSetEntry({
                    name: "sorry"
                }, {})
                    .throw("sh*t", "happens");
            }, {
                message: "Entry 'sorry': sh*t happens"
            });
        });

    });

    describe("#matchesTypeOf(value)", () => {

        it("May return true", () => {
            assert.equal(
                new GetSetEntry({}, {}).matchesTypeOf(),
                true
            );
            const entry = new GetSetEntry({
                type: "Number|Null"
            }, {});

            assert.equal(
                entry.matchesTypeOf(0),
                true
            );
            assert.equal(
                entry.matchesTypeOf(null),
                true
            );
        });

        it("May return false", () => {
            const entry = new GetSetEntry({
                type: "Number|Null"
            }, {});

            assert.equal(
                entry.matchesTypeOf("0"),
                false
            );
            assert.equal(
                entry.matchesTypeOf(),
                false
            );
        });

    });

    describe("#matches(value)", () => {

        it("May return true", () => {
            assert.equal(
                new GetSetEntry({}, {}).matches(),
                true
            );
            assert.equal(
                new GetSetEntry({
                    pattern: /^\d+$/
                }, {})
                    .matches(123),
                true
            );
        });

        it("May return false", () => {
            assert.equal(
                new GetSetEntry({
                    pattern: /^\d+$/
                }, {})
                    .matches(-123),
                false
            );
        });

    });

    describe("#update(value)", () => {

        it("Calls owner, if change has occurred", (done) => {
            new GetSetEntry({
                name: "test",
            }, {
                handlePropertyChange(name, oldValue, newValue) {
                    assert.equal(name, "test");
                    assert.equal(oldValue, undefined);
                    assert.equal(newValue, 1);
                    done();
                }
            })
                .update(1);
        });

        it("Merges object, if is node", () => {
            const entry = new GetSetEntry({
                value: new GetSet({
                    keyOne: { value: 1 },
                    keyTwo: { value: 2 }
                }, {
                    handlePropertyChange
                })
            }, {
                handlePropertyChange
            });

            entry.update({ keyOne: 0 });

            assert.equal(entry.value.keyOne, 0);
            assert.equal(entry.value.keyTwo, 2);
        });

        it("Rejects, if read-only", (done) => {
            new GetSetEntry({
                name: "read-only",
                type: readOnly
            }, {
                handlePropertyReject(name, {message}) {
                    assert.equal(
                        message,
                        "Entry 'read-only': Read-only"
                    );
                    done();
                }
            })
                .update(1);
        });

        it("Recognizes default value symbol", () => {
            const entry = new GetSetEntry({
                value: 1
            }, {
                handlePropertyChange
            });

            entry.update(2);
            entry.update(defaultValue);

            assert.equal(entry.value, 1);
        });

        it("Rejects, if #type does not match", (done) => {
            new GetSetEntry({
                name: "number-only",
                type: "Number"
            }, {
                handlePropertyReject(name, reason) {
                    assert.equal(
                        reason.message,
                        "Entry 'number-only': The type pattern (Number) does not match value type (String)"
                    );
                    done();
                }
            })
                .update("1");
        });

        it("Rejects, if #type function returns false", (done) => {
            new GetSetEntry({
                name: "custom-type",
                type: () => false
            }, {
                handlePropertyReject(name, reason) {
                    assert.equal(
                        reason.message,
                        "Entry 'custom-type': The type pattern does not match value type (String)"
                    );
                    done();
                }
            })
                .update("1");
        });

        it("Rejects, if #pattern does not match", (done) => {
            new GetSetEntry({
                name: "positive-integer",
                pattern: /^\d+$/
            }, {
                handlePropertyReject(name, reason) {
                    assert.equal(
                        reason.message,
                        "Entry 'positive-integer': The /^\\d+$/ pattern does not match value -1.5"
                    );
                    done();
                }
            })
                .update(-1.5);

            // new GetSetEntry({
            //     name: "positive-integer",
            //     pattern: /^\d+$/,
            //     hint: "positive integer"
            // }, {
            //     handlePropertyReject(name, reason) {
            //         assert.equal(
            //             reason,
            //             "Entry 'positive-integer': The positive integer pattern does not match value -1.5"
            //         );
            //         done();
            //     }
            // })
            //     .update(-1.5);
        });

        it("Rejects, if #pattern function returns false", (done) => {
            new GetSetEntry({
                name: "custom-pattern",
                pattern: () => false
            }, {
                handlePropertyReject(name, reason) {
                    assert.equal(
                        reason.message,
                        "Entry 'custom-pattern': The custom pattern does not match value -1.5"
                    );
                    done();
                }
            })
                .update(-1.5);
        });

        it("Updates value", () => {
            const entry = new GetSetEntry({
                type: "Number",
                pattern: /^\d+$/
            }, {
                handlePropertyChange
            });
            entry.update(1);
            assert.equal(entry.value, 1);
        });

    });

});
