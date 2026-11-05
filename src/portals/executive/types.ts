/** Drill-down state shared by the filters, the breadcrumb and the heatmap. */
export interface Drill {
  sector: number | null;
  emirate: number | null;
}

export const noDrill: Drill = { sector: null, emirate: null };
