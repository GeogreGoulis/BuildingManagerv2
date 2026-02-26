import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api-utils";
import { createExpenseSchema } from "@/lib/validations/finance";

export const GET = withAuth(
  async (req) => {
    const { searchParams } = new URL(req.url);
    const buildingId = searchParams.get("buildingId");

    const expenses = await prisma.expense.findMany({
      where: buildingId ? { buildingId } : undefined,
      include: {
        building: { select: { id: true, name: true } },
        apartment: { select: { id: true, unitNumber: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    });

    return successResponse(expenses);
  },
  { resource: "expenses", action: "view" }
);

export const POST = withAuth(
  async (req: NextRequest, { user }) => {
    const body = await req.json();
    const parsed = createExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, "VALIDATION_ERROR", 400);
    }

    const { date, ...rest } = parsed.data;

    const expense = await prisma.expense.create({
      data: {
        ...rest,
        date: new Date(date),
        createdById: user.id,
      },
      include: {
        building: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    return successResponse(expense);
  },
  { resource: "expenses", action: "create" }
);
