import {strict as assert} from "assert";
import {type} from "../lib/utilities.js";

describe("type(...constructor)", () => {

    it("returns a function", () => {
        assert.equal(
            type() instanceof Function,
            true
        );
    });

    it("detects multiple types", () => {
        assert.equal(
            type(Number)(0),
            true
        );
        assert.equal(
            type(Number)("0"),
            false
        );
        assert.equal(
            type(Number, String)("0"),
            true
        );
    });

    it("allows nullable types", () => {
        assert.equal(
            type(Number, null)(null),
            true
        );
    });

});
