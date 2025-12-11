// lib/delhivery-track.ts
import axios from "axios";

const WAYBILL_URL = process.env.DELHIVERY_WAYBILL_URL; // e.g. https://staging-express.delhivery.com/api/v1/packages/json/
const TOKEN = process.env.DELHIVERY_API_TOKEN;

export async function fetchDelhiveryWaybill(waybill: string) {
    if (!WAYBILL_URL || !TOKEN) {
        return { ok: false, error: "Missing Delhivery config" };
    }

    try {
        // many Delhivery endpoints accept token as header or ?token= param — adapt if needed
        const url =
            WAYBILL_URL.indexOf("?") >= 0
                ? `${WAYBILL_URL}&waybill=${encodeURIComponent(waybill)}`
                : `${WAYBILL_URL}?waybill=${encodeURIComponent(waybill)}`;
        const headers = {
            Authorization: `Token ${TOKEN}`,
            Accept: "application/json",
        };

        const res = await axios.get(url, { headers, timeout: 15000 });

        const raw = res.data;

        // Try best-effort parse to cleaned structure (fields vary by provider)
        // We'll look for common patterns that Delhivery returns:
        // - raw.packages / raw.shipments / raw.response
        // - raw.scan or raw.events timeline
        let status = "unknown";
        let events: any[] = [];
        let eta: string | null = null;
        try {
            // If Delhivery returns an array of package statuses
            if (
                raw?.packages &&
                Array.isArray(raw.packages) &&
                raw.packages.length
            ) {
                const p = raw.packages[0];
                status = p.status || p.current_status || status;
                events = p.scan || p.tracking || p.events || [];
                eta = p.estimated_delivery_date || p.eta || null;
            } else if (raw?.response && raw.response?.status) {
                status = raw.response.status;
                // further drill-down:
                if (raw.response?.scans) events = raw.response.scans;
            } else if (raw?.status) {
                status = raw.status;
            }
        } catch (e) {
            // ignore parsing errors; we'll return raw also
        }

        const cleaned = {
            waybill,
            status,
            last_scan: events.length ? events[events.length - 1] : null,
            events,
            eta,
            rawSummary: {
                success: raw?.success ?? null,
            },
        };

        return { ok: true, raw, cleaned };
    } catch (err: any) {
        return {
            ok: false,
            error: err.response?.data || err.message || String(err),
        };
    }
}
