import { ChartFrame } from '@/charts/ChartFrame';
import { Heatmap, HeatmapLegend } from '@/charts/Heatmap';
import { drillCopy, drillStatus, emirates, formatSci, heatmapCopy, sciBins, sciMatrix, sectors } from '@/data/executive';
import type { Drill } from './types';

const columns = emirates.map((e) => ({ key: e.code, label: e.code, name: e.name }));

const table = {
  caption: heatmapCopy.title,
  columns: [{ key: 'sector', label: heatmapCopy.tableSector }, ...emirates.map((e) => ({ key: e.code, label: e.code, numeric: true }))],
  rows: sectors.map((s, r) => {
    const row: Record<string, string> = { sector: s };
    emirates.forEach((e, c) => {
      const v = sciMatrix[r]?.[c];
      row[e.code] = v == null ? '—' : formatSci(v);
    });
    return row;
  }),
};

/**
 * Skills coverage by sector and emirate. Every cell is a button; selecting
 * one sets the drill-down (breadcrumb, filters and the status line below).
 * Below 640px the grid scrolls sideways inside its own region.
 */
export function CoverageHeatmap({ drill, onSelect }: { drill: Drill; onSelect: (cell: { row: number; col: number }) => void }) {
  const selected = drill.sector != null && drill.emirate != null ? { row: drill.sector, col: drill.emirate } : null;
  return (
    <ChartFrame
      title={heatmapCopy.title}
      titleAs="h2"
      subtitle={heatmapCopy.subtitle}
      status={heatmapCopy.status}
      table={table}
      footnote={heatmapCopy.note}
    >
      <p className="m-0 mb-2 text-[13px] leading-snug text-ink2 sm:hidden">{heatmapCopy.scrollHint}</p>
      {/* The cells are buttons, so moving focus between them scrolls this strip; it needs no tab stop of its own. */}
      <div className="max-sm:overflow-x-auto max-sm:pb-1">
        <div className="max-sm:min-w-[500px]">
          <Heatmap
            ariaLabel={heatmapCopy.ariaLabel}
            rows={sectors}
            columns={columns}
            values={sciMatrix}
            bins={sciBins}
            format={formatSci}
            selected={selected}
            onSelect={onSelect}
            nullLabel={heatmapCopy.nullLabel}
          />
        </div>
      </div>
      <HeatmapLegend bins={sciBins} nullLabel={heatmapCopy.nullLabel} />
      <p role="status" className="m-0 mt-4 rounded-control bg-ground px-4 py-3 text-sm leading-relaxed text-ink">
        {drillStatus(drill.sector, drill.emirate)}
      </p>
      <p className="m-0 mt-2 text-[13px] leading-snug text-ink2">{drillCopy.personLevel}</p>
    </ChartFrame>
  );
}
