import { normalizeBaseUrl, type TapdSettings, validateSettings } from "./config.js";
import type { SaveInput, TapdStatus } from "./schemas.js";

export interface TapdSaveDependencies {
	setToken(value: string): Promise<void>;
	unsetToken(): Promise<void>;
	updateSettings(next: TapdSettings): Promise<void>;
	scheduleReconcile(): void;
	status(): Promise<TapdStatus>;
}

export async function saveTapdSettings(input: SaveInput, dependencies: TapdSaveDependencies): Promise<TapdStatus> {
	const next: TapdSettings = {
		tapdBaseUrl: normalizeBaseUrl(input.tapdBaseUrl, "TAPD 地址"),
		tapdApiBaseUrl: normalizeBaseUrl(input.tapdApiBaseUrl, "TAPD API 地址"),
		mcpEnabled: input.mcpEnabled,
	};
	validateSettings(next);

	if (input.clearTapdToken) await dependencies.unsetToken();
	else if (input.tapdToken.trim() !== "") await dependencies.setToken(input.tapdToken.trim());
	await dependencies.updateSettings(next);
	dependencies.scheduleReconcile();
	return dependencies.status();
}
