"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/data-table";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments")
      .then((r) => r.json())
      .then((json) => {
        setPayments(json.data || []);
        setLoading(false);
      });
  }, []);

  const columns: Column<Record<string, unknown>>[] = [
    { key: "date", header: "Date", sortable: true, render: (r) => new Date(r.date as string).toLocaleDateString() },
    {
      key: "tenant",
      header: "Tenant",
      render: (r) => (r.tenant as Record<string, string>)?.name,
    },
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
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={r.status === "completed" ? "default" : r.status === "pending" ? "secondary" : "destructive"}>
          {r.status as string}
        </Badge>
      ),
    },
    {
      key: "invoice",
      header: "Invoice",
      render: (r) => (r.invoice as Record<string, string>)?.number || "—",
    },
  ];

  if (loading) return <div className="animate-pulse">Loading payments...</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Payments</h1>
      <DataTable columns={columns} data={payments} />
    </div>
  );
}
