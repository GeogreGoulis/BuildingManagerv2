import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api-utils";
import { updateUserSchema } from "@/lib/validations/user";

export const GET = withAuth(
  async (_req: NextRequest, { params }) => {
    const user = await prisma.user.findUnique({
      where: { id: params!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse("User not found", "NOT_FOUND", 404);
    }

    return successResponse(user);
  },
  { resource: "users", action: "view" }
);

export const PUT = withAuth(
  async (req: NextRequest, { params }) => {
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, "VALIDATION_ERROR", 400);
    }

    const user = await prisma.user.update({
      where: { id: params!.userId },
      data: parsed.data,
      select: { id: true, name: true, email: true, role: true, phone: true, isActive: true },
    });

    return successResponse(user);
  },
  { resource: "users", action: "edit" }
);

export const DELETE = withAuth(
  async (_req: NextRequest, { params }) => {
    await prisma.user.update({
      where: { id: params!.userId },
      data: { isActive: false },
    });

    return successResponse({ deleted: true });
  },
  { resource: "users", action: "delete" }
);
