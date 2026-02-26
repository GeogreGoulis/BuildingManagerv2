import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { hasPermission } from "./permissions";
import type { Role } from "@/generated/prisma";
import type { Resource, Action, SessionUser } from "@/types";

export function successResponse<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) });
}

export function errorResponse(message: string, code: string, status: number) {
  return NextResponse.json({ error: { message, code } }, { status });
}

type AuthenticatedHandler = (
  req: NextRequest,
  context: { user: SessionUser; params?: Record<string, string> }
) => Promise<NextResponse>;

interface WithAuthOptions {
  resource?: Resource;
  action?: Action;
}

export function withAuth(handler: AuthenticatedHandler, options?: WithAuthOptions) {
  return async (req: NextRequest, segmentData?: { params?: Promise<Record<string, string>> }) => {
    try {
      const session = await auth();

      if (!session?.user) {
        return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
      }

      const user = session.user as SessionUser;

      if (options?.resource && options?.action) {
        const allowed = await hasPermission(
          user.role as Role,
          options.resource,
          options.action
        );
        if (!allowed) {
          return errorResponse("Forbidden", "FORBIDDEN", 403);
        }
      }

      const params = segmentData?.params ? await segmentData.params : undefined;
      return handler(req, { user, params });
    } catch (error) {
      console.error("API error:", error);
      return errorResponse("Internal server error", "INTERNAL_ERROR", 500);
    }
  };
}
