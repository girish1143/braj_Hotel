export interface AuditEntry {
  id: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

// In-memory audit log store
const auditLogs: AuditEntry[] = [];

export function logAudit(
  adminName: string,
  action: string,
  entityType: string,
  entityId: string,
  details: string,
  ipAddress: string = '127.0.0.1'
): AuditEntry {
  const now = new Date();
  const dateFormatted = `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()} ${now.toLocaleTimeString()}`;

  const entry: AuditEntry = {
    id: `aud-${Date.now()}`,
    adminName,
    action,
    entityType,
    entityId,
    details,
    ipAddress,
    timestamp: dateFormatted
  };

  auditLogs.unshift(entry);
  return entry;
}

export function getAuditLogs(): AuditEntry[] {
  return auditLogs;
}
