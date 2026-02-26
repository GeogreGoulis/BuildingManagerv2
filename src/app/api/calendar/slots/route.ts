import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api-utils";
import { createSlotSchema } from "@/lib/validations/calendar";

export const GET = withAuth(
  async (req) => {
    const { searchParams } = new URL(req.url);
    const buildingId = searchParams.get("buildingId");

    const slots = await prisma.slot.findMany({
      where: {
        ...(buildingId ? { buildingId } : {}),
        isActive: true,
      },
      include: {
        building: { select: { id: true, name: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { name: "asc" },
    });

    return successResponse(slots);
  },
  { resource: "calendar_slots", action: "view" }
);

export const POST = withAuth(
  async (req: NextRequest) => {
    const body = await req.json();
    const parsed = createSlotSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, "VALIDATION_ERROR", 400);
    }

    const slot = await prisma.slot.create({
      data: parsed.data,
      include: { building: { select: { id: true, name: true } } },
    });

    return successResponse(slot);
  },
  { resource: "calendar_slots", action: "create" }
);
