import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api-utils";
import { updateBuildingSchema } from "@/lib/validations/building";

export const GET = withAuth(
  async (_req, { params }) => {
    const building = await prisma.building.findUnique({
      where: { id: params!.buildingId },
      include: {
        manager: { select: { id: true, name: true, email: true } },
        apartments: {
          include: {
            tenancies: {
              where: { isActive: true },
              include: { tenant: { select: { id: true, name: true, email: true } } },
            },
          },
          orderBy: { unitNumber: "asc" },
        },
      },
    });

    if (!building) {
      return errorResponse("Building not found", "NOT_FOUND", 404);
    }

    return successResponse(building);
  },
  { resource: "buildings", action: "view" }
);

export const PUT = withAuth(
  async (req: NextRequest, { params }) => {
    const body = await req.json();
    const parsed = updateBuildingSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, "VALIDATION_ERROR", 400);
    }

    const building = await prisma.building.update({
      where: { id: params!.buildingId },
      data: parsed.data,
    });

    return successResponse(building);
  },
  { resource: "buildings", action: "edit" }
);

export const DELETE = withAuth(
  async (_req, { params }) => {
    await prisma.building.delete({ where: { id: params!.buildingId } });
    return successResponse({ deleted: true });
  },
  { resource: "buildings", action: "delete" }
);
