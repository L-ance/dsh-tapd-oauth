import { z } from "zod";

export const statusSchema = z.object({
	tapdBaseUrl: z.string(),
	tapdApiBaseUrl: z.string(),
	mcpEnabled: z.boolean(),
	tapdTokenConfigured: z.boolean(),
	tapdTokenWritable: z.boolean(),
	mcpPhase: z.enum(["stopped", "starting", "active", "failed"]),
	mcpError: z.string(),
});
export type TapdStatus = z.infer<typeof statusSchema>;

export const saveInputSchema = z.object({
	tapdBaseUrl: z.string(),
	tapdApiBaseUrl: z.string(),
	tapdToken: z.string(),
	clearTapdToken: z.boolean(),
	mcpEnabled: z.boolean(),
});
export type SaveInput = z.infer<typeof saveInputSchema>;
