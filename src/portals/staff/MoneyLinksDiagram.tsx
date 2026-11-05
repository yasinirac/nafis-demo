import { chartColors, useMeasure } from '@/charts/core';
import { useDomId } from '@/lib/useId';

/** Copy and structure for the diagram. Every label comes from src/data/cases.ts. */
export interface MoneyLinksCopy {
  ariaLabel: string;
  hireLabels: string[];
  /** Indexes of the hires whose pay flows on to the household account. */
  moneyFrom: number[];
  /** Indexes of the hires who give the owner's registered address. */
  addressFrom: number[];
  employerLines: string[];
  accountLinesWide: string[];
  accountLinesNarrow: string[];
  addressLines: string[];
  ownerLabel: string;
  salaryNote: string;
  moneyNote: string;
  narrowCaption: string;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Circle {
  cx: number;
  cy: number;
  r: number;
}

interface Seg {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Layout {
  wide: boolean;
  height: number;
  employer: Box;
  hires: Circle[];
  account: Box;
  address: Box;
  owner: Box;
  salary: Seg[];
  money: Seg[];
  home: Seg[];
  ownerLinks: Seg[];
  accountLines: string[];
}

/** The point on a circle's edge facing (tx, ty). */
function edgeOf(c: Circle, tx: number, ty: number): [number, number] {
  const dx = tx - c.cx;
  const dy = ty - c.cy;
  const len = Math.hypot(dx, dy) || 1;
  return [c.cx + (dx / len) * c.r, c.cy + (dy / len) * c.r];
}

function rectProps(b: Box) {
  return { x: b.x, y: b.y, width: b.w, height: b.h };
}

function fromPoint(key: string, x1: number, y1: number, c: Circle): Seg {
  const [x2, y2] = edgeOf(c, x1, y1);
  return { key, x1, y1, x2, y2 };
}

function fromCircle(key: string, c: Circle, x2: number, y2: number): Seg {
  const [x1, y1] = edgeOf(c, x2, y2);
  return { key, x1, y1, x2, y2 };
}

/** Left to right: employer, the six hires, the two shared points, the owner. */
function wideLayout(width: number, copy: MoneyLinksCopy): Layout {
  const employer: Box = { x: 0, y: 122, w: 140, h: 56 };
  const hx = Math.round(width * 0.36);
  const hires: Circle[] = copy.hireLabels.map((_, i) => ({ cx: hx, cy: 30 + i * 48, r: 16 }));
  const owner: Box = { x: width - 64, y: 134, w: 64, h: 32 };
  const tx = Math.round(width * 0.56);
  const tw = owner.x - 32 - tx;
  const account: Box = { x: tx, y: 44, w: tw, h: 64 };
  const address: Box = { x: tx, y: 192, w: tw, h: 64 };
  const ex = employer.x + employer.w;
  return {
    wide: true,
    height: 300,
    employer,
    hires,
    account,
    address,
    owner,
    salary: hires.map((c, i) => fromPoint(`salary-${i}`, ex, 150 + (i - 2.5) * 6, c)),
    money: copy.moneyFrom.flatMap((hi, k) => {
      const c = hires[hi];
      return c ? [fromCircle(`money-${hi}`, c, tx - 1, account.y + 14 + k * 12)] : [];
    }),
    home: copy.addressFrom.flatMap((hi, k) => {
      const c = hires[hi];
      return c ? [fromCircle(`home-${hi}`, c, tx, address.y + 14 + k * 12)] : [];
    }),
    ownerLinks: [
      { key: 'owner-account', x1: owner.x + 6, y1: owner.y, x2: account.x + account.w, y2: account.y + account.h - 12 },
      { key: 'owner-address', x1: owner.x + 6, y1: owner.y + owner.h, x2: address.x + address.w, y2: address.y + 12 },
    ],
    accountLines: copy.accountLinesWide,
  };
}

/** Top to bottom for narrow widths: employer, hires, the two shared points, the owner. */
function narrowLayout(width: number, copy: MoneyLinksCopy): Layout {
  const ew = Math.min(220, width - 24);
  const employer: Box = { x: (width - ew) / 2, y: 0, w: ew, h: 52 };
  const n = copy.hireLabels.length || 1;
  const hires: Circle[] = copy.hireLabels.map((_, i) => ({ cx: (width * (2 * i + 1)) / (2 * n), cy: 124, r: 15 }));
  const half = (width - 12) / 2;
  const account: Box = { x: 0, y: 214, w: half, h: 76 };
  const address: Box = { x: half + 12, y: 214, w: half, h: 76 };
  const owner: Box = { x: width / 2 - 36, y: 334, w: 72, h: 32 };
  const anchor = (box: Box, k: number, count: number) => box.x + 16 + (count > 1 ? (k * (box.w - 32)) / (count - 1) : (box.w - 32) / 2);
  return {
    wide: false,
    height: 370,
    employer,
    hires,
    account,
    address,
    owner,
    salary: hires.map((c, i) => fromPoint(`salary-${i}`, width / 2 + (i - (n - 1) / 2) * 12, employer.y + employer.h, c)),
    money: copy.moneyFrom.flatMap((hi, k) => {
      const c = hires[hi];
      return c ? [fromCircle(`money-${hi}`, c, anchor(account, k, copy.moneyFrom.length), account.y - 1)] : [];
    }),
    home: copy.addressFrom.flatMap((hi, k) => {
      const c = hires[hi];
      return c ? [fromCircle(`home-${hi}`, c, anchor(address, k, copy.addressFrom.length), address.y)] : [];
    }),
    ownerLinks: [
      { key: 'owner-account', x1: owner.x + 12, y1: owner.y, x2: account.x + account.w / 2, y2: account.y + account.h },
      { key: 'owner-address', x1: owner.x + owner.w - 12, y1: owner.y, x2: address.x + address.w / 2, y2: address.y + address.h },
    ],
    accountLines: copy.accountLinesNarrow,
  };
}

/** Centred lines of text inside a box. The first line is the name, in bold. */
function BoxText({ box, lines, boldFirst = false }: { box: Box; lines: string[]; boldFirst?: boolean }) {
  const lineH = 16;
  const top = box.y + box.h / 2 - ((lines.length - 1) * lineH) / 2;
  return (
    <>
      {lines.map((line, i) => (
        <text
          key={line}
          x={box.x + box.w / 2}
          y={top + i * lineH}
          dy="0.35em"
          textAnchor="middle"
          fontSize={boldFirst && i > 0 ? 12 : 13}
          fontWeight={boldFirst && i === 0 ? 600 : boldFirst ? 400 : 500}
          style={{ fill: boldFirst && i > 0 ? chartColors.axisText : chartColors.ink }}
        >
          {line}
        </text>
      ))}
    </>
  );
}

/**
 * Hand-made network for the integrity case: the employer pays six hires;
 * four send money on to one account linked to the owner's household, and
 * four give the owner's registered address. Wide screens read left to right;
 * narrow screens read top to bottom. The frame's table lists every link.
 */
export function MoneyLinksDiagram({ copy }: { copy: MoneyLinksCopy }) {
  const [ref, width] = useMeasure<HTMLDivElement>();
  const markerId = useDomId('money-arrow');
  const layout = width > 0 ? (width >= 600 ? wideLayout(width, copy) : narrowLayout(width, copy)) : null;
  const line = (s: Seg) => ({ x1: s.x1, y1: s.y1, x2: s.x2, y2: s.y2 });

  return (
    <div ref={ref} className="w-full">
      {layout ? (
        <>
          <svg role="img" aria-label={copy.ariaLabel} width={width} height={layout.height} className="block overflow-visible">
            <defs>
              <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" style={{ fill: chartColors.series2 }} />
              </marker>
            </defs>

            {layout.salary.map((s) => (
              <line key={s.key} {...line(s)} strokeWidth={1.5} style={{ stroke: chartColors.muted }} />
            ))}
            {layout.home.map((s) => (
              <line key={s.key} {...line(s)} strokeWidth={2} strokeDasharray="6 4" style={{ stroke: chartColors.series1 }} />
            ))}
            {layout.money.map((s) => (
              <line key={s.key} {...line(s)} strokeWidth={2} markerEnd={`url(#${markerId})`} style={{ stroke: chartColors.series2 }} />
            ))}
            {layout.ownerLinks.map((s) => (
              <line key={s.key} {...line(s)} strokeWidth={1.5} style={{ stroke: chartColors.ink }} />
            ))}

            <rect {...rectProps(layout.employer)} rx={10} strokeWidth={1.5} style={{ fill: chartColors.grid2, stroke: chartColors.muted }} />
            <BoxText box={layout.employer} lines={copy.employerLines} boldFirst />

            {layout.hires.map((c, i) => (
              <g key={copy.hireLabels[i] ?? i}>
                <circle cx={c.cx} cy={c.cy} r={c.r} strokeWidth={1.5} style={{ fill: chartColors.surface, stroke: chartColors.axisText }} />
                <text x={c.cx} y={c.cy} dy="0.35em" textAnchor="middle" fontSize={12} fontWeight={600} style={{ fill: chartColors.ink }}>
                  {copy.hireLabels[i]}
                </text>
              </g>
            ))}

            <rect {...rectProps(layout.account)} rx={10} strokeWidth={1.5} style={{ fill: chartColors.surface, stroke: chartColors.series2 }} />
            <BoxText box={layout.account} lines={layout.accountLines} />
            <rect {...rectProps(layout.address)} rx={10} strokeWidth={1.5} style={{ fill: chartColors.surface, stroke: chartColors.series1 }} />
            <BoxText box={layout.address} lines={copy.addressLines} />

            <rect {...rectProps(layout.owner)} rx={16} style={{ fill: chartColors.ink }} />
            <text
              x={layout.owner.x + layout.owner.w / 2}
              y={layout.owner.y + layout.owner.h / 2}
              dy="0.35em"
              textAnchor="middle"
              fontSize={12}
              fontWeight={600}
              style={{ fill: chartColors.surface }}
            >
              {copy.ownerLabel}
            </text>

            {layout.wide ? (
              <>
                <text x={layout.account.x} y={layout.account.y - 12} fontSize={12} style={{ fill: chartColors.axisText }}>
                  {copy.moneyNote}
                </text>
                <text x={0} y={layout.employer.y + layout.employer.h + 28} fontSize={12} style={{ fill: chartColors.axisText }}>
                  {copy.salaryNote}
                </text>
              </>
            ) : null}
          </svg>
          {layout.wide ? null : <p className="m-0 mt-3 text-[13px] leading-relaxed text-ink2">{copy.narrowCaption}</p>}
        </>
      ) : (
        <div style={{ height: 300 }} />
      )}
    </div>
  );
}
