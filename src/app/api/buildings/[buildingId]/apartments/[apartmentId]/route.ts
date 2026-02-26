import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api-utils";
import { updateApartmentSchema } from "@/lib/validations/building";

export const GET = withAuth(
  async (_req, { params }) => {
    const apartment = await prisma.apartment.findUnique({
      where: { id: params!.apartmentId },
      include: {
        building: { select: { id: true, name: true } },
        tenancies: {
          include: { tenant: { select: { id: true, name: true, email: true } } },
          orderBy: { startDate: "desc" },
        },
      },
    });

    if (!apartment) {
      return errorResponse("Apartment not found", "NOT_FOUND", 404);
    }

    return successResponse(apartment);
  },
  { resource: "apartments", action: "view" }
);

export const PUT = withAuth(
  async (req: NextRequest, { params }) => {
    const body = await req.json();
    const parsed = updateApartmentSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, "VALIDATION_ERROR", 400);
    }

    const apartment = await prisma.apartment.update({
      where: { id: params!.apartmentId },
      data: parsed.data,
    });

    return successResponse(apartment);
  },
  { resource: "apartments", action: "edit" }
);

export const DELETE = withAuth(
  async (_req, { params }) => {
    await prisma.apartment.delete({ where: { id: params!.apartmentId } });
    return successResponse({ deleted: true });
  },
  { resource: "apartments", action: "delete" }
);
