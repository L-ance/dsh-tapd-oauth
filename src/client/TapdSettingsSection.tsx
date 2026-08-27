import type { TranslateNS } from "@deepseek-ai/dsh-client-ui-slots";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_TAPD_API_BASE_URL, DEFAULT_TAPD_BASE_URL } from "../constants.js";
import type { SaveInput, TapdStatus } from "../schemas.js";
import type { TapdMcpRemote } from "./remote.js";
import { C } from "./styles.js";

type T = TranslateNS<"tapd-mcp">;

export interface Props {
	close: () => void;
	tapdMcp: TapdMcpRemote;
	t: T;
}

interface Draft {
	tapdBaseUrl: string;
	tapdApiBaseUrl: string;
	tapdToken: string;
	clearTapdToken: boolean;
	mcpEnabled: boolean;
}

function statusToDraft(status: TapdStatus): Draft {
	return {
		tapdBaseUrl: status.tapdBaseUrl || DEFAULT_TAPD_BASE_URL,
		tapdApiBaseUrl: status.tapdApiBaseUrl || DEFAULT_TAPD_API_BASE_URL,
		tapdToken: "",
		clearTapdToken: false,
		mcpEnabled: status.mcpEnabled,
	};
}

function messageOf(result: { error: { message: string } }): string {
	return result.error.message || "Unknown error";
}

export function TapdSettingsSection({ tapdMcp, t }: Props) {
	const [status, setStatus] = useState<TapdStatus>();
	const [draft, setDraft] = useState<Draft>();
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");

	const load = useCallback(async (replaceDraft = false) => {
		const result = await tapdMcp.status();
		if (!result.ok) {
			setError(t("error.generic", { message: messageOf(result) }));
			return;
		}
		setStatus(result.value);
		if (replaceDraft) setDraft(statusToDraft(result.value));
	}, [t, tapdMcp]);

	useEffect(() => {
		let live = true;
		void load(true);
		const timer = window.setInterval(() => {
			if (live) void load(false);
		}, 2_000);
		return () => {
			live = false;
			window.clearInterval(timer);
		};
	}, [load]);

	const set = (patch: Partial<Draft>) => setDraft((current) => current === undefined ? current : { ...current, ...patch });

	const save = useCallback(async () => {
		if (draft === undefined) return;
		setBusy(true);
		setError("");
		setNotice("");
		const input: SaveInput = { ...draft };
		const result = await tapdMcp.save(input);
		setBusy(false);
		if (!result.ok) {
			setError(t("error.generic", { message: messageOf(result) }));
			return;
		}
		setStatus(result.value);
		setDraft(statusToDraft(result.value));
		setNotice(t("notice.saved"));
	}, [draft, t, tapdMcp]);

	const mcpText = useMemo(() => status === undefined ? "…" : t(`mcp.${status.mcpPhase}`), [status, t]);
	if (draft === undefined || status === undefined) return <div className={C.wrap}>加载中…</div>;

	const tokenState = draft.clearTapdToken
		? t("status.pendingClear")
		: status.tapdTokenConfigured ? t("status.configured") : t("status.unconfigured");

	return (
		<div className={C.wrap}>
			<p className={C.intro}>{t("desc")}</p>
			<div className={C.card}>
				<div className={C.header}>
					<span>{t("section.tapd")}</span>
					<span className={`${C.status} ${status.mcpPhase === "active" ? C.statusOk : status.mcpPhase === "failed" ? C.statusBad : ""}`}>{mcpText}</span>
				</div>
				<div className={C.grid}>
					<label className={C.field}>
						<span className={C.label}>{t("field.baseUrl")}</span>
						<input className={C.input} value={draft.tapdBaseUrl} onChange={(event) => set({ tapdBaseUrl: event.target.value })} />
					</label>
					<label className={C.field}>
						<span className={C.label}>{t("field.apiBaseUrl")}</span>
						<input className={C.input} value={draft.tapdApiBaseUrl} onChange={(event) => set({ tapdApiBaseUrl: event.target.value })} />
					</label>
					<label className={`${C.field} ${C.wide}`}>
						<span className={C.label}>{t("field.token")} · {tokenState}</span>
						<input
							className={C.input}
							type="password"
							autoComplete="new-password"
							disabled={!status.tapdTokenWritable || draft.clearTapdToken}
							value={draft.tapdToken}
							placeholder={status.tapdTokenConfigured ? t("secret.keep") : ""}
							onChange={(event) => set({ tapdToken: event.target.value, clearTapdToken: false })}
						/>
						{!status.tapdTokenWritable && <span className={C.hint}>{t("hint.readOnly")}</span>}
					</label>
				</div>
				<label className={C.check}>
					<input type="checkbox" checked={draft.mcpEnabled} onChange={(event) => set({ mcpEnabled: event.target.checked })} />
					{t("field.enabled")}
				</label>
				<div className={C.actions}>
					<button className={`${C.button} ${C.primary}`} disabled={busy} onClick={() => void save()}>
						{busy ? t("action.saving") : t("action.save")}
					</button>
					{draft.clearTapdToken ? (
						<button className={C.button} disabled={busy} onClick={() => set({ clearTapdToken: false })}>{t("action.undoClear")}</button>
					) : (
						<button
							className={`${C.button} ${C.danger}`}
							disabled={busy || !status.tapdTokenConfigured || !status.tapdTokenWritable}
							onClick={() => set({ clearTapdToken: true, tapdToken: "" })}
						>
							{t("action.clearToken")}
						</button>
					)}
				</div>
				{status.mcpError && <div className={C.error}>{status.mcpError}</div>}
			</div>
			{notice && <div className={C.notice}>{notice}</div>}
			{error && <div className={C.error}>{error}</div>}
		</div>
	);
}
