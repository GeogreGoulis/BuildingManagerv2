import { Role } from "@/generated/prisma";

export type Resource =
  | "users"
  | "buildings"
  | "apartments"
  | "tenancies"
  | "expenses"
  | "payments"
  | "invoices"
  | "calendar_slots"
  | "bookings"
  | "notifications"
  | "roles";

export type Action = "view" | "create" | "edit" | "delete";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  image?: string | null;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
  error?: {
    message: string;
    code: string;
  };
}
