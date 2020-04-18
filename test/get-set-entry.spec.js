import {strict as assert} from "assert";
import {GetSetEntry, GetSet} from "../index.js";

const {didChangeProperty, willThrow} = GetSet.prototype;

describe("new GetSetEntry({name, type, value, pattern, hint}[, owner])", () => {

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
            })
                .name,
            "id"
        );
    });

    it("Defines #type, if provided type is a string", () => {
        assert.equal(
            new GetSetEntry({
                type: "Number"
            })
                .type,
            "Number"
        );
    });

    it("Defines #matchesTypeOf, if provided type is a function", () => {
        const test = () => true;
        assert.equal(
            new GetSetEntry({
                type: test
            })
                .matchesTypeOf,
            test
        );
    });

    it("Throws, if provided type neither a string, nor a function", () => {
        assert.throws(() => {
            new GetSetEntry({
                type: null
            }, {
                willThrow
            });
        }, {
            message: "Cannot define 'type', using null (Null)"
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

    it("Defines #pattern, if provided pattern is a regexp", () => {
        const value = /[0-9]+/;
        assert.equal(
            new GetSetEntry({
                pattern: value
            })
                .pattern,
            value
        );
    });

    it("Defines #matches, if provided pattern is a function", () => {
        const value = () => true;
        assert.equal(
            new GetSetEntry({
                pattern: value
            })
                .matches,
            value
        );
    });

    it("Throws, if provided pattern neither a regexp, nor a function", () => {
        assert.throws(() => {
            new GetSetEntry({
                pattern: null
            }, {
                willThrow
            });
        }, {
            message: "Cannot define 'pattern', using null (Null)"
        });
    });

    it("Defines #hint", () => {
        assert.equal(
            new GetSetEntry({
                hint: "a some kind"
            })
                .hint,
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
                    pattern: /^[0-9]+/
                })
                    .matches("123"),
                true
            );
        });

        it("Returns false, if #pattern does not match", () => {
            assert.equal(
                new GetSetEntry({
                    pattern: /^[0-9]+/
                })
                    .matches("_123"),
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

    describe("#update(value)", () => {

        it("Updates #value", () => {
            assert.equal(
                new GetSetEntry({}, {didChangeProperty})
                    .update(1)
                    .value,
                1
            );
        });

        it("Calls owner, if a change has occurred", (done) => {
            const owner = {
                didChangeProperty({name, oldValue, newValue}) {
                    assert.equal(this, owner);
                    assert.equal(name, "id");
                    assert.equal(oldValue, undefined);
                    assert.equal(newValue, 1);
                    done();
                }
            };
            new GetSetEntry({
                name: "id"
            }, owner)
                .update(1);
        });

    });

});
