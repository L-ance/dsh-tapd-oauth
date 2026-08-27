import type { SaveInput, TapdStatus } from "../schemas.js";

export type RpcResult<T> = { ok: true; value: T } | { ok: false; error: { code: string; message: string } };

export interface TapdMcpRemote {
	status(): Promise<RpcResult<TapdStatus>>;
	save(input: SaveInput): Promise<RpcResult<TapdStatus>>;
}
