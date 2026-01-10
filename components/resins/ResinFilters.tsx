"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function ResinFilters() {
    return (
        <Card className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">Filters</h3>

            <div>
                <p className="font-medium mb-2">Material Type</p>
                <div className="space-y-2">
                    {[
                        "Standard Resin",
                        "ABS-Like Resin",
                        "Tough Resin",
                        "Flexible Resin",
                        "Water Washable Resin",
                    ].map((item) => (
                        <label
                            key={item}
                            className="flex items-center gap-2 text-sm"
                        >
                            <Checkbox /> {item}
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <p className="font-medium mb-2">Printer Compatibility</p>
                <div className="space-y-2">
                    {["LCD / MSLA", "DLP", "Laser SLA"].map((item) => (
                        <label
                            key={item}
                            className="flex items-center gap-2 text-sm"
                        >
                            <Checkbox /> {item}
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <p className="font-medium mb-2">UV Wavelength</p>
                <p className="text-sm text-muted-foreground">405 nm</p>
            </div>
        </Card>
    );
}
