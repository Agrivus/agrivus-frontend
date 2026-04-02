import type { UserRole } from "../types";

const STAFF_LANDING_ROUTES: Partial<Record<UserRole, string>> = {
  admin: "/admin",
  support_moderator: "/moderator",
  accounts_officer: "/admin/transactions",
};

export const getRoleLandingRoute = (role: UserRole | string | undefined) => {
  if (!role) {
    return "/dashboard";
  }

  return STAFF_LANDING_ROUTES[role as UserRole] ?? "/dashboard";
};
