"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Plus, X } from "lucide-react";

const CATEGORIES = ["Maintenance", "Utilities", "Insurance", "Taxes", "Cleaning", "Repairs", "Other"];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Record<string, unknown>[]>([]);
  const [buildings, setBuildings] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/expenses").then((r) => r.json()),
      fetch("/api/buildings").then((r) => r.json()),
    ]).then(([e, b]) => {
      setExpenses(e.data || []);
      setBuildings(b.data || []);
      setLoading(false);
    });
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      buildingId: fd.get("buildingId"),
      category: fd.get("category"),
      description: fd.get("description") || undefined,
      amount: Number(fd.get("amount")),
      date: fd.get("date"),
    };

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      setFormError(json.error?.message || "Failed to create expense");
      return;
    }
    setShowForm(false);
    const updated = await fetch("/api/expenses").then((r) => r.json());
    setExpenses(updated.data || []);
  }

  const columns: Column<Record<string, unknown>>[] = [
    { key: "date", header: "Date", sortable: true, render: (r) => new Date(r.date as string).toLocaleDateString() },
    { key: "category", header: "Category", sortable: true },
    { key: "description", header: "Description" },
    { key: "amount", header: "Amount", sortable: true, render: (r) => `$${(r.amount as number).toFixed(2)}` },
    { key: "building", header: "Building", render: (r) => (r.building as Record<string, string>)?.name },
    { key: "createdBy", header: "Created By", render: (r) => (r.createdBy as Record<string, string>)?.name },
  ];

  if (loading) return <div className="animate-pulse">Loading expenses...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? "Cancel" : "Add Expense"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-lg">New Expense</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              {formError && (
                <div className="col-span-full rounded-md bg-destructive/10 p-3 text-sm text-destructive">{formError}</div>
              )}
              <div>
                <Label htmlFor="buildingId">Building</Label>
                <Select id="buildingId" name="buildingId" required>
                  <option value="">Select building...</option>
                  {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select id="category" name="category" required>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" type="number" step="0.01" required />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="col-span-full">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" />
              </div>
              <div className="col-span-full">
                <Button type="submit">Create Expense</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable columns={columns} data={expenses} />
    </div>
  );
}
