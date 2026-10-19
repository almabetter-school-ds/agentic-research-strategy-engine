export const ROLES = {
  CONSULTANT: "consultant",
  REVIEWER: "reviewer",
  ADMIN: "admin"
};

export function isReviewerRole(role) {
  return role === ROLES.REVIEWER || role === ROLES.ADMIN;
}

export function isAdminRole(role) {
  return role === ROLES.ADMIN;
}

export function roleLabel(role = ROLES.CONSULTANT) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
