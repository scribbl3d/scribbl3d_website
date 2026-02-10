// lib/delhivery/createShipment.ts
import {
    createDelhiveryMPSShipmentRaw,
    createDelhiveryShipmentRaw,
    prefetchWaybills,
} from "./client";

type CreateShipmentInput = {
    order: any;
    shipping_mode: string;
    dimensions: {
        length: number;
        breadth: number;
        height: number;
    };
    weight: number;
    quantity: number;
};

type CreateMPSShipmentInput = {
    order: any;
    shipping_mode: string;
    packages: Array<{
        dimensions: {
            length: number;
            breadth: number;
            height: number;
        };
        weight: number;
        quantity: number;
        products_desc?: string;
    }>;
};

type ShipmentResult = {
    ok: boolean;
    waybill?: string | null;
    masterWaybill?: string | null;
    childWaybills?: string[] | null;
    allWaybills?: string[];
    packageCount?: number;
    serviceable?: boolean | null;
    error?: string;
    raw: any;
};

/**
 * Create a Single Package Shipment (SPS)
 */
export async function createDelhiveryShipment(
    input: CreateShipmentInput,
): Promise<ShipmentResult> {
    try {
        const response = await createDelhiveryShipmentRaw(input);

        // Check for overall failure
        if (response.success === false) {
            const errorRemarks =
                response.packages?.[0]?.remarks?.join(", ") ||
                "Shipment creation failed";
            console.error("[SPS] Delhivery rejected shipment:", errorRemarks);
            return {
                ok: false,
                waybill: null,
                error: errorRemarks,
                raw: response,
            };
        }

        const pkg = response?.packages?.[0];

        // Check if package creation failed
        if (pkg?.status === "Fail" || pkg?.status === false) {
            const errorRemarks =
                pkg.remarks?.join(", ") || "Package creation failed";
            console.error("[SPS] Package failed:", errorRemarks);
            return {
                ok: false,
                waybill: null,
                error: errorRemarks,
                raw: response,
            };
        }

        return {
            ok: Boolean(pkg?.waybill),
            waybill: pkg?.waybill || null,
            serviceable: pkg?.serviceable ?? null,
            raw: response,
        };
    } catch (error: any) {
        console.error("[SPS] Exception:", error.message);
        return {
            ok: false,
            waybill: null,
            error: error.message || "Shipment creation failed",
            raw: error.response?.data || null,
        };
    }
}

/**
 * Create a Multi-Package Shipment (MPS)
 *
 * MPS requires:
 * 1. Pre-fetched waybills for each package
 * 2. One waybill designated as master
 * 3. All packages must reference the master waybill
 * 4. MPS service must be enabled for your Delhivery account
 */
export async function createDelhiveryMPSShipment(
    input: CreateMPSShipmentInput,
): Promise<ShipmentResult> {
    const packageCount = input.packages.length;

    if (packageCount < 2) {
        return {
            ok: false,
            error: "MPS requires at least 2 packages",
            masterWaybill: null,
            childWaybills: null,
            raw: null,
        };
    }

    try {
        // Step 1: Prefetch waybills for all packages
        console.log(`[MPS] Prefetching ${packageCount} waybills...`);

        const waybillsResult = await prefetchWaybills(packageCount);

        if (
            !waybillsResult.ok ||
            waybillsResult.waybills.length < packageCount
        ) {
            console.error("[MPS] Failed to prefetch waybills:", waybillsResult);
            return {
                ok: false,
                error: "Failed to prefetch waybills for MPS",
                masterWaybill: null,
                childWaybills: null,
                raw: waybillsResult,
            };
        }

        const waybills = waybillsResult.waybills;
        const masterWaybill = waybills[0]; // First waybill is the master
        const childWaybills = waybills.slice(1);

        console.log(`[MPS] Master waybill: ${masterWaybill}`);
        console.log(`[MPS] Child waybills: ${childWaybills.join(", ")}`);

        // Step 2: Create MPS shipment with all packages
        const response = await createDelhiveryMPSShipmentRaw({
            ...input,
            masterWaybill,
            waybills,
        });

        // 🔴 CHECK FOR OVERALL FAILURE
        if (response.success === false) {
            const firstPkg = response.packages?.[0];
            const errorRemarks =
                firstPkg?.remarks?.join(", ") ||
                response.rmk ||
                "MPS creation failed";
            console.error("[MPS] Delhivery rejected shipment:", errorRemarks);
            return {
                ok: false,
                error: errorRemarks,
                masterWaybill: null,
                childWaybills: null,
                raw: response,
            };
        }

        // Validate response - check if all packages were created successfully
        const createdPackages = response?.packages || [];
        const failedPackages = createdPackages.filter(
            (pkg: any) => pkg?.status === "Fail" || pkg?.status === false,
        );

        if (failedPackages.length > 0) {
            const errorRemarks =
                failedPackages[0]?.remarks?.join(", ") ||
                "Some packages failed";
            console.error("[MPS] Some packages failed:", errorRemarks);
            return {
                ok: false,
                error: errorRemarks,
                masterWaybill: null,
                childWaybills: null,
                raw: response,
            };
        }

        const successfulPackages = createdPackages.filter(
            (pkg: any) =>
                pkg?.waybill && pkg?.status !== "Fail" && pkg?.status !== false,
        );

        if (successfulPackages.length !== packageCount) {
            console.error(
                "[MPS] Not all packages created successfully:",
                response,
            );
            return {
                ok: false,
                error: `Only ${successfulPackages.length}/${packageCount} packages created`,
                masterWaybill: null,
                childWaybills: null,
                raw: response,
            };
        }

        return {
            ok: true,
            masterWaybill,
            childWaybills,
            allWaybills: waybills,
            packageCount,
            raw: response,
        };
    } catch (error: any) {
        console.error("[MPS] Exception:", error.message);
        return {
            ok: false,
            error: error.message || "MPS creation failed",
            masterWaybill: null,
            childWaybills: null,
            raw: error.response?.data || null,
        };
    }
}
