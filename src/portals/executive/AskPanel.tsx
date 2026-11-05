import { useState, type FormEvent } from 'react';
import { MessageSquareText } from 'lucide-react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/Field';
import { DataTag, ToggleChip } from '@/components/Chip';
import { AiNote } from '@/components/AiNote';
import { askCopy, askItems, type AskItem } from '@/data/executive';
import { useDomId } from '@/lib/useId';

/** Pick the prepared question whose keywords best match what was typed. */
function matchQuestion(text: string): AskItem | null {
  const words = text.toLowerCase();
  let best: AskItem | null = null;
  let bestScore = 0;
  for (const item of askItems) {
    const score = item.keywords.filter((k) => words.includes(k)).length;
    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }
  return best;
}

/**
 * "Ask about any number on this page": a question box with three prepared
 * questions. Each answer names its source, its confidence and the data status,
 * and says which agent drafted it.
 */
export function AskPanel() {
  const headingId = useDomId('ask-heading');
  const suggestId = useDomId('ask-suggest');
  // The first prepared question opens answered, so the panel shows what an answer carries.
  const [text, setText] = useState(askItems[0]?.question ?? '');
  const [selected, setSelected] = useState<string | null>(askItems[0]?.id ?? null);
  const [noMatch, setNoMatch] = useState(false);
  const item = askItems.find((q) => q.id === selected) ?? null;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const match = matchQuestion(text);
    setSelected(match ? match.id : null);
    setNoMatch(!match && text.trim().length > 0);
  }

  function pick(q: AskItem, on: boolean) {
    setNoMatch(false);
    if (on) {
      setSelected(q.id);
      setText(q.question);
    } else {
      setSelected(null);
      setText('');
    }
  }

  return (
    <Card aria-labelledby={headingId}>
      <h2 id={headingId} className="m-0 mb-3 text-[17px] font-semibold leading-snug text-ink">
        {askCopy.label}
      </h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <MessageSquareText aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink2" />
          <TextInput
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-labelledby={headingId}
            placeholder={askCopy.placeholder}
            className="ps-10"
          />
        </div>
        <Button type="submit" variant="primary" className="sm:w-auto">
          {askCopy.submit}
        </Button>
      </form>

      <p id={suggestId} className="m-0 mb-2 mt-4 text-[13px] font-medium text-ink2">
        {askCopy.suggestedLabel}
      </p>
      <ul aria-labelledby={suggestId} className="m-0 flex list-none flex-wrap gap-2 p-0">
        {askItems.map((q) => (
          <li key={q.id} className="min-w-0">
            <ToggleChip pressed={selected === q.id} onPressedChange={(on) => pick(q, on)} className="text-start">
              {q.question}
            </ToggleChip>
          </li>
        ))}
      </ul>

      <div role="status" className="mt-4 rounded-control bg-ground px-4 py-3">
        {item ? (
          <div className="flex flex-col gap-2">
            <p className="m-0 text-[15px] font-semibold leading-snug text-ink">{item.question}</p>
            <p className="m-0 max-w-[880px] text-[15px] leading-relaxed text-ink">{item.answer}</p>
            <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-snug text-ink2">
              <span>
                <span className="font-semibold text-ink">{askCopy.sourceLabel}:</span> {item.source}
              </span>
              <span>
                <span className="font-semibold text-ink">{askCopy.confidenceLabel}:</span> {item.confidence}
              </span>
              <DataTag status={item.status} />
            </p>
            <AiNote agent="Analyst Copilot">{askCopy.agentNote}</AiNote>
          </div>
        ) : (
          <p className="m-0 text-sm leading-relaxed text-ink2">{noMatch ? askCopy.noMatch : askCopy.empty}</p>
        )}
      </div>
    </Card>
  );
}
