import { z } from "zod";

export const createSlotSchema = z.object({
  buildingId: z.string().min(1, "Building is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  maxBookings: z.number().int().positive().optional(),
});

export const updateSlotSchema = createSlotSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createBookingSchema = z.object({
  slotId: z.string().min(1, "Slot is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  notes: z.string().optional(),
});

export type CreateSlotInput = z.infer<typeof createSlotSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
