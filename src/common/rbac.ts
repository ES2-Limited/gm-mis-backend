

export const ROLES = [
  'FPMU Admin',
  'SPMU Admin',
  'Grievance Officer',
  'Community Grievance Focal Person',
  'SEA/SH Focal Person',
  'M&E Viewer',
] as const;
export type Role = (typeof ROLES)[number];

export const NATIONAL_ROLES: Role[] = ['FPMU Admin'];

export const MODULES = [
  'overview',
  'cases',
  'cases_all', // browse the whole register (the "All Cases" report view)
  'case_intake', // open a new grievance from the back office (Register Case)
  'locations',
  'insights',
  'reports',
  'sharing',
  'devices', // Field Devices — fleet monitoring & device provisioning view
  'restricted',
  'audit',
  'settings',
] as const;
export type ModuleKey = (typeof MODULES)[number];

export const ROLE_PERMISSIONS: Record<string, ModuleKey[]> = {

  'FPMU Admin': ['overview', 'cases', 'cases_all', 'case_intake', 'locations', 'insights', 'reports', 'sharing', 'devices', 'audit', 'settings'],

  'SPMU Admin': ['overview', 'cases', 'cases_all', 'case_intake', 'locations', 'insights', 'reports', 'sharing', 'devices', 'audit', 'settings'],
  'Grievance Officer': ['overview', 'cases', 'case_intake', 'locations'],
  'Community Grievance Focal Person': ['overview', 'cases', 'case_intake', 'locations'],

  'SEA/SH Focal Person': ['overview', 'cases', 'restricted', 'locations'],
  'M&E Viewer': ['overview', 'locations', 'insights', 'reports', 'sharing', 'devices'],
};

export function defaultPermissions(role: string): ModuleKey[] {
  return [...(ROLE_PERMISSIONS[role] || ['overview'])];
}

const MODULE_IMPLIES: Partial<Record<ModuleKey, ModuleKey[]>> = {
  case_intake: ['cases'],
  cases_all: ['cases'],
};

export function withImpliedModules(perms: ModuleKey[]): ModuleKey[] {
  const out = new Set<ModuleKey>(perms);
  for (const p of perms) (MODULE_IMPLIES[p] || []).forEach((i) => out.add(i));
  return [...out];
}

export const FUNCTIONS = [
  'Community Grievance Focal Person',
  'State Project Coordinator',
  'Environmental Specialist',
  'Social Specialist',
  'Resettlement & Lands Officer',
  'Labour Officer',
  'Safeguards / OHS Officer',
  'Safeguards Officer',
  'Community Liaison Officer',
  'Integrity / Safeguards Officer',
  'Safeguards / Security Officer',
  'SEA/SH Focal Person (SMWA)',
  'Child Protection Focal Person',
] as const;

export const GOVERNANCE_TIERS = [
  { level: 1, name: 'Community-Level Structures (CGFP)', escalatesTo: 'State PIU (SPIU)', timeline: '1–7 days' },
  { level: 2, name: 'State Project Implementation Unit (SPIU)', escalatesTo: 'State Sector Ministries & Agencies', timeline: '7–14 days' },
  { level: 3, name: 'State Sector Ministries & Agencies', escalatesTo: 'FPMU', timeline: '14–20 days' },
  { level: 4, name: 'Federal Project Management Unit (FPMU)', escalatesTo: 'Independent Appeal (external)', timeline: '20–30 days' },
];
export const MAX_TIER = 4;

export type StateModel = 1 | 2;

export const maxTierFor = (model: StateModel = 1): number => (model === 2 ? 3 : 4);

export function tierLabel(level: number, model: StateModel = 1): string {
  if (level === 2) {
    return model === 2
      ? 'State Project Implementation Unit (SPIU)'
      : 'State-Level GRC · River Basin Development Authority (RBDA)';
  }
  return GOVERNANCE_TIERS.find((g) => g.level === level)?.name || `Level ${level}`;
}
