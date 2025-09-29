
import "dotenv/config";

export type CalcMode = "aditivo" | "sequencial";

const raw = String(process.env.CALC_MODE ?? "aditivo").toLowerCase();
export const CALC_MODE: CalcMode = raw === "sequencial" ? "sequencial" : "aditivo";

