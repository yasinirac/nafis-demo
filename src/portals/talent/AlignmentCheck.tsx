import { useState, type FormEvent } from 'react';
import { Lock } from 'lucide-react';
import { PhoneHeader, PhoneShell } from '@/app/PhoneShell';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { RadioGroup } from '@/components/RadioGroup';
import { StatusBanner, StatusPill } from '@/components/StatusPill';
import { SegmentProgress } from '@/components/Stepper';
import { cx } from '@/lib/cx';
import { fill } from '@/lib/format';
import {
  alignmentCheck as copy,
  alignmentTasks,
  frequencyOptions,
  studyOptions,
  titleOptions,
  type Frequency,
  type StudyShare,
  type TitleMatch,
} from '@/data/talent';
import { LinkButton, PhoneCard } from './parts';

const questions = [copy.q1, copy.q2, copy.q3];

/** "Question n of 3" above the question text, inside a fieldset legend. */
function QuestionLegend({ question }: { question: string }) {
  return (
    <>
      <span className="block text-[13px] font-medium leading-snug text-ink2">
        {fill(copy.questionLabel, { n: questions.indexOf(question) + 1, total: questions.length })}
      </span>
      <h2 className="m-0 mt-0.5 text-[17px] font-semibold leading-snug text-ink">{question}</h2>
    </>
  );
}

export function AlignmentCheck() {
  const [freq, setFreq] = useState<Record<string, Frequency>>(() =>
    Object.fromEntries(alignmentTasks.map((task) => [task.id, task.defaultValue])),
  );
  const [study, setStudy] = useState<StudyShare>(copy.studyDefault);
  const [title, setTitle] = useState<TitleMatch>(copy.titleDefault);
  const [saved, setSaved] = useState(false);
  const [talked, setTalked] = useState(false);

  const valueOf = (id: string, fallback: Frequency): Frequency => freq[id] ?? fallback;
  const roleTasksDone = alignmentTasks.filter((t) => t.roleTask && valueOf(t.id, t.defaultValue) !== 'never').length;
  const noRealWork = alignmentTasks
    .filter((t) => t.noRealWork)
    .some((t) => {
      const v = valueOf(t.id, t.defaultValue);
      return v === 'weekly' || v === 'daily';
    });
  const flagged = noRealWork || roleTasksDone === 0 || title === 'no' || study === 'none';

  const stepLabel = fill(copy.step.label, {
    current: copy.step.current,
    total: copy.step.names.length,
    name: copy.step.names[copy.step.current - 1] ?? '',
  });
  const personaChip = fill(copy.personaChip, {
    name: copy.person.name,
    role: copy.person.role,
    month: copy.person.month.value,
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <PhoneShell persona="rashid">
      <PhoneHeader>
        <h1 className="m-0 text-[24px] font-bold leading-tight text-ink">{copy.title}</h1>
        <p className="m-0 mt-1 text-sm leading-snug text-ink2">{copy.meta}</p>
      </PhoneHeader>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Chip tone="outline" className="self-start rounded-[18px]">
            {personaChip}
          </Chip>
          <div>
            <div className="flex min-h-[28px] items-center justify-between gap-3">
              <p className="m-0 text-[13px] font-medium text-ink2">{stepLabel}</p>
              {saved ? <StatusPill tone="good">{copy.step.saved}</StatusPill> : null}
            </div>
            <SegmentProgress total={copy.step.names.length} done={copy.step.current} label={stepLabel} className="mt-2" />
          </div>
        </div>

        <StatusBanner tone="neutral" icon={<Lock aria-hidden="true" className="h-4 w-4 text-ink" strokeWidth={2} />}>
          <span className="text-ink">{copy.privacy}</span>
        </StatusBanner>

        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <PhoneCard as="div">
            <fieldset className="m-0 min-w-0 border-0 p-0">
              <legend className="mb-1 p-0">
                <QuestionLegend question={copy.q1} />
              </legend>
              {alignmentTasks.map((task, i) => (
                <div key={task.id} className={cx('pb-3 pt-3', i > 0 && 'border-t border-line2', i === alignmentTasks.length - 1 && 'pb-0')}>
                  <RadioGroup
                    name={`ac-${task.id}`}
                    legend={<span className="text-sm font-medium leading-snug text-ink">{task.label}</span>}
                    options={frequencyOptions}
                    value={valueOf(task.id, task.defaultValue)}
                    onChange={(v) => {
                      setFreq((prev) => ({ ...prev, [task.id]: v }));
                      setSaved(false);
                    }}
                    variant="segmented"
                  />
                </div>
              ))}
            </fieldset>
          </PhoneCard>

          <PhoneCard as="div">
            <RadioGroup
              name="ac-study"
              legend={<QuestionLegend question={copy.q2} />}
              legendClassName="mb-3"
              options={studyOptions}
              value={study}
              onChange={(v) => {
                setStudy(v);
                setSaved(false);
              }}
              variant="pill"
            />
          </PhoneCard>

          <PhoneCard as="div">
            <RadioGroup
              name="ac-title"
              legend={<QuestionLegend question={copy.q3} />}
              legendClassName="mb-3"
              options={titleOptions}
              value={title}
              onChange={(v) => {
                setTitle(v);
                setSaved(false);
              }}
              variant="segmented"
            />
          </PhoneCard>

          <section aria-labelledby="ac-result">
            <h2 id="ac-result" className="m-0 mb-2 text-[15px] font-semibold leading-snug text-ink">
              {copy.resultHeading}
            </h2>
            <div role="status">
              {flagged ? (
                <StatusBanner tone="warning" title={copy.flaggedTitle}>
                  {copy.flagged}
                </StatusBanner>
              ) : (
                <StatusBanner tone="accent" title={copy.fitTitle}>
                  {copy.fit}
                </StatusBanner>
              )}
            </div>
          </section>

          <div>
            <Button type="submit" variant="primary" className="w-full">
              {copy.save}
            </Button>
            <div role="status">
              {saved ? (
                <StatusBanner tone="good" className="mt-3">
                  {copy.saved}
                </StatusBanner>
              ) : null}
            </div>
          </div>
        </form>

        <div className="flex flex-col items-center">
          <LinkButton onClick={() => setTalked(true)} className="justify-center">
            {copy.talk}
          </LinkButton>
          <div role="status" className="w-full">
            {talked ? (
              <StatusBanner tone="neutral" className="mt-2">
                {copy.talked}
              </StatusBanner>
            ) : null}
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}
