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
 */
export function AiNote({
  agent,
  children = 'a person decides',
  prefix,
  className,
}: {
  agent: AgentName;
  children?: ReactNode;
  prefix?: ReactNode;
  className?: string;
}) {
  return (
    <p className={cx('m-0 inline-flex items-start gap-1.5 text-[13px] leading-snug text-ink2', className)}>
      <Bot aria-hidden="true" className="mt-px h-4 w-4 shrink-0 text-ink2" strokeWidth={2} />
      <span>
        {prefix ? <>{prefix} </> : null}
        <span className="font-semibold text-ink">{agent}</span> · {children}
      </span>
    </p>
  );
}
