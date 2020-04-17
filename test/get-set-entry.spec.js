import {strict as assert} from "assert";
import {GetSetEntry} from "../index.js";

describe("new GetSetEntry({name, type, value, pattern, hint})", () => {

    it("Requires 1 argument", () => {
        assert.throws(() => {
            new GetSetEntry;
        });
        assert.doesNotThrow(() => {
            new GetSetEntry({});
        });
    });

    it("Defines #name", () => {
        assert.equal(
            new GetSetEntry({
                name: "id"
            }).name,
            "id"
        );
    });

    it("Defines #type, if provided type is a string", () => {
        assert.equal(
            new GetSetEntry({
                type: "Number"
            }).type,
            "Number"
        );
    });

    it("Defines #matchesTypeOf, if provided type is a function", () => {
        const test = () => true;
        assert.equal(
            new GetSetEntry({
                type: test
            }).matchesTypeOf,
            test
        );
    });

    it("Throws, if provided type neither a string, nor a function", () => {
        assert.throws(() => {
            new GetSetEntry({
                type: null
            });
        }, {
            message: "Cannot define type, using null"
        });
    });

    it("Defines #value and #defaultValue", () => {
        const entry = new GetSetEntry({
            value: 1
        });
        assert.equal(
            entry.value,
            1
        );
        assert.equal(
            entry.defaultValue,
            1
        );
    });

    it("Defines #pattern, if provided pattern is a string", () => {
        assert.equal(
            new GetSetEntry({
                pattern: "[0-9]+"
            }).pattern,
            "[0-9]+"
        );
    });

    it("Defines #matches, if provided pattern is a function", () => {
        const test = () => true;
        assert.equal(
            new GetSetEntry({
                pattern: test
            }).matches,
            test
        );
    });

    it("Throws, if provided pattern neither a string, nor a function", () => {
        assert.throws(() => {
            new GetSetEntry({
                pattern: null
            });
        }, {
            message: "Cannot define pattern, using null"
        });
    });

    it("Defines #hint", () => {
        assert.equal(
            new GetSetEntry({
                hint: "a some kind"
            }).hint,
            "a some kind"
        );
    });

    describe("#matchesTypeOf(value)", () => {

        it("Returns true, if #type matches", () => {
            const entry = new GetSetEntry({
                type: "Number|Null"
            });
            assert.equal(
                entry.matchesTypeOf(0),
                true
            );
            assert.equal(
                entry.matchesTypeOf(null),
                true
            );
        });

        it("Returns false, if #type does not match", () => {
            const entry = new GetSetEntry({
                type: "Number|Null"
            });
            assert.equal(
                entry.matchesTypeOf("0"),
                false
            );
            assert.equal(
                entry.matchesTypeOf(),
                false
            );
        });

        it("Always returns true, if #type undefined", () => {
            assert.equal(
                new GetSetEntry({}).matchesTypeOf(),
                true
            );
        });

    });

    describe("#matches(value)", () => {

        it("Returns true, if #pattern matches", () => {
            assert.equal(
                new GetSetEntry({
                    pattern: "[0-9]+"
                }).matches("123"),
                true
            );
        });

        it("Returns false, if #pattern does not match", () => {
            assert.equal(
                new GetSetEntry({
                    pattern: "[0-9]+"
                }).matches("_123_"),
                false
            );
        });

        it("Always returns true, if #pattern undefined", () => {
            assert.equal(
                new GetSetEntry({}).matches(),
                true
            );
        });

    });

    describe("#update(value, callback[, context])", () => {

        it("Updates #value", () => {
            assert.equal(
                new GetSetEntry({})
                    .update(1, () => null)
                    .value,
                1
            );
        });

        it("Calls back, if a change has occurred", (done) => {
            const context = {
                callback(name, newValue, oldValue) {
                    assert.equal(this, context);
                    assert.equal(name, "id");
                    assert.equal(newValue, 1);
                    assert.equal(oldValue, undefined);
                    done();
                }
            };
            new GetSetEntry({
                name: "id"
            }).update(1, context.callback, context);
        });

    });

});
