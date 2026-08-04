"use client";

import { useEffect } from "react";
import Script from "next/script";

interface GoogleCustomerReviewsProps {
    orderId: string;
    email: string;
    deliveryCountry?: string;
    estimatedDeliveryDate?: string;
    products?: Array<{ gtin?: string }>;
}

/**
 * Google Customer Reviews Opt-in Component
 * 
 * This component displays a survey opt-in popup after order completion,
 * allowing customers to rate their shopping experience.
 * 
 * Benefits:
 * - Collects verified customer reviews
 * - Improves Google Shopping ad performance
 * - Builds trust and credibility
 * - Increases seller ratings visibility
 * 
 * @see https://support.google.com/merchants/answer/7124326
 */
export function GoogleCustomerReviews({
    orderId,
    email,
    deliveryCountry = "IN",
    estimatedDeliveryDate,
    products = [],
}: GoogleCustomerReviewsProps) {
    useEffect(() => {
        // Define the render function globally
        (window as any).renderOptIn = function () {
            if ((window as any).gapi) {
                (window as any).gapi.load("surveyoptin", function () {
                    (window as any).gapi.surveyoptin.render({
                        // REQUIRED FIELDS
                        merchant_id: 5795203295, // Your Google Merchant Center ID
                        order_id: orderId,
                        email: email,
                        delivery_country: deliveryCountry,
                        estimated_delivery_date: estimatedDeliveryDate,

                        // OPTIONAL FIELDS
                        products: products.length > 0 ? products : undefined,
                    });
                });
            }
        };
    }, [orderId, email, deliveryCountry, estimatedDeliveryDate, products]);

    return (
        <>
            {/* Google Customer Reviews Script */}
            <Script
                src="https://apis.google.com/js/platform.js?onload=renderOptIn"
                strategy="lazyOnload"
                onLoad={() => {
                    console.log("[Google Customer Reviews] Script loaded");
                }}
                onError={(e) => {
                    console.error("[Google Customer Reviews] Script failed to load:", e);
                }}
            />
        </>
    );
}

/**
 * Google Customer Reviews Badge Component
 * 
 * Displays your seller rating badge on any page.
 * Shows star rating and review count to build trust.
 * 
 * Position options: "BOTTOM_LEFT", "BOTTOM_RIGHT", "INLINE"
 * Region options: "IN" (India), "US", "GB", etc.
 * 
 * @see https://support.google.com/merchants/answer/7105655
 */
interface GoogleReviewsBadgeProps {
    position?: "BOTTOM_LEFT" | "BOTTOM_RIGHT" | "INLINE";
    region?: string;
}

export function GoogleReviewsBadge({
    position = "BOTTOM_RIGHT",
    region = "IN",
}: GoogleReviewsBadgeProps) {
    useEffect(() => {
        // Wait for script to load
        const initBadge = () => {
            if ((window as any).merchantwidget) {
                (window as any).merchantwidget.start({
                    // REQUIRED FIELDS
                    merchant_id: 5795203295,

                    // OPTIONAL FIELDS
                    position: position,
                    region: region,
                });
            }
        };

        // Try to initialize immediately if script is already loaded
        if ((window as any).merchantwidget) {
            initBadge();
        }

        // Listen for script load event
        const script = document.getElementById("merchantWidgetScript");
        if (script) {
            script.addEventListener("load", initBadge);
            return () => script.removeEventListener("load", initBadge);
        }
    }, [position, region]);

    return (
        <>
            {/* Google Merchant Widget Script */}
            <Script
                id="merchantWidgetScript"
                src="https://www.gstatic.com/shopping/merchant/merchantwidget.js"
                strategy="lazyOnload"
                onLoad={() => {
                    console.log("[Google Reviews Badge] Script loaded");
                }}
                onError={(e) => {
                    console.error("[Google Reviews Badge] Script failed to load:", e);
                }}
            />
        </>
    );
}
