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
		let reconcileScheduled = 0;
		const blockedReconcile = new Promise<void>(() => undefined);
		const dependencies = {
			setToken: async () => undefined,
			unsetToken: async () => undefined,
			updateSettings: async (next: TapdSettings) => {
				current = next;
			},
			scheduleReconcile: () => {
				reconcileScheduled += 1;
				void blockedReconcile;
			},
			status: async () => ({
				...current,
				tapdTokenConfigured: true,
				tapdTokenWritable: true,
				mcpPhase: "starting" as const,
				mcpError: "",
			}),
		};
		const save = saveTapdSettings({
			tapdBaseUrl: current.tapdBaseUrl,
			tapdApiBaseUrl: current.tapdApiBaseUrl,
			tapdToken: "",
			clearTapdToken: false,
			mcpEnabled: false,
		}, dependencies);
		const outcome = await Promise.race([
			save.then(() => "saved"),
			new Promise<string>((resolve) => setTimeout(() => resolve("timed-out"), 50)),
		]);

		expect(outcome).toBe("saved");
		expect(current.mcpEnabled).toBe(false);
		expect(reconcileScheduled).toBe(1);
	});
});
