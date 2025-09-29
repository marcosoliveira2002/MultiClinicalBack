import { Decimal } from "@prisma/client/runtime/library";

export const num = (v: any) => (v instanceof Decimal ? Number(v) : Number(v));
export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

// aceita 30 (30%) ou 0.30 (30%)
export const toPerc = (v: number) => {
  const n = Number.isFinite(v) ? Number(v) : 0;
  if (n <= 0) return 0;
  if (n >= 100) return 1;
  return n / 100; // <-- sempre trata como % do banco
};

// modo: "aditivo" | "sequencial"
export function calcLiquido(base: number, pClin: number, pConv: number, mode: "aditivo" | "sequencial" = "aditivo") {
  pClin = toPerc(pClin);
  pConv = toPerc(pConv);
  if (mode === "sequencial") return round2(Math.max(0, base * (1 - pClin) * (1 - pConv)));
  const pTotal = Math.min(1, Math.max(0, pClin + pConv));
  return round2(Math.max(0, base * (1 - pTotal)));
}
