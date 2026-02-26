import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api-utils";
import { createBuildingSchema } from "@/lib/validations/building";

export const GET = withAuth(
  async (_req, { user }) => {
    const where =
      user.role === "MANAGER"
        ? { managerId: user.id }
        : undefined;

    const buildings = await prisma.building.findMany({
      where,
      include: {
        manager: { select: { id: true, name: true } },
        _count: { select: { apartments: true } },
      },
      orderBy: { name: "asc" },
    });

    return successResponse(buildings);
  },
  { resource: "buildings", action: "view" }
);

export const POST = withAuth(
  async (req: NextRequest) => {
    const body = await req.json();
    const parsed = createBuildingSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, "VALIDATION_ERROR", 400);
    }

    const building = await prisma.building.create({
      data: parsed.data,
      include: {
        manager: { select: { id: true, name: true } },
        _count: { select: { apartments: true } },
      },
    });

    return successResponse(building);
  },
  { resource: "buildings", action: "create" }
);
