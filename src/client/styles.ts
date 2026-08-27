export const C = {
	wrap: "tapdmcp-wrap",
	intro: "tapdmcp-intro",
	card: "tapdmcp-card",
	header: "tapdmcp-header",
	status: "tapdmcp-status",
	statusOk: "tapdmcp-status-ok",
	statusBad: "tapdmcp-status-bad",
	grid: "tapdmcp-grid",
	field: "tapdmcp-field",
	wide: "tapdmcp-wide",
	label: "tapdmcp-label",
	input: "tapdmcp-input",
	hint: "tapdmcp-hint",
	check: "tapdmcp-check",
	actions: "tapdmcp-actions",
	button: "tapdmcp-button",
	primary: "tapdmcp-primary",
	danger: "tapdmcp-danger",
	notice: "tapdmcp-notice",
	error: "tapdmcp-error",
} as const;

const css = `
.tapdmcp-wrap{display:flex;flex-direction:column;gap:12px;padding:4px 0 16px}
.tapdmcp-intro,.tapdmcp-hint{margin:0;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px}
.tapdmcp-card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:12px}
.tapdmcp-header{display:flex;align-items:center;justify-content:space-between;gap:12px;color:var(--dsw-alias-label-primary);font-size:14px;font-weight:600}
.tapdmcp-status{font-size:11px;font-weight:500;color:var(--dsw-alias-label-tertiary)}
.tapdmcp-status-ok{color:var(--dsw-alias-state-success-primary)}
.tapdmcp-status-bad{color:var(--dsw-alias-state-error-primary)}
.tapdmcp-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.tapdmcp-field{display:flex;flex-direction:column;gap:4px;min-width:0}.tapdmcp-wide{grid-column:1/-1}
.tapdmcp-label{color:var(--dsw-alias-label-caption);font-size:11px;line-height:16px}
.tapdmcp-input{box-sizing:border-box;width:100%;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);border-radius:7px;padding:6px 8px;font:12px/18px inherit}
.tapdmcp-input:focus{outline:1px solid var(--dsw-alias-state-info-primary)}.tapdmcp-input:disabled{opacity:.55}
.tapdmcp-check{display:flex;align-items:center;gap:7px;color:var(--dsw-alias-label-secondary);font-size:12px}.tapdmcp-check input{accent-color:var(--dsw-alias-button-primary-fill)}
.tapdmcp-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tapdmcp-button{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);font:11px/24px inherit;cursor:pointer;background:transparent;border-radius:999px;padding:0 11px}.tapdmcp-button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.tapdmcp-button:disabled{opacity:.45;cursor:default}
.tapdmcp-primary{border-color:transparent;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-button-primary-dimmed)}.tapdmcp-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}
.tapdmcp-danger{color:var(--dsw-alias-state-error-primary)}
.tapdmcp-notice,.tapdmcp-error{font-size:11px;line-height:17px;padding:7px 10px;border-radius:8px}.tapdmcp-notice{color:var(--dsw-alias-state-success-primary);background:var(--dsw-alias-state-success-tertiary)}.tapdmcp-error{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-interactive-bg-hover-danger)}
@media(max-width:620px){.tapdmcp-grid{grid-template-columns:1fr}}
`;

export function injectStyles(): void {
	if (typeof document === "undefined") return;
	const id = "dsh-tapd-mcp/settings.css";
	if (document.querySelector(`style[data-plugin-css=${JSON.stringify(id)}]`) !== null) return;
	const style = document.createElement("style");
	style.dataset.pluginCss = id;
	style.textContent = css;
	document.head.appendChild(style);
}
