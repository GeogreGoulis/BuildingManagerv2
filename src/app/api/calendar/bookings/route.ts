import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api-utils";
import { createBookingSchema } from "@/lib/validations/calendar";

export const GET = withAuth(
  async (req) => {
    const { searchParams } = new URL(req.url);
    const slotId = searchParams.get("slotId");
    const month = searchParams.get("month"); // YYYY-MM

    let dateFilter = {};
    if (month) {
      const [year, m] = month.split("-").map(Number);
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 1);
      dateFilter = {
        startTime: { gte: start, lt: end },
      };
    }

    const bookings = await prisma.booking.findMany({
      where: {
        ...(slotId ? { slotId } : {}),
        ...dateFilter,
        cancelled: false,
      },
      include: {
        slot: { select: { id: true, name: true, building: { select: { name: true } } } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { startTime: "asc" },
    });

    return successResponse(bookings);
  },
  { resource: "bookings", action: "view" }
);

export const POST = withAuth(
  async (req: NextRequest, { user }) => {
    const body = await req.json();
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, "VALIDATION_ERROR", 400);
    }

    const { slotId, startTime, endTime, notes } = parsed.data;
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return errorResponse("End time must be after start time", "VALIDATION_ERROR", 400);
    }

    // Check slot exists and is active
    const slot = await prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot || !slot.isActive) {
      return errorResponse("Slot not found or inactive", "NOT_FOUND", 404);
    }

    // Check for booking conflicts
    const overlapping = await prisma.booking.count({
      where: {
        slotId,
        cancelled: false,
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (overlapping >= slot.maxBookings) {
      return errorResponse(
        "This time slot is already fully booked",
        "BOOKING_CONFLICT",
        409
      );
    }

    const booking = await prisma.booking.create({
      data: {
        slotId,
        userId: user.id,
        startTime: start,
        endTime: end,
        notes,
      },
      include: {
        slot: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
    });

    return successResponse(booking);
  },
  { resource: "bookings", action: "create" }
);
