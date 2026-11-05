import { useState } from 'react';
import { Card, CardHeader } from '@/components/Card';
import { DataTag } from '@/components/Chip';
import { RadioGroup } from '@/components/RadioGroup';
import { ChartFrame } from '@/charts/ChartFrame';
import { LineWithBand } from '@/charts/LineWithBand';
import { chartColors } from '@/charts/core';
import {
  breakEvenDelta,
  fiscal,
  fiscalChart,
  fiscalGrid,
  fiscalReturn,
  fiscalSentence,
  formatDelta,
  formatReturn,
  money,
} from '@/data/executive';
import { formatSignedPct } from '@/lib/format';
import { useDomId } from '@/lib/useId';

/**
 * Money and return: spend against profile, cost per retained placement and a
 * fiscal return that depends on δ. The δ selector moves the highlighted point
 * on a small line chart with the break-even marker.
 */
export function MoneyReturn() {
  const headingId = useDomId('money-heading');
  const fiscalId = useDomId('fiscal-heading');
  const [deltaText, setDeltaText] = useState(formatDelta(fiscal.defaultDelta));
  const delta = Number(deltaText);

  const table = {
    caption: fiscal.chartTitle,
    columns: [
      { key: 'delta', label: fiscal.tableDelta },
      { key: 'ret', label: fiscal.tableReturn, numeric: true },
    ],
    rows: [
      ...fiscal.options.map((d) => ({ delta: formatDelta(d), ret: formatReturn(d) })),
      { delta: `${fiscal.tableBreakEven} ${formatDelta(breakEvenDelta, 3)}`, ret: formatReturn(breakEvenDelta) },
    ],
  };

  return (
    <Card aria-labelledby={headingId}>
      <CardHeader id={headingId} title={money.title} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,2.3fr)]">
        <dl className="m-0 grid content-start gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {money.items.map((m) => (
            <div key={m.id} className="flex min-w-0 flex-col gap-1 rounded-control bg-ground p-4">
              <dt className="text-[13px] font-medium leading-snug text-ink2">{m.label}</dt>
              <dd className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-heading text-[24px] font-semibold leading-tight text-ink">{m.value}</span>
                <DataTag status={m.status} />
              </dd>
              <dd className="m-0 text-[13px] leading-snug text-ink2">{m.sub}</dd>
            </div>
          ))}
        </dl>

        <section
          aria-labelledby={fiscalId}
          className="grid min-w-0 gap-5 border-t border-line2 pt-5 lg:grid-cols-2 xl:border-s xl:border-t-0 xl:ps-5 xl:pt-0"
        >
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 id={fiscalId} className="m-0 text-[15px] font-semibold text-ink">
                {fiscal.title}
              </h3>
              <DataTag status={fiscal.status} />
            </div>
            <p className="m-0 flex flex-wrap items-baseline gap-x-2 font-heading text-ink">
              <span className="text-[34px] font-semibold leading-none">{formatReturn(delta)}</span>
              <span className="font-sans text-sm font-medium text-ink2">
                {fiscal.xLabel} {formatDelta(delta)}
              </span>
            </p>
            <p className="m-0 text-[13px] leading-relaxed text-ink2">{fiscal.definition}</p>
            <RadioGroup
              legend={fiscal.legend}
              legendClassName="mb-2 p-0 text-sm font-semibold text-ink"
              name="fiscal-delta"
              variant="segmented"
              options={fiscal.options.map((d) => ({ value: formatDelta(d), label: formatDelta(d) }))}
              value={deltaText}
              onChange={setDeltaText}
            />
            <p role="status" className="m-0 text-sm leading-snug text-ink">
              {fiscalSentence(delta)}
            </p>
          </div>
          <ChartFrame card={false} title={fiscal.chartTitle} titleAs="h4" table={table} footnote={fiscal.evidence}>
            <LineWithBand
              ariaLabel={fiscalChart.ariaLabel}
              xValues={fiscalGrid}
              xTicks={fiscal.ticks}
              formatX={(x) => formatDelta(x)}
              formatY={(y) => formatSignedPct(Math.round(y))}
              formatYTick={(y) => formatSignedPct(y)}
              series={[
                {
                  id: 'return',
                  label: fiscal.tableReturn,
                  color: chartColors.series1,
                  points: fiscalGrid.map((x) => ({ x, y: fiscalReturn(x) })),
                },
              ]}
              refLines={[
                { axis: 'y', value: 0, label: '' },
                { axis: 'x', value: breakEvenDelta, label: fiscalChart.breakEvenText },
              ]}
              highlight={{ x: delta, y: fiscalReturn(delta), label: formatReturn(delta) }}
              tooltipTitle={(x) => `${fiscal.xLabel} ${formatDelta(x)}`}
              tooltipRows={(x) => [{ label: fiscal.tableReturn, value: formatReturn(x), color: chartColors.series1, kind: 'line' }]}
              pointLabel={(x) => `${fiscal.xLabel} ${formatDelta(x)}: ${fiscal.tableReturn.toLowerCase()} ${formatReturn(x)}`}
              height={210}
            />
          </ChartFrame>
        </section>
      </div>
    </Card>
  );
}
