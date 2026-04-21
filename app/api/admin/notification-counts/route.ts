import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const viewTrackers = await prisma.adminViewTracker.findMany();
        
        const trackerMap = new Map(
            viewTrackers.map(t => [t.section, t.lastViewedAt])
        );

        const getCountSince = async (section: string, whereCondition: any = {}) => {
            const lastViewed = trackerMap.get(section);
            if (!lastViewed) {
                return await prisma[section.split('-')[0] === 'orders' ? 'order' : section.replace(/-/g, '')].count({ where: whereCondition });
            }
            return await prisma[section.split('-')[0] === 'orders' ? 'order' : section.replace(/-/g, '')].count({
                where: {
                    ...whereCondition,
                    createdAt: {
                        gt: lastViewed
                    }
                }
            });
        };

        const lastViewedOrders = trackerMap.get('orders');
        
        const paymentPendingCount = !lastViewedOrders 
            ? await prisma.order.count({ where: { status: { in: ['payment_pending', 'pending'] } } })
            : await prisma.order.count({ where: { status: { in: ['payment_pending', 'pending'] }, createdAt: { gt: lastViewedOrders } } });
        
        const paymentFailedCount = !lastViewedOrders
            ? await prisma.order.count({ where: { status: 'payment_failed' } })
            : await prisma.order.count({ where: { status: 'payment_failed', createdAt: { gt: lastViewedOrders } } });
        
        const confirmedCount = !lastViewedOrders
            ? await prisma.order.count({ where: { status: { in: ['confirmed', 'processing'] } } })
            : await prisma.order.count({ where: { status: { in: ['confirmed', 'processing'] }, createdAt: { gt: lastViewedOrders } } });

        const [
            personaliseCount,
            form3dCount,
            prototypingCount,
            smallBatchCount,
            stockNotificationCount
        ] = await Promise.all([
            (async () => {
                const lastViewed = trackerMap.get('personalise-responses');
                return !lastViewed 
                    ? await prisma.personaliseFormResponse.count()
                    : await prisma.personaliseFormResponse.count({ where: { createdAt: { gt: lastViewed } } });
            })(),
            (async () => {
                const lastViewed = trackerMap.get('form3d-responses');
                return !lastViewed 
                    ? await prisma.form3DResponse.count()
                    : await prisma.form3DResponse.count({ where: { createdAt: { gt: lastViewed } } });
            })(),
            (async () => {
                const lastViewed = trackerMap.get('prototyping-requests');
                return !lastViewed 
                    ? await prisma.prototypingRequest.count()
                    : await prisma.prototypingRequest.count({ where: { createdAt: { gt: lastViewed } } });
            })(),
            (async () => {
                const lastViewed = trackerMap.get('small-batch-manufacturing');
                return !lastViewed 
                    ? await prisma.smallBatchRequest.count()
                    : await prisma.smallBatchRequest.count({ where: { createdAt: { gt: lastViewed } } });
            })(),
            (async () => {
                const lastViewed = trackerMap.get('stock-notifications');
                return !lastViewed 
                    ? await prisma.stockNotification.count()
                    : await prisma.stockNotification.count({ where: { createdAt: { gt: lastViewed } } });
            })()
        ]);

        const totalOrdersNew = paymentPendingCount + paymentFailedCount + confirmedCount;

        return NextResponse.json({
            orders: totalOrdersNew,
            'orders-payment-pending': paymentPendingCount,
            'orders-payment-failed': paymentFailedCount,
            'orders-confirmed': confirmedCount,
            'personalise-responses': personaliseCount,
            'form3d-responses': form3dCount,
            'prototyping-requests': prototypingCount,
            'small-batch-manufacturing': smallBatchCount,
            'stock-notifications': stockNotificationCount
        });
    } catch (error) {
        console.error('Error fetching notification counts:', error);
        return NextResponse.json({ error: 'Failed to fetch counts' }, { status: 500 });
    }
}
