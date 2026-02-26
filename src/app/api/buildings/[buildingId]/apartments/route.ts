import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api-utils";
import { createApartmentSchema } from "@/lib/validations/building";

export const GET = withAuth(
  async (_req, { params }) => {
    const apartments = await prisma.apartment.findMany({
      where: { buildingId: params!.buildingId },
      include: {
        tenancies: {
          where: { isActive: true },
          include: { tenant: { select: { id: true, name: true } } },
        },
      },
      orderBy: { unitNumber: "asc" },
    });

    return successResponse(apartments);
  },
  { resource: "apartments", action: "view" }
);

export const POST = withAuth(
  async (req: NextRequest, { params }) => {
    const body = await req.json();
    const parsed = createApartmentSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, "VALIDATION_ERROR", 400);
    }

    const apartment = await prisma.apartment.create({
      data: {
        ...parsed.data,
        buildingId: params!.buildingId,
      },
    });

    return successResponse(apartment);
  },
  { resource: "apartments", action: "create" }
);
