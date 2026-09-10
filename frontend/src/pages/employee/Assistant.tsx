import { useEffect, useRef, useState } from 'react';
import { Card, PageIntro, Badge, Button, IconBubble, Spinner, cx } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { ai } from '../../lib/api';

type Msg = { from: 'ia' | 'me'; text: string };
const chips = ['Combien de congés me reste-t-il ?', 'Où trouver mon dernier bulletin ?', 'Quels sont mes jours de télétravail ?'];

export default function EmpAssistant() {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: 'ia', text: `Bonjour ${user?.name.split(' ')[0] ?? ''}. Je suis votre assistante RH. Posez votre question, j'y réponds en toute confidentialité.` },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [msgs, thinking]);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || thinking) return;
    setMsgs((m) => [...m, { from: 'me', text: clean }]);
    setInput('');
    setThinking(true);
    const answer = await ai.chat(clean);
    setThinking(false);
    setMsgs((m) => [...m, { from: 'ia', text: answer }]);
  };

  return (
    <div className="space-y-6">
      <PageIntro title="Assistant IA" text="Vos réponses RH, 24h/24. Vos échanges restent confidentiels." action={<Badge tone="powder">Confidentiel</Badge>} />

      <Card className="flex h-[540px] flex-col p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {msgs.map((m, i) => (
            <div key={i} className={cx('flex gap-3', m.from === 'me' && 'flex-row-reverse')}>
              {m.from === 'ia' && <IconBubble name="Sparkle" tone="powder" />}
              <div className={cx('max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed', m.from === 'ia' ? 'bg-wash text-prune' : 'bg-powder text-white')}>
                {m.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex gap-3">
              <IconBubble name="Sparkle" tone="powder" />
              <div className="flex items-center rounded-2xl bg-wash px-4 py-3 text-mauve"><Spinner /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="border-t border-line p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {chips.map((c) => (
              <button key={c} onClick={() => send(c)} className="v-btn-secondary !px-3 !py-1.5 text-xs">{c}</button>
            ))}
          </div>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Votre question…" className="v-input" />
            <Button type="submit" icon="ArrowRight" loading={thinking}>Envoyer</Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
