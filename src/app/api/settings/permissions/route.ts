import { prisma } from "@/lib/prisma";
import { withAuth, successResponse } from "@/lib/api-utils";

export const GET = withAuth(
  async () => {
    const permissions = await prisma.permission.findMany({
      include: {
        rolePermissions: {
          select: { role: true },
        },
      },
      orderBy: [{ resource: "asc" }, { action: "asc" }],
    });

    const result = permissions.map((p) => ({
      id: p.id,
      resource: p.resource,
      action: p.action,
      description: p.description,
      roles: p.rolePermissions.map((rp) => rp.role),
    }));

    return successResponse(result);
  },
  { resource: "roles", action: "view" }
);
