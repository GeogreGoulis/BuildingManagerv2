import { z } from "zod";

export const createExpenseSchema = z.object({
  buildingId: z.string().min(1, "Building is required"),
  apartmentId: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
});

export const createPaymentSchema = z.object({
  apartmentId: z.string().min(1, "Apartment is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  invoiceId: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  method: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["pending", "completed", "failed"]).optional(),
});

export const createInvoiceSchema = z.object({
  apartmentId: z.string().min(1, "Apartment is required"),
  amount: z.number().positive("Amount must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
  description: z.string().optional(),
  status: z.enum(["pending", "paid", "overdue", "cancelled"]).optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
