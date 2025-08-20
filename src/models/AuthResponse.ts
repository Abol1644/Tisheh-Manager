import type { User } from "@/models/Users"
import type { Period } from "@/models/Period"

export interface AuthResponse {
  token: string;
  expiration: string;
  status: boolean;
  message: string;
  user: User;
  period?: Period;
}