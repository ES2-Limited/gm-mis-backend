

export interface SeedCategory {
  name: string;
  description: string;
  subgroups: string[];
  responsible: string[];
  lead: string;
  priority: 'low' | 'medium' | 'high';
  restricted?: boolean;

  domain: 'Social' | 'Environmental' | 'Other';
}

export const DOMAINS = ['Social', 'Environmental', 'Other'] as const;

export const TAXONOMY: SeedCategory[] = [
  { name: 'Environmental', domain: 'Environmental', description: 'Complaints relating to environmental impacts resulting from project activities.', subgroups: ['Dust', 'Noise', 'Vibration', 'Erosion', 'Water Pollution', 'Waste Disposal', 'Vegetation Clearing'], responsible: ['Community', 'State PIU'], lead: 'Environmental Specialist', priority: 'medium' },
  { name: 'Social', domain: 'Social', description: 'Complaints affecting communities, livelihoods, access, or social relationships.', subgroups: ['Access Restrictions', 'Community Disturbances', 'Exclusion from Benefits', 'Disruption of Local Activities'], responsible: ['Community', 'State PIU'], lead: 'Social Specialist', priority: 'medium' },
  { name: 'Land Acquisition & Resettlement', domain: 'Social', description: 'Complaints arising from land acquisition, compensation, asset valuation, livelihood restoration, or resettlement activities.', subgroups: ['Compensation Disputes', 'Asset Inventory Disagreements', 'Land Boundary Disputes', 'Valuation Disputes', 'Resettlement Concerns', 'Livelihood Restoration'], responsible: ['State PIU', 'State Agencies'], lead: 'Resettlement & Lands Officer', priority: 'medium' },
  { name: 'Labour & Working Conditions', domain: 'Social', description: 'Complaints raised by project workers regarding employment and working conditions.', subgroups: ['Wage & Salary Issues', 'Working Conditions', 'Harassment & Discrimination', 'Worker Welfare', 'Contractual Disputes', 'Leave & Benefits', 'Excessive Working Hours', 'Child Labour Concerns', 'Forced Labour Concerns'], responsible: ['Contractor', 'State PIU'], lead: 'Labour Officer', priority: 'medium' },
  { name: 'Occupational Health & Safety', domain: 'Social', description: 'Complaints relating to workplace safety and worker welfare.', subgroups: ['Unsafe Working Conditions', 'Lack of PPE', 'Worksite Accidents', 'Exposure to Hazards'], responsible: ['Contractor', 'State PIU'], lead: 'Safeguards / OHS Officer', priority: 'high' },
  { name: 'Community Health & Safety', domain: 'Social', description: 'Complaints regarding risks posed to communities by project activities.', subgroups: ['Traffic Accidents', 'Unsafe Construction Sites', 'Public Safety Concerns'], responsible: ['Community', 'State PIU'], lead: 'Safeguards Officer', priority: 'high' },
  { name: 'Contractor Conduct & Performance', domain: 'Other', description: 'Complaints relating to the conduct, behaviour, or performance of contractors and workers.', subgroups: ['Misconduct', 'Negligence', 'Property Damage', 'Disrespectful Behaviour'], responsible: ['Community', 'State PIU'], lead: 'Social Specialist', priority: 'medium' },
  { name: 'Stakeholder Engagement', domain: 'Social', description: 'Complaints regarding consultation, participation, disclosure, or communication processes.', subgroups: ['Exclusion from Meetings', 'Inadequate Information Disclosure', 'Inadequate Consultation'], responsible: ['Community', 'State PIU'], lead: 'Community Liaison Officer', priority: 'low' },
  { name: 'Procurement & Service Delivery', domain: 'Other', description: 'Complaints relating to project procurement processes, beneficiary selection, or service provision.', subgroups: ['Alleged Favouritism', 'Non-transparent Selection', 'Delayed Service Delivery'], responsible: ['State PIU', 'FPMU'], lead: 'State Project Coordinator', priority: 'medium' },
  { name: 'Corruption, Fraud & Misconduct', domain: 'Other', description: 'Complaints involving unethical practices or misuse of project resources.', subgroups: ['Bribery', 'Extortion', 'Diversion of Project Resources', 'Abuse of Authority'], responsible: ['State PIU', 'FPMU'], lead: 'Integrity / Safeguards Officer', priority: 'high' },
  { name: 'Security', domain: 'Social', description: 'Complaints involving security personnel or security incidents associated with project implementation.', subgroups: ['Harassment', 'Intimidation', 'Excessive Use of Force', 'Restricted Movement'], responsible: ['State PIU', 'FPMU'], lead: 'Safeguards / Security Officer', priority: 'high' },
  { name: 'SEA/SH & GBV', domain: 'Social', description: 'Complaints involving Sexual Exploitation and Abuse, Sexual Harassment, or other forms of Gender-Based Violence.', subgroups: ['Sexual Harassment', 'Sexual Exploitation', 'Inappropriate Conduct', 'Abuse of Power', 'Intimate Partner Violence'], responsible: ['Dedicated SEA/SH Referral Pathway'], lead: 'SEA/SH Focal Person (SMWA)', priority: 'high', restricted: true },
  { name: 'Child Protection', domain: 'Social', description: 'Complaints involving abuse, exploitation, neglect, or harm to children.', subgroups: ['Child Labour', 'Child Abuse', 'Child Exploitation', 'School-related Concerns'], responsible: ['Dedicated Referral Pathway'], lead: 'Child Protection Focal Person', priority: 'high', restricted: true },
  { name: 'Other', domain: 'Other', description: 'Complaints that do not fall within existing categories but relate to project implementation.', subgroups: ['Miscellaneous Project-Related Concerns'], responsible: ['Determined during screening'], lead: 'State Project Coordinator', priority: 'low' },
];

export function defaultRoute(c: SeedCategory): string[] {
  if (c.restricted) return [c.lead];
  return ['Community Grievance Focal Person', c.lead, 'State Sector Ministries & Agencies', 'FPMU Grievance Committee'];
}

export const COVERAGE: Record<string, string[]> = {
  Adamawa: ['Demsa', 'Fufure', 'Ganye', 'Gayuk', 'Gombi', 'Grie', 'Hong', 'Jada', 'Larmurde', 'Madagali', 'Maiha', 'Mayo Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South'],
  Bauchi: ['Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darazo', 'Dass', 'Gamawa', 'Ganjuwa', 'Giade', 'Itas-Gadau', 'Jama are', 'Katagum', 'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa Balewa', 'Toro', 'Warji', 'Zaki'],
  Benue: ['Agatu', 'Apa', 'Ado', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West', 'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Ohimini', 'Oju', 'Okpokwu', 'Oturkpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'],
  Gombe: ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu-Deba'],
  Jigawa: ['Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Dutse', 'Gagarawa', 'Garki', 'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin Hausa', 'Kazaure', 'Kiri Kasama', 'Kiyawa', 'Kaugama', 'Maigatari', 'Malam Madori', 'Miga', 'Ringim', 'Roni', 'Sule Tankarkar', 'Taura', 'Yankwashi'],
  Kano: ['Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'],
  Katsina: ['Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi', 'Dandume', 'Danja', 'Dan Musa', 'Daura', 'Dutsi', 'Dutsin Ma', 'Faskari', 'Funtua', 'Ingawa', 'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Katsina', 'Kurfi', 'Kusada', 'Mai Adua', 'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Sabuwa', 'Safana', 'Sandamu', 'Zango'],
  Kebbi: ['Aleiro', 'Arewa Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin Kebbi', 'Bunza', 'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko Besse', 'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru', 'Wasagu Danko', 'Yauri', 'Zuru'],
  Niger: ['Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara', 'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa', 'Moya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi'],
  Sokoto: ['Binji', 'Bodinga', 'Dange Shuni', 'Gada', 'Goronyo', 'Gudu', 'Gwadabawa', 'Illela', 'Isa', 'Kebbe', 'Kware', 'Rabah', 'Sabon Birni', 'Shagari', 'Silame', 'Sokoto North', 'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo'],
  Taraba: ['Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo', 'Karim Lamido', 'Kumi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Yorro', 'Zing'],
  Zamfara: ['Anka', 'Bakura', 'Birnin Magaji Kiyaw', 'Bukkuyum', 'Bungudu', 'Gummi', 'Gusau', 'Kaura Namoda', 'Maradun', 'Maru', 'Shinkafi', 'Talata Mafara', 'Chafe', 'Zurmi'],
};

export const SLA_DEFAULT = { high: 7, medium: 14, low: 21, ackHours: 48 };
export const TIER_DAYS_DEFAULT = { '1': 7, '2': 14, '3': 20, '4': 30, '5': null };

export const AUDIT_SEED = [
  { at: '2026-06-13T07:42:11Z', actor: 'F. Nwachukwu', role: 'FPMU Admin', scope: 'All states', action: 'login', label: 'Signed in', target: '', detail: '', severity: 'normal' },
  { at: '2026-06-12T16:20:03Z', actor: 'N. Eze', role: 'SEA/SH Focal Person', scope: 'All states', action: 'access_restricted', label: 'Opened restricted (SEA/SH) area', target: 'SPIN-KAN-2606-014', detail: 'Opened restricted partition', severity: 'high' },
  { at: '2026-06-12T15:58:40Z', actor: 'F. Nwachukwu', role: 'FPMU Admin', scope: 'All states', action: 'export_cases', label: 'Exported case register (CSV)', target: '142 records', detail: 'Filtered: all states', severity: 'normal' },
  { at: '2026-06-11T17:33:02Z', actor: 'F. Nwachukwu', role: 'FPMU Admin', scope: 'All states', action: 'user_created', label: 'Created user', target: 'H. Musa', detail: 'Role: Field Officer · Katsina', severity: 'normal' },
  { at: '2026-06-10T16:02:14Z', actor: 'F. Nwachukwu', role: 'FPMU Admin', scope: 'All states', action: 'coverage_saved', label: 'Updated project coverage', target: '12 states', detail: 'Project coverage updated', severity: 'normal' },
];
