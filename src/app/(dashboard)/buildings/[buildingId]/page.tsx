"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X, Trash2 } from "lucide-react";
import Link from "next/link";

interface Tenancy {
  id: string;
  tenant: { id: string; name: string; email: string };
  isActive: boolean;
}

interface Apartment {
  id: string;
  unitNumber: string;
  floor: number | null;
  area: number | null;
  rooms: number | null;
  tenancies: Tenancy[];
}

interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  manager: { id: string; name: string; email: string } | null;
  apartments: Apartment[];
}

export default function BuildingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAptForm, setShowAptForm] = useState(false);
  const [formError, setFormError] = useState("");

  const buildingId = params.buildingId as string;

  useEffect(() => {
    fetchBuilding();
  }, [buildingId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchBuilding() {
    const res = await fetch(`/api/buildings/${buildingId}`);
    const json = await res.json();
    if (json.data) setBuilding(json.data);
    setLoading(false);
  }

  async function handleCreateApartment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      unitNumber: fd.get("unitNumber"),
      floor: fd.get("floor") ? Number(fd.get("floor")) : undefined,
      area: fd.get("area") ? Number(fd.get("area")) : undefined,
      rooms: fd.get("rooms") ? Number(fd.get("rooms")) : undefined,
    };

    const res = await fetch(`/api/buildings/${buildingId}/apartments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      setFormError(json.error?.message || "Failed to create apartment");
      return;
    }
    setShowAptForm(false);
    fetchBuilding();
  }

  async function deleteBuilding() {
    if (!confirm("Are you sure you want to delete this building?")) return;
    await fetch(`/api/buildings/${buildingId}`, { method: "DELETE" });
    router.push("/buildings");
  }

  async function deleteApartment(apartmentId: string) {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/buildings/${buildingId}/apartments/${apartmentId}`, {
      method: "DELETE",
    });
    fetchBuilding();
  }

  if (loading) return <div className="animate-pulse">Loading...</div>;
  if (!building) return <div>Building not found</div>;

  return (
    <div>
      <Link
        href="/buildings"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to buildings
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{building.name}</h1>
          <p className="text-muted-foreground">
            {building.address}, {building.city} {building.postalCode}
          </p>
          {building.manager && (
            <p className="mt-1 text-sm">
              Manager: <span className="font-medium">{building.manager.name}</span>
            </p>
          )}
        </div>
        <Button variant="destructive" size="sm" onClick={deleteBuilding}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Apartments ({building.apartments.length})
        </h2>
        <Button size="sm" onClick={() => setShowAptForm(!showAptForm)}>
          {showAptForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showAptForm ? "Cancel" : "Add Apartment"}
        </Button>
      </div>

      {showAptForm && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <form onSubmit={handleCreateApartment} className="grid gap-4 sm:grid-cols-4">
              {formError && (
                <div className="col-span-full rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}
              <div>
                <Label htmlFor="unitNumber">Unit Number</Label>
                <Input id="unitNumber" name="unitNumber" required placeholder="e.g. 1A" />
              </div>
              <div>
                <Label htmlFor="floor">Floor</Label>
                <Input id="floor" name="floor" type="number" />
              </div>
              <div>
                <Label htmlFor="area">Area (m²)</Label>
                <Input id="area" name="area" type="number" step="0.1" />
              </div>
              <div>
                <Label htmlFor="rooms">Rooms</Label>
                <Input id="rooms" name="rooms" type="number" />
              </div>
              <div className="col-span-full">
                <Button type="submit" size="sm">Add Apartment</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {building.apartments.map((apt) => {
          const activeTenancy = apt.tenancies.find((t) => t.isActive);
          return (
            <Card key={apt.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Unit {apt.unitNumber}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteApartment(apt.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {apt.floor != null && <span>Floor {apt.floor}</span>}
                  {apt.area != null && <span>{apt.area} m²</span>}
                  {apt.rooms != null && <span>{apt.rooms} rooms</span>}
                </div>
                <div className="mt-2">
                  {activeTenancy ? (
                    <Badge variant="default">{activeTenancy.tenant.name}</Badge>
                  ) : (
                    <Badge variant="outline">Vacant</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
