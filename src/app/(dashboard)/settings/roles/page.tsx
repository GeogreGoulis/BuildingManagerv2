"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ROLES = ["MANAGER", "OWNER", "ACCOUNTANT", "MAINTENANCE", "TENANT"] as const;

interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string;
  roles: string[];
}

export default function RoleSettingsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [localToggles, setLocalToggles] = useState<Record<string, Set<string>>>({});

  useEffect(() => {
    fetchPermissions();
  }, []);

  async function fetchPermissions() {
    const res = await fetch("/api/settings/permissions");
    const json = await res.json();
    if (json.data) {
      setPermissions(json.data);
      // Build local toggle state
      const toggles: Record<string, Set<string>> = {};
      for (const role of ROLES) {
        toggles[role] = new Set(
          json.data.filter((p: Permission) => p.roles.includes(role)).map((p: Permission) => p.id)
        );
      }
      setLocalToggles(toggles);
    }
    setLoading(false);
  }

  function togglePermission(role: string, permId: string) {
    setLocalToggles((prev) => {
      const next = { ...prev };
      const set = new Set(next[role]);
      if (set.has(permId)) {
        set.delete(permId);
      } else {
        set.add(permId);
      }
      next[role] = set;
      return next;
    });
  }

  async function saveRole(role: string) {
    setSaving(role);
    const permissionIds = Array.from(localToggles[role] || []);
    await fetch(`/api/settings/roles/${role}/permissions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissionIds }),
    });
    setSaving(null);
  }

  // Group permissions by resource
  const grouped = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.resource]) acc[p.resource] = [];
    acc[p.resource].push(p);
    return acc;
  }, {});

  if (loading) return <div className="animate-pulse">Loading permissions...</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Role Permissions</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Admin always has full access. Configure permissions for other roles below.
      </p>

      <div className="overflow-x-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Permission Matrix</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="sticky left-0 bg-muted/50 px-4 py-3 text-left font-medium">
                    Permission
                  </th>
                  {ROLES.map((role) => (
                    <th key={role} className="px-3 py-3 text-center font-medium">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([resource, perms]) => (
                  perms.map((perm, i) => (
                    <tr key={perm.id} className="border-b last:border-0">
                      <td className="sticky left-0 bg-card px-4 py-2">
                        <span className="font-medium">{resource}</span>
                        <span className="text-muted-foreground">.{perm.action}</span>
                      </td>
                      {ROLES.map((role) => (
                        <td key={role} className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded accent-primary"
                            checked={localToggles[role]?.has(perm.id) || false}
                            onChange={() => togglePermission(role, perm.id)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {ROLES.map((role) => (
          <Button
            key={role}
            onClick={() => saveRole(role)}
            disabled={saving !== null}
            variant="outline"
          >
            {saving === role ? "Saving..." : `Save ${role}`}
          </Button>
        ))}
      </div>
    </div>
  );
}
