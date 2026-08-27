import { describe, expect, it } from "vitest";
import type { TapdSettings } from "../src/config.js";
import { saveTapdSettings } from "../src/save.js";

describe("TAPD settings save", () => {
	it("returns after persistence without waiting for MCP reconciliation", async () => {
		let current: TapdSettings = {
			tapdBaseUrl: "https://www.tapd.cn",
			tapdApiBaseUrl: "https://api.tapd.cn",
			mcpEnabled: true,
		};
		const save = saveTapdSettings({
			tapdBaseUrl: current.tapdBaseUrl,
			tapdApiBaseUrl: current.tapdApiBaseUrl,
			tapdToken: "",
			clearTapdToken: false,
			mcpEnabled: false,
		}, {
			setToken: async () => undefined,
			unsetToken: async () => undefined,
			updateSettings: async (next) => {
				current = next;
			},
			status: async () => ({
				...current,
				tapdTokenConfigured: true,
				tapdTokenWritable: true,
				mcpPhase: "starting",
				mcpError: "",
			}),
		});
		const outcome = await Promise.race([
			save.then(() => "saved"),
			new Promise<string>((resolve) => setTimeout(() => resolve("timed-out"), 50)),
		]);

		expect(outcome).toBe("saved");
		expect(current.mcpEnabled).toBe(false);
	});
});
