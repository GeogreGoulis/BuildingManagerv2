import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        parsed.error.issues[0].message,
        "VALIDATION_ERROR",
        400
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse("Email already registered", "EMAIL_EXISTS", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "TENANT" },
      select: { id: true, email: true, name: true, role: true },
    });

    return successResponse(user);
  } catch (error) {
    console.error("Registration error:", error);
    return errorResponse("Internal server error", "INTERNAL_ERROR", 500);
  }
}
