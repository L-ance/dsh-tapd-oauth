import type { Config as McpClientConfig } from "@deepseek-ai/dsh-mcp-client";
import type { Config, TapdSettings } from "./config.js";

/** Map the settings/credential seam to the exact stdio contract expected by mcp-server-tapd. */
export function createMcpClientConfig(config: Config, settings: TapdSettings, token: string): McpClientConfig {
	return {
		serverName: "tapd",
		transport: "stdio",
		command: config.mcpCommand,
		args: [...config.mcpArgs],
		env: {
			TAPD_ACCESS_TOKEN: token,
			TAPD_API_BASE_URL: settings.tapdApiBaseUrl,
			TAPD_BASE_URL: settings.tapdBaseUrl,
			...(config.uvDefaultIndex.trim() === "" ? {} : { UV_DEFAULT_INDEX: config.uvDefaultIndex.trim() }),
		},
		cwd: "",
		toolCallTimeoutMs: config.toolCallTimeoutMs,
		// A cold uvx install can exceed the MCP SDK's fixed 60-second initialize timeout.
		// Keep the bridge alive so its built-in reconnect loop can use the completed cache.
		failOnStartupError: false,
	};
}
