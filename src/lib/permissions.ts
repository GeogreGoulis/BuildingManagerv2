import { Role } from "@/generated/prisma";
import { prisma } from "./prisma";
import type { Resource, Action } from "@/types";

type PermissionMap = Record<string, Set<string>>;

let permissionCache: Record<string, PermissionMap> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 1 minute

export async function loadPermissions(): Promise<Record<string, PermissionMap>> {
  const now = Date.now();
  if (permissionCache && now - cacheTimestamp < CACHE_TTL) {
    return permissionCache;
  }

  const rolePermissions = await prisma.rolePermission.findMany({
    include: { permission: true },
  });

  const map: Record<string, PermissionMap> = {};

  for (const rp of rolePermissions) {
    const role = rp.role;
    if (!map[role]) map[role] = {};
    const resource = rp.permission.resource;
    if (!map[role][resource]) map[role][resource] = new Set();
    map[role][resource].add(rp.permission.action);
  }

  permissionCache = map;
  cacheTimestamp = now;
  return map;
}

export function invalidatePermissionCache() {
  permissionCache = null;
  cacheTimestamp = 0;
}

export async function hasPermission(
  role: Role,
  resource: Resource,
  action: Action
): Promise<boolean> {
  // ADMIN always has full access
  if (role === "ADMIN") return true;

  const permissions = await loadPermissions();
  const rolePerms = permissions[role];
  if (!rolePerms) return false;

  const resourcePerms = rolePerms[resource];
  if (!resourcePerms) return false;

  return resourcePerms.has(action);
}
