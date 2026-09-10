import { useEffect, useRef, useState } from 'react';
import { Card, PageIntro, Badge, Button, Field, IconEl, IconBubble, Spinner, cx } from '../../components/ui';
import { useStore } from '../../lib/store';
import { ai } from '../../lib/api';
import { download } from '../../lib/download';
import { aiFeatures } from '../../data/mock';

type Msg = { from: 'ia' | 'me'; text: string };
const suggestions = [
  'Quels risques d’absences en octobre ?',
  'Prépare une attestation employeur',
  'Fais le point sur le moral des équipes',
];

export default function AIAssistant() {
  const [tab, setTab] = useState<'chat' | 'documents' | 'analyses'>('chat');
  const insights = useStore((d) => d.insights);
  const employees = useStore((d) => d.employees);

  const [msgs, setMsgs] = useState<Msg[]>([
    { from: 'ia', text: "Bonjour. Je suis l'assistante RH de Valentynia. Comment puis-je vous aider aujourd'hui, en douceur ?" },
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

  // Génération de documents
  const [empId, setEmpId] = useState(employees[0]?.id ?? '');
  const [kind, setKind] = useState('attestation');
  const [doc, setDoc] = useState('');
  const [gen, setGen] = useState(false);
  const generate = async () => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;
    setGen(true);
    const content = await ai.generateDocument(kind, {
      employee: emp.name, role: emp.role, contract: emp.contract, since: emp.since,
    });
    setGen(false);
    setDoc(content);
  };

  return (
    <div className="space-y-6">
      <PageIntro
        title="Assistant IA RH"
        text="Ton calme, professionnel et rassurant. L'assistante prépare, éclaire et propose — vous décidez."
        action={<Badge tone="powder">Confidentiel · aucune donnée partagée</Badge>}
      />

      <div className="flex flex-wrap gap-1 rounded-full bg-wash p-1">
        {(['chat', 'documents', 'analyses'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cx('rounded-full px-4 py-2 font-heading text-sm capitalize transition', tab === k ? 'bg-white text-prune shadow-soft' : 'text-mauve')}
          >
            {k === 'chat' ? 'Conversation' : k === 'documents' ? 'Documents RH' : 'Analyses RH'}
          </button>
        ))}
      </div>

      {tab === 'chat' && (
        <Card className="flex h-[560px] flex-col p-0">
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
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="v-btn-secondary !px-3 !py-1.5 text-xs">{s}</button>
              ))}
            </div>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(input); }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Écrivez votre demande…" className="v-input" />
              <Button type="submit" icon="ArrowRight" loading={thinking}>Envoyer</Button>
            </form>
          </div>
        </Card>
      )}

      {tab === 'documents' && (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card>
            <h3 className="text-lg">Générer un document</h3>
            <div className="mt-4 space-y-4">
              <Field label="Salarié" value={empId} onChange={setEmpId} options={employees.map((e) => ({ value: e.id, label: e.name }))} />
              <Field
                label="Type"
                value={kind}
                onChange={setKind}
                options={[
                  { value: 'attestation', label: 'Attestation de travail' },
                  { value: 'avenant', label: 'Courrier / avenant' },
                ]}
              />
              <Button icon="Sparkle" onClick={generate} loading={gen} className="w-full">Rédiger</Button>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-lg">Aperçu</h3>
              {doc && (
                <Button variant="secondary" icon="Download" onClick={() => download(`${kind}.txt`, doc)}>Télécharger</Button>
              )}
            </div>
            <pre className="mt-4 min-h-64 whitespace-pre-wrap rounded-xl bg-wash p-4 font-mono text-xs leading-relaxed text-prune">
              {doc || 'Le document généré apparaîtra ici.'}
            </pre>
          </Card>
        </div>
      )}

      {tab === 'analyses' && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {insights.map((i) => (
            <Card key={i.id}>
              <IconEl name="Sparkle" size={18} className="text-powder" />
              <h3 className="mt-3 text-base">{i.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mauve">{i.text}</p>
            </Card>
          ))}
          {aiFeatures.slice(6).map((f) => (
            <Card key={f.title}>
              <IconBubble name={f.icon} tone="peach" />
              <h3 className="mt-3 text-base">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mauve">{f.desc}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
