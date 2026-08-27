import type {} from "@deepseek-ai/dsh-client-locale/client";
import type { ClientContext } from "@deepseek-ai/dsh-client-runtime/client";
import type {} from "@deepseek-ai/dsh-client-ui-settings/client";
import { TapdSettingsSection } from "./TapdSettingsSection.js";
import { en, type TapdLocaleKey, zh } from "./locales.js";
import type { TapdMcpRemote } from "./remote.js";
import { injectStyles } from "./styles.js";
import { TYPERT_REMOTE } from "./typert-remote.js";

const NS = "tapd-mcp";

declare module "@deepseek-ai/dsh-client-ui-slots" {
	interface LocaleNamespaceMap {
		"tapd-mcp": TapdLocaleKey;
	}
}

export const inject = ["slots", "remote", "locale"];

export async function apply(ctx: ClientContext): Promise<void> {
	injectStyles();
	ctx.effect(() => ctx.locale.register(NS, { zh, en }), "tapd-mcp: dictionaries");
	await ctx.remote.$mount(TYPERT_REMOTE);
	const t = ctx.locale.bind(NS);
	ctx.slots.inject("settings.section", () =>
		ctx.slots.register(
			{
				name: "settings.section",
				id: "tapd-mcp",
				order: 35,
				label: () => t("nav"),
				locale: NS,
				inject: (): { tapdMcp: TapdMcpRemote } => ({
					tapdMcp: ctx.get("remote.tapdMcp") as TapdMcpRemote,
				}),
			},
			TapdSettingsSection,
		),
	);
}
