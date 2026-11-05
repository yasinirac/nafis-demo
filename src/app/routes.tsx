import type { ReactNode } from 'react';
import { PlatformMap } from '@/portals/map/PlatformMap';
import { TalentHome } from '@/portals/talent/TalentHome';
import { CareerPath } from '@/portals/talent/CareerPath';
import { AlignmentCheck } from '@/portals/talent/AlignmentCheck';
import { PrivacyConsent } from '@/portals/talent/PrivacyConsent';
import { EmployerDashboard } from '@/portals/employer/EmployerDashboard';
import { TalentDiscovery } from '@/portals/employer/TalentDiscovery';
import { MonthlyReport } from '@/portals/employer/MonthlyReport';
import { CareerRecord } from '@/portals/government/CareerRecord';
import { CounsellorConsole } from '@/portals/staff/CounsellorConsole';
import { IntegrityCase } from '@/portals/staff/IntegrityCase';
import { AnalystWorkbench } from '@/portals/analyst/AnalystWorkbench';
import { DeveloperPortal } from '@/portals/developer/DeveloperPortal';
import { ContributorPortal } from '@/portals/contributor/ContributorPortal';
import { CommandCentre } from '@/portals/executive/CommandCentre';
import { MonthlyPack } from '@/portals/executive/MonthlyPack';
import { PublicStatistics } from '@/portals/public/PublicStatistics';

export interface AppRoute {
  path: string;
  element: ReactNode;
}

/** Every route in the demo. Paths match src/data/platform.ts `screens`. */
export const appRoutes: AppRoute[] = [
  { path: '/', element: <PlatformMap /> },
  { path: '/talent', element: <TalentHome /> },
  { path: '/talent/path', element: <CareerPath /> },
  { path: '/talent/alignment-check', element: <AlignmentCheck /> },
  { path: '/talent/privacy', element: <PrivacyConsent /> },
  { path: '/employer', element: <EmployerDashboard /> },
  { path: '/employer/discovery', element: <TalentDiscovery /> },
  { path: '/employer/monthly-report', element: <MonthlyReport /> },
  { path: '/government/career-record', element: <CareerRecord /> },
  { path: '/staff/counsellor', element: <CounsellorConsole /> },
  { path: '/staff/integrity/:caseId', element: <IntegrityCase /> },
  { path: '/analyst', element: <AnalystWorkbench /> },
  { path: '/developer', element: <DeveloperPortal /> },
  { path: '/contributor', element: <ContributorPortal /> },
  { path: '/executive', element: <CommandCentre /> },
  { path: '/executive/monthly-pack', element: <MonthlyPack /> },
  { path: '/public', element: <PublicStatistics /> },
];
