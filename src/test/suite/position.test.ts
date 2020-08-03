import * as assert from "assert";
import { tryParseRangeExpression } from "../../position";

suite("Go To Position", () => {
  test("parses simple expressions", () => {
    assert.deepStrictEqual(tryParseRangeExpression("3"), [3, undefined]);
    assert.deepStrictEqual(tryParseRangeExpression("422424"), [422424, undefined]);
    assert.deepStrictEqual(tryParseRangeExpression("   7    "), [7, undefined]);
  });

  test("parses +/- arithmetic", () => {
    assert.deepStrictEqual(tryParseRangeExpression("3+5"), [8, undefined]);
    assert.deepStrictEqual(tryParseRangeExpression("3-1"), [2, undefined]);
    assert.deepStrictEqual(tryParseRangeExpression("3 - 1 + 4"), [6, undefined]);
    assert.deepStrictEqual(tryParseRangeExpression("+3 + -1"), [2, undefined]);
    assert.deepStrictEqual(tryParseRangeExpression("3--1"), [4, undefined]);
    assert.deepStrictEqual(tryParseRangeExpression("-   6 + + 7"), [1, undefined]);
  });

  test("rejects bad input", () => {
    assert.deepStrictEqual(tryParseRangeExpression("3 * 1"), undefined);
    assert.deepStrictEqual(tryParseRangeExpression("-1"), undefined);
    assert.deepStrictEqual(tryParseRangeExpression("a"), undefined);
    assert.deepStrictEqual(tryParseRangeExpression("0x23"), undefined);
    assert.deepStrictEqual(tryParseRangeExpression(", 24"), undefined);
    assert.deepStrictEqual(tryParseRangeExpression("throw new Error()"), undefined);
  });

  test("parses ranges", () => {
    assert.deepStrictEqual(tryParseRangeExpression("3, 7"), [3, 7]);
    assert.deepStrictEqual(tryParseRangeExpression("3 + 1 , 7 - 1"), [4, 6]);
    assert.deepStrictEqual(tryParseRangeExpression("3,4,5"), [3, 4]);
    assert.deepStrictEqual(tryParseRangeExpression("3,,,,4"), [3, undefined]);
    assert.deepStrictEqual(tryParseRangeExpression("3, 2"), [3, 2]);
  });
});