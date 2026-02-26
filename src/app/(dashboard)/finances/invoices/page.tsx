"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Plus, X } from "lucide-react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    const json = await fetch("/api/invoices").then((r) => r.json());
    setInvoices(json.data || []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      apartmentId: fd.get("apartmentId"),
      amount: Number(fd.get("amount")),
      dueDate: fd.get("dueDate"),
      description: fd.get("description") || undefined,
    };

    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      setFormError(json.error?.message || "Failed to create invoice");
      return;
    }
    setShowForm(false);
    fetchInvoices();
  }

  const statusColor = (s: string) =>
    s === "paid" ? "default" : s === "pending" ? "secondary" : "destructive";

  const columns: Column<Record<string, unknown>>[] = [
    { key: "number", header: "Invoice #", sortable: true },
    {
      key: "apartment",
      header: "Apartment",
      render: (r) => {
        const apt = r.apartment as Record<string, unknown>;
        const building = apt?.building as Record<string, string>;
        return `${building?.name} - ${apt?.unitNumber}`;
      },
    },
    { key: "amount", header: "Amount", sortable: true, render: (r) => `$${(r.amount as number).toFixed(2)}` },
    { key: "dueDate", header: "Due Date", sortable: true, render: (r) => new Date(r.dueDate as string).toLocaleDateString() },
    {
      key: "status",
      header: "Status",
      render: (r) => <Badge variant={statusColor(r.status as string)}>{r.status as string}</Badge>,
    },
  ];

  if (loading) return <div className="animate-pulse">Loading invoices...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? "Cancel" : "Create Invoice"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-lg">New Invoice</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              {formError && (
                <div className="col-span-full rounded-md bg-destructive/10 p-3 text-sm text-destructive">{formError}</div>
              )}
              <div>
                <Label htmlFor="apartmentId">Apartment ID</Label>
                <Input id="apartmentId" name="apartmentId" required placeholder="Apartment ID" />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" type="number" step="0.01" required />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" name="dueDate" type="date" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" />
              </div>
              <div className="col-span-full">
                <Button type="submit">Create Invoice</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable columns={columns} data={invoices} />
    </div>
  );
}
