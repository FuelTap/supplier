import { z } from "zod";

export const stationSchema = z.object({
  name: z
    .string({ message: "field cannot be empty." })
    .trim()
    .min(2, { message: "Branch name must be at least 2 characters." }),
  address: z
    .string({ message: "field cannot be empty." })
    .trim()
    .min(5, { message: "Please enter the station's street address." }),
  state: z.string({ message: "State is required." }).min(1, "State is required."),
  city: z.string({ message: "City is required." }).min(1, "City is required."),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  // A station can be created first and given a manager later.
  managerId: z.string().nullable(),
});

export type StationInput = z.infer<typeof stationSchema>;

// Managers are invited without a station; stations get a manager when they are
// created or reassigned.
export const managerSchema = z.object({
  name: z
    .string({ message: "field cannot be empty." })
    .trim()
    .min(2, { message: "Name must be at least 2 characters." }),
  email: z
    .string({ message: "field cannot be empty." })
    .trim()
    .email({ message: "Please enter a valid email address." }),
  phone: z
    .string({ message: "field cannot be empty." })
    .regex(/^(?:\+?234|0)?([789]\d{9})$/, {
      message: "Please enter a valid Nigerian phone number.",
    }),
});

export type ManagerInput = z.infer<typeof managerSchema>;
