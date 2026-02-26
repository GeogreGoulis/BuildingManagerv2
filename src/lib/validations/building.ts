import { z } from "zod";

export const createBuildingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  managerId: z.string().optional(),
});

export const updateBuildingSchema = createBuildingSchema.partial();

export const createApartmentSchema = z.object({
  unitNumber: z.string().min(1, "Unit number is required"),
  floor: z.number().int().optional(),
  area: z.number().positive().optional(),
  rooms: z.number().int().positive().optional(),
});

export const updateApartmentSchema = createApartmentSchema.partial();

export const createTenancySchema = z.object({
  apartmentId: z.string().min(1, "Apartment is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  monthlyRent: z.number().positive("Monthly rent must be positive"),
  isActive: z.boolean().optional(),
});

export const updateTenancySchema = createTenancySchema.partial();

export type CreateBuildingInput = z.infer<typeof createBuildingSchema>;
export type CreateApartmentInput = z.infer<typeof createApartmentSchema>;
export type CreateTenancyInput = z.infer<typeof createTenancySchema>;
