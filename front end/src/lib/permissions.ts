import type { UserRole } from "@/contexts/AuthContext";

export const canAccessMessages = (role?: UserRole | null) => role !== "receptionist";
