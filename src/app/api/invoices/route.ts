import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api-utils";
import { createInvoiceSchema } from "@/lib/validations/finance";

function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `INV-${year}${month}-${rand}`;
}

export const GET = withAuth(
  async (req, { user }) => {
    const { searchParams } = new URL(req.url);
    const apartmentId = searchParams.get("apartmentId");
    const status = searchParams.get("status");

    let where: Record<string, unknown> = {};
    if (apartmentId) where.apartmentId = apartmentId;
    if (status) where.status = status;

    // Tenants can only see invoices for their apartments
    if (user.role === "TENANT") {
      const tenancies = await prisma.tenancy.findMany({
        where: { tenantId: user.id, isActive: true },
        select: { apartmentId: true },
      });
      where.apartmentId = { in: tenancies.map((t) => t.apartmentId) };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        apartment: {
          select: { id: true, unitNumber: true, building: { select: { name: true } } },
        },
        _count: { select: { payments: true } },
      },
      orderBy: { dueDate: "desc" },
    });

    return successResponse(invoices);
  },
  { resource: "invoices", action: "view" }
);

export const POST = withAuth(
  async (req: NextRequest) => {
    const body = await req.json();
    const parsed = createInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, "VALIDATION_ERROR", 400);
    }

    const { dueDate, ...rest } = parsed.data;

    const invoice = await prisma.invoice.create({
      data: {
        ...rest,
        dueDate: new Date(dueDate),
        number: generateInvoiceNumber(),
      },
    });

    return successResponse(invoice);
  },
  { resource: "invoices", action: "create" }
);
