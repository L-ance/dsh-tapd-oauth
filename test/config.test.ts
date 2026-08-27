import { describe, expect, it } from "vitest";
import { normalizeBaseUrl, validateSettings, type TapdSettings } from "../src/config.js";

const valid: TapdSettings = {
	tapdBaseUrl: "https://www.tapd.cn",
	tapdApiBaseUrl: "https://api.tapd.cn",
	mcpEnabled: true,
};

describe("TAPD settings validation", () => {
	it("accepts TAPD HTTPS endpoints", () => {
		expect(() => validateSettings(valid)).not.toThrow();
	});

	it("rejects plaintext non-loopback endpoints", () => {
		expect(() => validateSettings({ ...valid, tapdBaseUrl: "http://tapd.example.com" })).toThrow("HTTPS");
	});

	it("rejects embedded credentials", () => {
		expect(() => validateSettings({ ...valid, tapdApiBaseUrl: "https://user:pass@api.tapd.cn" })).toThrow("用户名或密码");
	});

	it("normalizes trailing slashes and drops query fragments", () => {
		expect(normalizeBaseUrl("https://api.tapd.cn///?ignored=1#ignored", "TAPD API 地址")).toBe("https://api.tapd.cn");
	});
});
