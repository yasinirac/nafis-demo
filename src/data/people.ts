/**
 * People. Every person here is fictional.
 */

export interface Person {
  id: string;
  name: string;
  firstName: string;
  role: string;
  employer?: string;
  site?: string;
  tenure?: string;
  note?: string;
}

export const people = {
  mariam: {
    id: 'P-1001',
    name: 'Mariam Al Shamsi',
    firstName: 'Mariam',
    role: 'Final-year student, BSc Accounting',
    note: 'Graduates December 2026. In the 2030 scenario she is a Senior Finance Analyst at Qasr Logistics.',
  },
  rashid: {
    id: 'P-1002',
    name: 'Rashid Al Ketbi',
    firstName: 'Rashid',
    role: 'Finance Analyst',
    employer: 'Qasr Logistics',
    site: 'Sharjah HQ',
    tenure: 'Month 6',
  },
  noura: {
    id: 'P-1003',
    name: 'Noura Al Hammadi',
    firstName: 'Noura',
    role: 'HR Coordinator',
    employer: 'Qasr Logistics',
    site: 'Dubai branch',
    tenure: '2 years 1 month',
  },
  saeed: {
    id: 'P-1004',
    name: 'Saeed Al Nuaimi',
    firstName: 'Saeed',
    role: 'Sales Executive',
    employer: 'Qasr Logistics',
    site: 'Sharjah HQ',
    tenure: 'Month 7',
  },
  latifa: {
    id: 'P-1005',
    name: 'Latifa Al Suwaidi',
    firstName: 'Latifa',
    role: 'Procurement Officer',
    employer: 'Qasr Logistics',
    site: 'Sharjah HQ',
    tenure: '3 years 2 months',
  },
  hamad: {
    id: 'P-1006',
    name: 'Hamad Al Dhaheri',
    firstName: 'Hamad',
    role: 'Warehouse Supervisor trainee',
    employer: 'Qasr Logistics',
    site: 'Dubai branch',
    tenure: 'Month 3',
  },
  khalid: {
    id: 'P-1007',
    name: 'Khalid Al Mansoori',
    firstName: 'Khalid',
    role: 'Operations Coordinator',
    employer: 'Wadi Trading Group',
    tenure: 'Month 7',
  },
  fatima: {
    id: 'P-1008',
    name: 'Fatima Al Zaabi',
    firstName: 'Fatima',
    role: 'Jobseeker, BSc Marketing 2025',
    note: 'Lives in Kalba.',
  },
} satisfies Record<string, Person>;

export interface StaffMember {
  name: string;
  role: string;
  org: string;
  initial: string;
}

export const staff = {
  huda: { name: 'Huda', role: 'HR Admin', org: 'Qasr Logistics', initial: 'H' },
  ahmed: { name: 'Ahmed', role: 'Line manager', org: 'Qasr Logistics', initial: 'A' },
  aisha: { name: 'Aisha', role: 'Counsellor, Sharjah team', org: 'NAFIS counselling', initial: 'A' },
  omar: { name: 'Omar', role: 'Counsellor, Sharjah team', org: 'NAFIS counselling', initial: 'O' },
  salem: { name: 'Salem', role: 'Investigator', org: 'NAFIS integrity', initial: 'S' },
  mona: { name: 'Mona', role: 'Second reviewer', org: 'NAFIS integrity', initial: 'M' },
  noor: { name: 'Noor', role: 'Analyst', org: 'Statistics & Evaluation unit', initial: 'N' },
  reem: { name: 'Reem', role: 'Developer', org: 'Falak HR Cloud (fictional)', initial: 'R' },
  hessa: { name: 'Hessa', role: 'Careers office', org: 'Gulf Coast University (fictional)', initial: 'H' },
  recruiter: { name: 'Recruitment officer', role: 'Recruitment officer', org: 'Federal entity (fictional)', initial: 'R' },
  chief: { name: 'Chief executive', role: 'Chief executive', org: 'NAFIS', initial: 'C' },
} satisfies Record<string, StaffMember>;
