import { join } from "path";
import { baselineToTester } from "./baselineToTest";

it("resolves to compiler baselines ", () => {
  const root = join(__dirname, "..", "..", "typescript-compiler");
  const baseLineToTest = baselineToTester({ tscRoot: root });

  const result = root + "/tests/cases/compiler/acceptableAlias1.ts";
  expect(baseLineToTest("/tests/baselines/local/acceptableAlias1.js")).toEqual(result);
  expect(baseLineToTest("/tests/baselines/local/acceptableAlias1.symbols")).toEqual(result);
  expect(baseLineToTest("/tests/baselines/local/acceptableAlias1.types")).toEqual(result);
  expect(baseLineToTest("/tests/baselines/local/acceptableAlias1.errors.txt")).toEqual(result);
});

it("resolves to a subfolder ", () => {
  const root = join(__dirname, "..", "..", "typescript-compiler");
  const baseLineToTest = baselineToTester({ tscRoot: root });

  const result = root + "/tests/cases/conformance/classes/propertyMemberDeclarations/abstractPropertyInitializer.ts";
  expect(baseLineToTest("/tests/baselines/reference/abstractPropertyInitializer.js")).toEqual(result);
  expect(baseLineToTest("/tests/baselines/reference/abstractPropertyInitializer.types")).toEqual(result);
});

it("handles multi-arg files ", () => {
  const root = join(__dirname, "..", "..", "typescript-compiler");
  const baseLineToTest = baselineToTester({ tscRoot: root });

  const result = root + "/tests/cases/conformance/es2020/modules/exportAsNamespace1.ts";
  expect(baseLineToTest("/tests/baselines/reference/exportAsNamespace1_amd.js")).toEqual(result);
});

// tests/baselines/reference/exportAndImport-es3-amd.js
// -> tests/cases/conformance/es6/modules/exportAndImport-es3.ts

describe("edge cases", () => {
  it("tsbuild", () => {
    const root = join(__dirname, "..", "..", "typescript-compiler");
    const baseLineToTest = baselineToTester({ tscRoot: root });

    const tests = [
      [
        "/tests/baselines/local/tsbuild/outfile-concat/incremental-headers-change-without-dts-changes/multiple-prologues-in-all-projects.js",
        "/src/testRunner/unittests/tsbuild/amdModulesWithOut.ts:xx",
      ],
      [
        "/tests/baselines/local/tsbuild/moduleResolution/initial-build/type-reference-resolution-uses-correct-options-for-different-resolution-options-referenced-project.js",
        "/src/testRunner/unittests/tsbuild/moduleResolution.ts:xx",
      ],
    ];
    for (const test of tests) {
      let res = baseLineToTest(root + test[0]);
      if (res && res.includes(":")) {
        res = res.split(":")[0] + ":xx";
      }
      expect(res).toEqual(root + test[1]);
    }
  });
});
