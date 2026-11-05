/**
 * Certified metrics. A metric reaches the Executive Command Centre only once
 * it is certified: a fixed id, a written definition, an owner and a version.
 * Screens that quote a metric use its id and version from this list.
 */

export interface CertifiedMetric {
  id: string;
  name: string;
  version: string;
}

export const certifiedMetrics: CertifiedMetric[] = [
  { id: 'M01', name: 'Emiratis in private jobs', version: 'v2.0' },
  { id: 'M02', name: 'Retained Skilled Emiratis', version: 'v3.0' },
  { id: 'M03', name: 'RSE pipeline', version: 'v1.2' },
  { id: 'M04', name: 'Skills Coverage Index', version: 'v1.1' },
  { id: 'M07', name: 'Gross placements', version: 'v2.1' },
  { id: 'M09', name: 'Survival S(6/12/24)', version: 'v1.3' },
  { id: 'M10', name: 'End-to-end success', version: 'v1.1' },
  { id: 'M11', name: 'Real wage progression', version: 'v1.0' },
  { id: 'M15', name: 'Non-genuine share', version: 'v1.2' },
  { id: 'M18', name: 'Cost per retained placement', version: 'v1.0' },
  { id: 'M19', name: 'Fiscal ROI at stated δ', version: 'v0.9' },
];

export function metricById(id: string): CertifiedMetric | undefined {
  return certifiedMetrics.find((m) => m.id === id);
}

/** "M09 v1.3" */
export function metricLabel(id: string): string {
  const m = metricById(id);
  return m ? `${m.id} ${m.version}` : id;
}

export const metricsCopy = {
  heading: 'Certified metrics',
  lead: 'One definition, one owner and one version for every number that leaves the unit.',
  inUse: 'In this question',
  note: 'Only certified metrics can reach the Executive Command Centre.',
};
