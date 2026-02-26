import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, successResponse, errorResponse } from "@/lib/api-utils";
import { invalidatePermissionCache } from "@/lib/permissions";
import { Role } from "@/generated/prisma";

const VALID_ROLES: string[] = ["ADMIN", "MANAGER", "OWNER", "ACCOUNTANT", "MAINTENANCE", "TENANT"];

export const PUT = withAuth(
  async (req: NextRequest, { params }) => {
    const role = params!.role;

    if (!VALID_ROLES.includes(role)) {
      return errorResponse("Invalid role", "INVALID_ROLE", 400);
    }

    // Don't allow modifying ADMIN permissions
    if (role === "ADMIN") {
      return errorResponse("Cannot modify admin permissions", "FORBIDDEN", 403);
    }

    const body = await req.json();
    const { permissionIds } = body as { permissionIds: string[] };

    if (!Array.isArray(permissionIds)) {
      return errorResponse("permissionIds must be an array", "VALIDATION_ERROR", 400);
    }

    // Delete all existing role permissions for this role
    await prisma.rolePermission.deleteMany({
      where: { role: role as Role },
    });

    // Create new role permissions
    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          role: role as Role,
          permissionId,
        })),
      });
    }

    // Invalidate the cached permissions
    invalidatePermissionCache();

    return successResponse({ role, permissionCount: permissionIds.length });
  },
  { resource: "roles", action: "edit" }
);
