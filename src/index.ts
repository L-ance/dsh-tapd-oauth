import type { Context } from "@deepseek-ai/cordis";
import { Config, type Config as PluginConfig } from "./config.js";
import { TapdMcpRuntime } from "./runtime.js";

export { Config };
export const name = "tapd-mcp";
export const inject = ["settings", "credentials", "tools"];

export async function apply(ctx: Context, config: PluginConfig): Promise<void> {
	const runtime = new TapdMcpRuntime(ctx, config);
	await runtime.start();
}
