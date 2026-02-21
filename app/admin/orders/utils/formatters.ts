export const formatRupees = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export const formatDate = (date?: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};
