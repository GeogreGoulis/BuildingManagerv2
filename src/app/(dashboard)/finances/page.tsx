"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Wallet, TrendingDown, TrendingUp, FileText } from "lucide-react";
import Link from "next/link";

export default function FinancesPage() {
  const [expenses, setExpenses] = useState<Record<string, unknown>[]>([]);
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
  const [invoices, setInvoices] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/expenses").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
    ]).then(([e, p, i]) => {
      setExpenses(e.data || []);
      setPayments(p.data || []);
      setInvoices(i.data || []);
      setLoading(false);
    });
  }, []);

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount as number), 0);
  const totalPayments = payments.reduce((sum, p) => sum + (p.amount as number), 0);
  const pendingInvoices = invoices.filter((i) => i.status === "pending").length;

  if (loading) return <div className="animate-pulse">Loading finances...</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Finances</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPayments.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoices}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex gap-2">
        <Link href="/finances/expenses">
          <Badge variant="outline" className="cursor-pointer px-3 py-1">Expenses</Badge>
        </Link>
        <Link href="/finances/payments">
          <Badge variant="outline" className="cursor-pointer px-3 py-1">Payments</Badge>
        </Link>
        <Link href="/finances/invoices">
          <Badge variant="outline" className="cursor-pointer px-3 py-1">Invoices</Badge>
        </Link>
      </div>

      <h2 className="mb-3 text-lg font-semibold">Recent Expenses</h2>
      <DataTable
        columns={[
          { key: "date", header: "Date", sortable: true, render: (r) => new Date(r.date as string).toLocaleDateString() },
          { key: "category", header: "Category" },
          { key: "amount", header: "Amount", sortable: true, render: (r) => `$${(r.amount as number).toFixed(2)}` },
          { key: "building", header: "Building", render: (r) => (r.building as Record<string, string>)?.name },
        ] as Column<Record<string, unknown>>[]}
        data={expenses.slice(0, 5)}
        pageSize={5}
      />
    </div>
  );
}
