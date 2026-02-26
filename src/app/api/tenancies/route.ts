import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api-utils";
import { createTenancySchema } from "@/lib/validations/building";

export const GET = withAuth(
  async (_req, { user }) => {
    const where =
      user.role === "TENANT"
        ? { tenantId: user.id }
        : undefined;

    const tenancies = await prisma.tenancy.findMany({
      where,
      include: {
        apartment: {
          include: { building: { select: { id: true, name: true } } },
        },
        tenant: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startDate: "desc" },
    });

    return successResponse(tenancies);
  },
  { resource: "tenancies", action: "view" }
);

export const POST = withAuth(
  async (req: NextRequest) => {
    const body = await req.json();
    const parsed = createTenancySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, "VALIDATION_ERROR", 400);
    }

    const { startDate, endDate, ...rest } = parsed.data;

    const tenancy = await prisma.tenancy.create({
      data: {
        ...rest,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        apartment: true,
        tenant: { select: { id: true, name: true } },
      },
    });

    return successResponse(tenancy);
  },
  { resource: "tenancies", action: "create" }
);
