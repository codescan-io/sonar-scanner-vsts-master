import {
  sanitizeScannerParams,
  stringifyScannerParams,
  validateScannerMode,
  validateAndParseJson,
} from "../utils";

describe("toCleanJSON", () => {
  it("should jsonify", () => {
    expect(stringifyScannerParams({ foo: "a", bar: "b" })).toBe('{"foo":"a","bar":"b"}');
  });
  it("should clean the jsonified object", () => {
    expect(stringifyScannerParams({ foo: "a", bar: undefined, baz: "" })).toBe(
      '{"foo":"a","baz":""}',
    );
  });
});

describe("sanitizeVariable", () => {
  it("should sanitize username and pass", () => {
    expect(
      sanitizeScannerParams({
        foo: "a",
        bar: "b",
        "sonar.login": "aaabbbccc",
        "sonar.password": "fffjjjkkk",
      }),
    ).toStrictEqual({
      foo: "a",
      bar: "b",
    });
  });

  it("should sanitize token", () => {
    expect(
      sanitizeScannerParams({
        foo: "a",
        "sonar.token": "squ_secret123",
      }),
    ).toStrictEqual({
      foo: "a",
    });
  });

  it("should sanitize login, password, and token together", () => {
    expect(
      sanitizeScannerParams({
        "sonar.projectKey": "my-project",
        "sonar.login": "user",
        "sonar.password": "pass",
        "sonar.token": "tok",
      }),
    ).toStrictEqual({
      "sonar.projectKey": "my-project",
    });
  });
});

describe("validateScannerMode", () => {
  it.each(["MSBuild", "CLI", "Other"])("should accept valid mode: %s", (mode) => {
    expect(validateScannerMode(mode)).toBe(mode);
  });

  it("should reject invalid mode", () => {
    expect(() => validateScannerMode("InvalidMode")).toThrow(
      "Invalid scanner mode. Allowed values: MSBuild, CLI, Other",
    );
  });

  it("should reject empty string", () => {
    expect(() => validateScannerMode("")).toThrow("Invalid scanner mode");
  });

  it("should reject null/undefined", () => {
    expect(() => validateScannerMode(null as any)).toThrow("Invalid scanner mode");
    expect(() => validateScannerMode(undefined as any)).toThrow("Invalid scanner mode");
  });

  it("should be case-sensitive", () => {
    expect(() => validateScannerMode("msbuild")).toThrow("Invalid scanner mode");
    expect(() => validateScannerMode("cli")).toThrow("Invalid scanner mode");
  });
});

describe("validateAndParseJson", () => {
  it("should parse valid JSON object", () => {
    expect(validateAndParseJson('{"key":"value"}', "test")).toStrictEqual({ key: "value" });
  });

  it("should parse nested JSON object", () => {
    const json = '{"a":"1","b":{"c":"2"}}';
    expect(validateAndParseJson(json, "test")).toStrictEqual({ a: "1", b: { c: "2" } });
  });

  it("should reject empty string", () => {
    expect(() => validateAndParseJson("", "params")).toThrow("params must be a non-empty string");
  });

  it("should reject null/undefined", () => {
    expect(() => validateAndParseJson(null as any, "params")).toThrow(
      "params must be a non-empty string",
    );
  });

  it("should reject invalid JSON", () => {
    expect(() => validateAndParseJson("{invalid}", "params")).toThrow("Invalid JSON in params");
  });

  it("should reject JSON that is not an object (string)", () => {
    expect(() => validateAndParseJson('"just a string"', "params")).toThrow(
      "Invalid JSON in params",
    );
  });

  it("should reject JSON that is not an object (number)", () => {
    expect(() => validateAndParseJson("42", "params")).toThrow("Invalid JSON in params");
  });

  it("should reject JSON null", () => {
    expect(() => validateAndParseJson("null", "params")).toThrow("Invalid JSON in params");
  });

  it("should accept JSON array", () => {
    expect(validateAndParseJson("[1,2,3]", "params")).toStrictEqual([1, 2, 3]);
  });
});
