import type { ReactNode } from 'react';
import { Bot } from 'lucide-react';
import { cx } from '@/lib/cx';

export type AgentName =
  | 'Coach Agent'
  | 'Manager Coach'
  | 'Employer Agent'
  | 'Counsellor Copilot'
  | 'Analyst Copilot'
  | 'Report Writer'
  | 'Ghost-Job Detector'
  | 'Contributor Assistant';

/**
 * Labels AI-drafted content: names the agent and says that a person decides.
 * Agents draft and recommend; humans decide.
 *
 *   <AiNote agent="Coach Agent">you decide</AiNote>
 *     → Coach Agent · you decide
 *   <AiNote prefix="Drafted by your" agent="Coach Agent" suffix="from Emirati career records">you decide</AiNote>
 *     → Drafted by your Coach Agent from Emirati career records · you decide
 *
 * Renders a block-level div so it can sit inside a Field hint.
 */
export function AiNote({
  agent,
  children = 'a person decides',
  prefix,
  suffix,
  className,
}: {
  agent: AgentName;
  children?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('inline-flex items-start gap-1.5 text-[13px] leading-snug text-ink2', className)}>
      <Bot aria-hidden="true" className="mt-px h-4 w-4 shrink-0 text-ink2" strokeWidth={2} />
      <span>
        {prefix ? <>{prefix} </> : null}
        <span className="font-semibold text-ink">{agent}</span>
        {suffix ? <> {suffix}</> : null} · {children}
      </span>
    </div>
  );
}
