"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Building2, MapPin } from "lucide-react";

interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  manager: { id: string; name: string } | null;
  _count: { apartments: number };
}

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchBuildings();
  }, []);

  async function fetchBuildings() {
    const res = await fetch("/api/buildings");
    const json = await res.json();
    if (json.data) setBuildings(json.data);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name"),
      address: fd.get("address"),
      city: fd.get("city"),
      postalCode: fd.get("postalCode"),
    };

    const res = await fetch("/api/buildings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      setFormError(json.error?.message || "Failed to create building");
      return;
    }
    setShowForm(false);
    fetchBuildings();
  }

  if (loading) return <div className="animate-pulse">Loading buildings...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Buildings</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? "Cancel" : "Add Building"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">New Building</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              {formError && (
                <div className="col-span-full rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" required />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required />
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" name="postalCode" required />
              </div>
              <div className="col-span-full">
                <Button type="submit">Create Building</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {buildings.map((building) => (
          <Link key={building.id} href={`/buildings/${building.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{building.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {building.address}, {building.city} {building.postalCode}
                </div>
                <div className="mt-2 flex gap-2">
                  <Badge variant="secondary">
                    {building._count.apartments} apartments
                  </Badge>
                  {building.manager && (
                    <Badge variant="outline">{building.manager.name}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {buildings.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">
            No buildings yet. Create your first building above.
          </p>
        )}
      </div>
    </div>
  );
}
