import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api-utils";

export const PUT = withAuth(
  async (req: NextRequest, { user }) => {
    const body = await req.json();
    const { notificationIds } = body as { notificationIds?: string[] };

    if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: { id: { in: notificationIds }, userId: user.id },
        data: { isRead: true },
      });
    } else {
      // Mark all as read
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      });
    }

    return successResponse({ success: true });
  },
  { resource: "notifications", action: "view" }
);
