import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { flushSync } from 'react-dom';
import { Eye, Plus } from 'lucide-react';
import { AppShell } from '@/app/AppShell';
import { Button } from '@/components/Button';
import { Card, CardHeader, PageHeader } from '@/components/Card';
import { DataTag, ToggleChip } from '@/components/Chip';
import { Checkbox, Field, TextArea } from '@/components/Field';
import { RadioGroup } from '@/components/RadioGroup';
import { StatusBanner } from '@/components/StatusPill';
import { inputClass } from '@/components/classes';
import { cx } from '@/lib/cx';
import { useDomId } from '@/lib/useId';
import { fill, formatAED, formatInt } from '@/lib/format';
import { employerScenario, monthlyReport as report, reportCopy as copy, type RatingValue } from '@/data/employer';
import { focusInView } from './focus';

type Status = 'submitted' | 'draft' | 'error' | null;

const legendClass = 'mb-1 p-0 text-[15px] font-semibold leading-snug text-ink';

/*
 * Locked look once the report is submitted. ToggleChip and RadioGroup have no
 * disabled style of their own, so without these the locked questions would
 * still look (and hover) like live controls. The choice stays visible.
 */
const lockedChip = 'disabled:cursor-not-allowed disabled:border-line disabled:bg-line2 disabled:text-ink2';
const lockedPressedChip = 'disabled:cursor-not-allowed';
const lockedRadios = [
  '[&_input:disabled+span]:cursor-not-allowed',
  '[&_input:disabled:not(:checked)+span]:border-line',
  '[&_input:disabled:not(:checked)+span]:bg-line2',
  '[&_input:disabled:not(:checked)+span]:text-ink2',
  '[&_input:disabled:checked+span]:bg-accent-tint',
  '[&_input:disabled:checked+span]:text-ink',
].join(' ');

function Prefilled() {
  const p = copy.prefilled;
  const items = [
    { key: 'pay', label: p.pay, value: formatAED(report.pay.value), source: p.paySource },
    {
      key: 'days',
      label: p.days,
      value: fill(p.daysValue, { present: formatInt(report.daysPresent.value), total: formatInt(report.workingDays.value) }),
      source: p.daysSource,
    },
    { key: 'training', label: p.training, value: fill(p.trainingValue, { hours: formatInt(report.trainingHours.value) }), source: p.trainingSource },
    { key: 'pension', label: p.pension, value: report.pension.value, source: p.pensionSource },
  ];
  return (
    <Card aria-labelledby="prefilled-heading">
      <CardHeader id="prefilled-heading" title={p.heading} description={p.lead} actions={<DataTag status={report.pay.status} />} />
      <dl className="m-0 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.key} className="min-w-0 rounded-control bg-ground px-4 py-3">
            <dt className="text-[13px] font-medium text-ink2">{item.label}</dt>
            <dd className="m-0 mt-1 font-heading text-[20px] font-semibold leading-tight text-ink">{item.value}</dd>
            <dd className="m-0 mt-1 text-[13px] leading-snug text-ink2">{item.source}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

/** Company Monthly Report for one Emirati, filled in by the line manager in about two minutes. */
export function MonthlyReport() {
  const person = report.person;
  const first = person.firstName;
  const baseId = useDomId('report');
  const tasksHintId = useDomId('tasks-hint');
  const tasksErrorId = useDomId('tasks-error');
  const ratingHintId = useDomId('rating-hint');
  const newTaskId = useDomId('new-task');
  const addErrorId = useDomId('add-error');

  const [tasks, setTasks] = useState(report.tasks);
  const [pressed, setPressed] = useState<Record<string, boolean>>({});
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [rating, setRating] = useState<RatingValue>(report.defaultRating);
  const [evidence, setEvidence] = useState('');
  const [note, setNote] = useState('');
  const [askCounsellor, setAskCounsellor] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const newTaskRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const evidenceRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const editRef = useRef<HTMLButtonElement>(null);
  const focusNext = useRef<string | null>(null);

  const submitted = status === 'submitted';
  const chipId = (id: string) => `${baseId}-task-${id}`;
  const anyTask = tasks.some((t) => pressed[t.id]);
  const needsEvidence = report.extremes.includes(rating);
  const tasksError = attempted && !anyTask ? copy.tasks.error : null;
  const evidenceError = attempted && needsEvidence && !evidence.trim() ? copy.performance.evidenceError : null;

  // Move focus after a change that removes the focused control or adds a new one.
  useEffect(() => {
    const target = focusNext.current;
    if (!target) return;
    focusNext.current = null;
    if (target === 'new-task') focusInView(newTaskRef.current);
    else if (target === 'add-button') focusInView(addButtonRef.current);
    else if (target === 'edit') focusInView(editRef.current);
    else if (target === 'submit') focusInView(submitRef.current);
    else focusInView(document.getElementById(target));
  }, [adding, tasks, status]);

  function openAdd() {
    focusNext.current = 'new-task';
    setAdding(true);
  }

  function cancelAdd() {
    focusNext.current = 'add-button';
    setAdding(false);
    setNewTask('');
    setAddError(null);
  }

  function addTask() {
    const label = newTask.trim();
    if (!label) {
      flushSync(() => setAddError(copy.tasks.addEmpty));
      focusInView(newTaskRef.current);
      return;
    }
    const id = `custom-${tasks.length + 1}`;
    focusNext.current = chipId(id);
    setTasks((list) => [...list, { id, label }]);
    setPressed((p) => ({ ...p, [id]: true }));
    setNewTask('');
    setAddError(null);
    setAdding(false);
  }

  function onNewTaskKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelAdd();
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const missingTask = !anyTask;
    const missingEvidence = needsEvidence && !evidence.trim();
    if (missingTask || missingEvidence) {
      // Render the error messages first, so the focused question is announced with its error.
      flushSync(() => {
        setAttempted(true);
        setStatus('error');
      });
      const firstTask = tasks[0];
      focusInView(missingTask ? (firstTask ? document.getElementById(chipId(firstTask.id)) : null) : evidenceRef.current);
      return;
    }
    setAttempted(true);
    focusNext.current = 'edit';
    setStatus('submitted');
  }

  function edit() {
    focusNext.current = 'submit';
    setStatus(null);
  }

  const tasksDescribedBy = cx(tasksHintId, tasksError ? tasksErrorId : false) || undefined;

  const tasksCard = (
    <Card as="div">
      <fieldset className="m-0 min-w-0 border-0 p-0" aria-describedby={tasksDescribedBy}>
        <legend className={legendClass}>{copy.tasks.legend}</legend>
        <p id={tasksHintId} className="m-0 mb-3 text-[13px] leading-snug text-ink2">
          {copy.tasks.hint}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {tasks.map((t) => (
            <ToggleChip
              key={t.id}
              id={chipId(t.id)}
              className={pressed[t.id] ? lockedPressedChip : lockedChip}
              pressed={Boolean(pressed[t.id])}
              onPressedChange={(next) => setPressed((p) => ({ ...p, [t.id]: next }))}
            >
              {t.label}
            </ToggleChip>
          ))}
          {!adding ? (
            <button
              ref={addButtonRef}
              type="button"
              onClick={openAdd}
              className={cx(
                'inline-flex min-h-touch items-center gap-1.5 rounded-full border border-dashed border-control bg-surface px-4 py-2 text-sm font-medium leading-tight text-accent transition-colors hover:bg-accent-tint hover:text-accent-hover',
                lockedChip,
              )}
            >
              <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
              {copy.tasks.add}
            </button>
          ) : null}
        </div>
        {adding ? (
          <div className="mt-4">
            <label htmlFor={newTaskId} className="text-sm font-semibold text-ink">
              {copy.tasks.addLabel}
            </label>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <input
                ref={newTaskRef}
                id={newTaskId}
                aria-describedby={addError ? addErrorId : undefined}
                aria-invalid={addError ? true : undefined}
                className={cx(inputClass, 'min-w-[200px] flex-1')}
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={onNewTaskKey}
              />
              <Button variant="primary" onClick={addTask}>
                {copy.tasks.addConfirm}
              </Button>
              <Button variant="ghost" onClick={cancelAdd}>
                {copy.tasks.addCancel}
              </Button>
            </div>
            {addError ? (
              <p id={addErrorId} className="m-0 mt-1.5 text-[13px] font-medium text-crit-text">
                {addError}
              </p>
            ) : null}
          </div>
        ) : null}
        {tasksError ? (
          <p id={tasksErrorId} className="m-0 mt-3 text-[13px] font-medium text-crit-text">
            {tasksError}
          </p>
        ) : null}
      </fieldset>
    </Card>
  );

  const performanceCard = (
    <Card as="div">
      <RadioGroup
        legend={fill(copy.performance.legend, { first })}
        name={`${baseId}-rating`}
        options={report.ratings}
        value={rating}
        onChange={setRating}
        describedBy={ratingHintId}
        className={lockedRadios}
      />
      <p id={ratingHintId} className="m-0 mt-2 text-[13px] leading-snug text-ink2">
        {copy.performance.hint}
      </p>
      {needsEvidence ? (
        <Field
          label={copy.performance.evidence}
          required
          hint={fill(copy.performance.evidenceHint, { first })}
          error={evidenceError}
          className="mt-4"
        >
          {(ids) => (
            <input
              ref={evidenceRef}
              id={ids.id}
              aria-describedby={ids.describedBy}
              aria-invalid={ids.invalid || undefined}
              required
              maxLength={report.evidenceMaxLength}
              className={inputClass}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
            />
          )}
        </Field>
      ) : null}
    </Card>
  );

  const raiseCard = (
    <Card as="div">
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className={cx(legendClass, 'mb-3')}>{copy.raise.legend}</legend>
        <Field label={copy.raise.note} optional hint={fill(copy.raise.noteHint, { first })}>
          {(ids) => <TextArea id={ids.id} aria-describedby={ids.describedBy} rows={3} value={note} onChange={(e) => setNote(e.target.value)} />}
        </Field>
        <Checkbox className="mt-3" label={fill(copy.raise.counsellor, { first })} checked={askCounsellor} onChange={setAskCounsellor} />
      </fieldset>
    </Card>
  );

  return (
    <AppShell portal="employer" persona="ahmed">
      <PageHeader
        eyebrow={fill(copy.position, { n: formatInt(report.position), total: formatInt(report.total.value) })}
        title={fill(copy.title, { month: employerScenario.reportMonth })}
        description={fill(copy.subject, { name: person.name, role: person.role, site: person.site ?? '' })}
      />
      <div className="flex max-w-[880px] flex-col gap-6">
        <Prefilled />

        <form noValidate onSubmit={onSubmit} aria-labelledby="report-form-heading" className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h2 id="report-form-heading" className="m-0 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink2">
              {copy.formHeading}
            </h2>
            {/* Disabled after submitting, until the manager chooses Edit report. */}
            <fieldset disabled={submitted} className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
              {tasksCard}
              {performanceCard}
              {raiseCard}
            </fieldset>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Distinct keys: React must not turn the clicked Edit button into the submit button mid-click. */}
              {submitted ? (
                <Button key="edit" ref={editRef} variant="secondary" onClick={edit}>
                  {copy.edit}
                </Button>
              ) : (
                <>
                  <Button key="submit" ref={submitRef} type="submit" variant="primary">
                    {copy.submit}
                  </Button>
                  <Button key="save" variant="secondary" onClick={() => setStatus('draft')}>
                    {copy.save}
                  </Button>
                </>
              )}
            </div>
            <div role="status">
              {status === 'submitted' ? (
                <StatusBanner tone="good">{fill(copy.submitted, { hr: employerScenario.hrAdmin.name })}</StatusBanner>
              ) : status === 'draft' ? (
                <StatusBanner tone="neutral">{copy.draftSaved}</StatusBanner>
              ) : status === 'error' && (tasksError || evidenceError) ? (
                <StatusBanner tone="critical">{copy.notSubmitted}</StatusBanner>
              ) : null}
            </div>
          </div>

          <p className="m-0 flex items-start gap-2 border-t border-line pt-4 text-[13px] leading-relaxed text-ink2">
            <Eye aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{fill(copy.footnote, { first })}</span>
          </p>
        </form>
      </div>
    </AppShell>
  );
}
