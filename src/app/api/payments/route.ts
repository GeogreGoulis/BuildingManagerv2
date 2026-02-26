import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api-utils";
import { createPaymentSchema } from "@/lib/validations/finance";

export const GET = withAuth(
  async (req, { user }) => {
    const { searchParams } = new URL(req.url);
    const apartmentId = searchParams.get("apartmentId");

    const where =
      user.role === "TENANT"
        ? { tenantId: user.id }
        : apartmentId
        ? { apartmentId }
        : undefined;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        apartment: {
          select: { id: true, unitNumber: true, building: { select: { name: true } } },
        },
        tenant: { select: { id: true, name: true } },
        invoice: { select: { id: true, number: true } },
      },
      orderBy: { date: "desc" },
    });

    return successResponse(payments);
  },
  { resource: "payments", action: "view" }
);

export const POST = withAuth(
  async (req: NextRequest) => {
    const body = await req.json();
    const parsed = createPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, "VALIDATION_ERROR", 400);
    }

    const { date, ...rest } = parsed.data;

    const payment = await prisma.payment.create({
      data: {
        ...rest,
        date: new Date(date),
      },
    });

    return successResponse(payment);
  },
  { resource: "payments", action: "create" }
);
