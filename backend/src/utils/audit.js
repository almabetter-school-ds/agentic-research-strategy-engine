import AuditLog from "../models/AuditLog.js";

export async function audit({ actor, action, entityType, entityId, metadata = {}, ip }) {
  return AuditLog.create({ actor, action, entityType, entityId, metadata, ip });
}
