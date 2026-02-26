import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api-utils";

export const GET = withAuth(
  async (req, { user }) => {
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    return successResponse(notifications, { unreadCount });
  },
  { resource: "notifications", action: "view" }
);

export const POST = withAuth(
  async (req: NextRequest) => {
    const body = await req.json();
    const { userId, type, title, message, link } = body;

    if (!userId || !type || !title || !message) {
      return errorResponse("Missing required fields", "VALIDATION_ERROR", 400);
    }

    const notification = await prisma.notification.create({
      data: { userId, type, title, message, link },
    });

    return successResponse(notification);
  },
  { resource: "notifications", action: "create" }
);
