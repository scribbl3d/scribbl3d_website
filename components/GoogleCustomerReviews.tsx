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
        console.log("🎯 [Google Customer Reviews] Component mounted with props:", {
            orderId,
            email,
            deliveryCountry,
            estimatedDeliveryDate,
            productsCount: products.length
        });

        // Define the render function globally
        (window as any).renderOptIn = function () {
            console.log("📞 [Google Customer Reviews] renderOptIn called");
            
            if ((window as any).gapi) {
                console.log("✅ [Google Customer Reviews] gapi object found");
                
                (window as any).gapi.load("surveyoptin", function () {
                    console.log("📦 [Google Customer Reviews] surveyoptin module loaded");
                    
                    const config = {
                        // REQUIRED FIELDS
                        merchant_id: 5795203295,
                        order_id: orderId,
                        email: email,
                        delivery_country: deliveryCountry,
                        estimated_delivery_date: estimatedDeliveryDate,

                        // OPTIONAL FIELDS
                        products: products.length > 0 ? products : undefined,
                    };
                    
                    console.log("🚀 [Google Customer Reviews] Rendering survey with config:", config);
                    
                    try {
                        (window as any).gapi.surveyoptin.render(config);
                        console.log("✅ [Google Customer Reviews] Survey rendered successfully!");
                    } catch (error) {
                        console.error("❌ [Google Customer Reviews] Error rendering survey:", error);
                    }
                });
            } else {
                console.error("❌ [Google Customer Reviews] gapi object not found!");
            }
        };
        
        console.log("✅ [Google Customer Reviews] renderOptIn function registered globally");
    }, [orderId, email, deliveryCountry, estimatedDeliveryDate, products]);

    return (
        <>
            {/* Google Customer Reviews Script */}
            <Script
                src="https://apis.google.com/js/platform.js?onload=renderOptIn"
                strategy="lazyOnload"
                onLoad={() => {
                    console.log("✅ [Google Customer Reviews] Script loaded successfully!");
                    console.log("📞 [Google Customer Reviews] renderOptIn should be called automatically");
                }}
                onError={(e) => {
                    console.error("❌ [Google Customer Reviews] Script failed to load:", e);
                    console.error("🔍 Check network tab for script loading errors");
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
        console.log("🎯 [Google Reviews Badge] Component mounted with:", {
            position,
            region,
            merchantId: 5795203295
        });

        // Wait for script to load
        const initBadge = () => {
            console.log("🔄 [Google Reviews Badge] Attempting to initialize badge...");
            
            if ((window as any).merchantwidget) {
                console.log("✅ [Google Reviews Badge] merchantwidget object found");
                
                const config = {
                    // REQUIRED FIELDS
                    merchant_id: 5795203295,

                    // OPTIONAL FIELDS
                    position: position,
                    region: region,
                };
                
                console.log("🚀 [Google Reviews Badge] Starting badge with config:", config);
                
                try {
                    // Check if badge is already initialized
                    if ((window as any).__googleBadgeInitialized) {
                        console.log("⚠️ [Google Reviews Badge] Badge already initialized, skipping");
                        return;
                    }
                    
                    (window as any).merchantwidget.start(config);
                    (window as any).__googleBadgeInitialized = true;
                    console.log("✅ [Google Reviews Badge] Badge initialized successfully!");
                    console.log("💡 Note: Badge will only show if you have reviews. Otherwise shows 'No rating available'");
                } catch (error) {
                    console.error("❌ [Google Reviews Badge] Error initializing badge:", error);
                }
            } else {
                console.warn("⚠️ [Google Reviews Badge] merchantwidget object not found yet");
            }
        };

        // Try to initialize immediately if script is already loaded
        if ((window as any).merchantwidget) {
            console.log("✅ [Google Reviews Badge] Script already loaded, initializing immediately");
            initBadge();
        } else {
            console.log("⏳ [Google Reviews Badge] Waiting for script to load...");
        }

        // Listen for script load event
        const script = document.getElementById("merchantWidgetScript");
        if (script) {
            console.log("✅ [Google Reviews Badge] Script element found, adding load listener");
            script.addEventListener("load", initBadge);
            return () => script.removeEventListener("load", initBadge);
        } else {
            console.warn("⚠️ [Google Reviews Badge] Script element not found");
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
                    console.log("✅ [Google Reviews Badge] Script loaded successfully!");
                    console.log("🔄 [Google Reviews Badge] Badge initialization should trigger now");
                }}
                onError={(e) => {
                    console.error("❌ [Google Reviews Badge] Script failed to load:", e);
                    console.error("🔍 Check network tab for script loading errors");
                }}
            />
        </>
    );
}
