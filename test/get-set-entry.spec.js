import {strict as assert} from "assert";
import {GetSetEntry} from "../index.js";

describe("new GetSetEntry(name, ...rest)", () => {

    describe("#acceptsTypeOf(value)", () => {

        it("returns true if type matches", () => {
            assert.equal(
                new GetSetEntry("id", "Number").acceptsTypeOf(0),
                true
            );
        });

        it("returns false if type does not match", () => {
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

        it("utilizes custom type validator", () => {
            assert.equal(
                new GetSetEntry("id", () => true).acceptsTypeOf(0),
                true
            );
            assert.equal(
                new GetSetEntry("id", () => false).acceptsTypeOf(0),
                false
            );
        });

    });

    describe("#accepts(value)", () => {

        it("returns true if value matches", () => {
            assert.equal(
                new GetSetEntry("id", "Number", 0, "[0-9]+").accepts(0),
                true
            );
        });

        it("returns false if value does not match", () => {
            assert.equal(
                new GetSetEntry("id", "Number", 0, "[0-9]+").accepts(-1),
                false
            );
        });

        it("always returns true if no value pattern was provided", () => {
            assert.equal(
                new GetSetEntry("id").accepts(-1),
                true
            );
        });

        it("utilizes custom value validator", () => {
            assert.equal(
                new GetSetEntry("id", "Number", 0, () => true).accepts(-1),
                true
            );
            assert.equal(
                new GetSetEntry("id", "Number", 0, () => false).accepts(-1),
                false
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

        it("respects 'context' argument", (done) => {
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

        it("respects 'context' argument", (done) => {
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
