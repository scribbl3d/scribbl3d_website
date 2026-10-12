import type { Prisma } from "@prisma/client";

type CounterClient = Pick<Prisma.TransactionClient, "documentCounter">;

// Indian financial year (April–March), computed in IST so documents issued
// late on 31 March (UTC) or early on 1 April (IST) land in the right year.
export function getFinancialYear(now: Date = new Date()): string {
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const month = ist.getUTCMonth();
    const year = month >= 3 ? ist.getUTCFullYear() : ist.getUTCFullYear() - 1;
    return `${year}-${String(year + 1).slice(-2)}`;
}

async function nextNo(tx: CounterClient, key: "invoice" | "credit_note") {
    const counter = await tx.documentCounter.upsert({
        where: { key },
        update: { lastNo: { increment: 1 } },
        create: { key, lastNo: 1 },
    });
    return String(counter.lastNo).padStart(6, "0");
}

export async function generateInvoiceNumber(tx: CounterClient) {
    return `SCR/${getFinancialYear()}/${await nextNo(tx, "invoice")}`;
}

export async function generateCreditNoteNumber(tx: CounterClient) {
    return `CN/SCR/${getFinancialYear()}/${await nextNo(tx, "credit_note")}`;
}

export function isUniqueViolation(err: unknown): boolean {
    return (err as { code?: string } | null)?.code === "P2002";
}
