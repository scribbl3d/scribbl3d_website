import { z } from "zod";

export const UserDTO = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  role: z.enum(["user", "admin"]).default("user"),
});

export type UserDTOType = z.infer<typeof UserDTO>;

export function sanitizeUser(user: unknown): UserDTOType {
  return UserDTO.parse(user);
}

export const OrderDTO = z.object({
  id: z.string(),
  total: z.number(),
  status: z.enum(["pending", "processing", "shipped", "delivered"]),
  createdAt: z.date(),
});

export type OrderDTOType = z.infer<typeof OrderDTO>;

export function sanitizeOrder(order: unknown): OrderDTOType {
  return OrderDTO.parse(order);
}
