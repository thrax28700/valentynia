import { useMemo, useState } from 'react';
import { Card, PageIntro, Table, Badge, StatusBadge, Button, Stat, IconEl, IconBubble, Modal, Field, useAsync, cx } from '../../components/ui';
import { useStore } from '../../lib/store';
import { billing } from '../../lib/api';
import { buildCiiXml, computeTotals, type FxLine } from '../../lib/facturx';
import { download } from '../../lib/download';
import { eur, eur2, dateShort } from '../../lib/format';
import { company } from '../../data/mock';

type Tab = 'factures' | 'ppf' | 'archivage' | 'journal' | 'relances';
const TABS: [Tab, string][] = [
  ['factures', 'Factures'],
  ['ppf', 'Suivi PPF'],
  ['archivage', 'Archivage légal'],
  ['journal', 'Journal anti-fraude'],
  ['relances', 'Relances'],
];

const blankLine = (): FxLine => ({ label: '', qty: 1, unitPrice: 0, vatRate: 20 });
const canSendPpf = (s: string) => s !== 'Encaissée';

export default function Billing() {
  const invoices = useStore((d) => d.invoices);
  const [tab, setTab] = useState<Tab>('factures');
  const [modal, setModal] = useState(false);
  const [head, setHead] = useState({ client: '', clientSiren: '', issued: new Date().toISOString().slice(0, 10), due: '' });
  const [lines, setLines] = useState<FxLine[]>([blankLine()]);
  const create = useAsync(billing.createInvoice);
  const send = useAsync(billing.sendToPpf);

  const totals = useMemo(() => computeTotals(lines), [lines]);
  const outstanding = invoices.filter((i) => !i.paid).reduce((s, i) => s + i.amount, 0);
  const ppfOk = invoices.filter((i) => ['Acceptée', 'Encaissée'].includes(i.ppf)).length;

  const setLine = (idx: number, patch: Partial<FxLine>) =>
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.run({ ...head, clientSiren: head.clientSiren || undefined, lines });
    setHead({ client: '', clientSiren: '', issued: head.issued, due: '' });
    setLines([blankLine()]);
    setModal(false);
    setTab('factures');
  };

  const dl = (id: string) => {
    const v = invoices.find((x) => x.id === id);
    if (!v) return;
    const xml = v.xml ?? buildCiiXml({
      number: v.id, issueDate: v.issued, dueDate: v.due,
      seller: { name: company.name, siren: company.siren.replace(/\s/g, '') },
      buyer: { name: v.client, siren: v.clientSiren },
      lines: v.lines,
    });
    download(`facturx-${v.id}.xml`, xml, 'application/xml');
  };

  return (
    <div className="space-y-6">
      <PageIntro
        title="Facturation — réforme 2026"
        text="Créez une facture : le XML Factur-X (EN 16931) est généré, empreinté SHA-256, puis transmis au PPF (simulation)."
        action={<Button icon="Plus" onClick={() => setModal(true)}>Créer une facture Factur-X</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Factures" value={String(invoices.length)} delta="Toutes périodes" />
        <Stat label="Encours client" value={eur.format(outstanding)} delta={`${invoices.filter((i) => !i.paid).length} ouvertes`} tone="down" />
        <Stat label="Acceptées / encaissées PPF" value={String(ppfOk)} delta="Cycle de vie normalisé" />
        <Stat label="Chiffre d'affaires TTC" value={eur.format(invoices.reduce((s, i) => s + i.amount, 0))} delta="Cumul" />
      </div>

      <Card>
        <div className="mb-5 flex flex-wrap gap-1 rounded-full bg-wash p-1">
          {TABS.map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cx('rounded-full px-4 py-2 font-heading text-xs transition', tab === k ? 'bg-white text-prune shadow-soft' : 'text-mauve')}
            >
              {label}
            </button>
          ))}
        </div>

        {(tab === 'factures' || tab === 'ppf') && (
          <Table head={['N°', 'Client', 'Montant TTC', 'Émission', tab === 'ppf' ? 'Statut PPF' : 'Paiement', 'Actions']}>
            {invoices.map((inv) => (
              <tr key={inv.id} className="text-prune hover:bg-wash">
                <td className="px-3 py-3 font-mono text-sm">{inv.id}</td>
                <td className="px-3 py-3">{inv.client}</td>
                <td className="px-3 py-3 font-mono text-sm">{eur2.format(inv.amount)}</td>
                <td className="px-3 py-3 font-mono text-xs text-mauve">{dateShort(inv.issued)}</td>
                <td className="px-3 py-3">
                  {tab === 'ppf' ? <StatusBadge status={inv.ppf} /> : <Badge tone={inv.paid ? 'sage' : 'neutral'}>{inv.paid ? 'Payée' : 'En attente'}</Badge>}
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-1.5">
                    <button className="v-btn-ghost !px-2 !py-1.5" title="Télécharger le XML Factur-X" onClick={() => dl(inv.id)}>
                      <IconEl name="Download" size={15} />
                    </button>
                    {canSendPpf(inv.ppf) && (
                      <button
                        className="v-btn-secondary !px-3 !py-1.5 text-xs"
                        disabled={send.loading}
                        onClick={() => send.run(inv.id)}
                        title="Faire avancer le cycle de vie PPF"
                      >
                        <IconEl name="Bolt" size={13} />
                        {inv.ppf === 'Brouillon' ? 'Transmettre au PPF' : inv.ppf === 'Rejetée' ? 'Renvoyer' : 'Étape suivante'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}

        {tab === 'archivage' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { i: 'Lock' as const, t: 'Conservation 10 ans', d: 'Factures émises et reçues archivées à valeur probante, horodatées et scellées.' },
              { i: 'Shield' as const, t: 'Empreinte SHA-256', d: 'Chaque facture porte une empreinte vérifiable (visible dans le journal).' },
              { i: 'DocText' as const, t: 'Piste d’audit fiable', d: 'Lien commande → livraison → facture tracé de bout en bout.' },
              { i: 'Download' as const, t: 'Export sur demande', d: 'Export au format réglementaire en cas de contrôle.' },
            ].map((c) => (
              <div key={c.t} className="flex gap-4 rounded-xl bg-wash p-4">
                <IconBubble name={c.i} tone="sage" />
                <div>
                  <p className="font-heading text-sm font-medium text-prune">{c.t}</p>
                  <p className="mt-1 text-xs leading-relaxed text-mauve">{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'journal' && (
          <>
            <p className="mb-4 text-sm text-mauve">Journal chaîné : chaque facture émise y est inscrite avec son empreinte.</p>
            <Table head={['Facture', 'Client', 'TTC', 'Empreinte SHA-256', 'Statut PPF']}>
              {invoices.map((v) => (
                <tr key={v.id} className="text-prune">
                  <td className="px-3 py-3 font-mono text-sm">{v.id}</td>
                  <td className="px-3 py-3">{v.client}</td>
                  <td className="px-3 py-3 font-mono text-xs">{eur2.format(v.amount)}</td>
                  <td className="px-3 py-3 font-mono text-xs text-mauve">{(v.sha256 ?? '—').slice(0, 16)}…</td>
                  <td className="px-3 py-3"><StatusBadge status={v.ppf} /></td>
                </tr>
              ))}
            </Table>
          </>
        )}

        {tab === 'relances' && (
          <div className="space-y-3">
            {[
              { step: 'J+3 après échéance', text: 'Rappel courtois par e-mail, facture Factur-X jointe.' },
              { step: 'J+10', text: 'Relance ferme + proposition d’échéancier. Notification au commercial.' },
              { step: 'J+21', text: 'Mise en demeure générée automatiquement, à valider avant envoi.' },
            ].map((r) => (
              <div key={r.step} className="flex items-start gap-4 rounded-xl bg-wash p-4">
                <Badge tone="neutral">{r.step}</Badge>
                <p className="text-sm text-mauve">{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Nouvelle facture Factur-X">
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Client" value={head.client} onChange={(v) => setHead({ ...head, client: v })} required />
            <Field label="SIREN client (option)" value={head.clientSiren} onChange={(v) => setHead({ ...head, clientSiren: v })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date d'émission" type="date" value={head.issued} onChange={(v) => setHead({ ...head, issued: v })} required />
            <Field label="Échéance" type="date" value={head.due} onChange={(v) => setHead({ ...head, due: v })} required />
          </div>

          <div className="space-y-2">
            <span className="v-label">Lignes</span>
            {lines.map((l, i) => (
              <div key={i} className="grid grid-cols-[1fr_64px_92px_64px_32px] items-center gap-2">
                <input className="v-input" placeholder="Désignation" value={l.label} onChange={(e) => setLine(i, { label: e.target.value })} required />
                <input className="v-input text-right font-mono" type="number" min="0" step="0.01" value={l.qty} onChange={(e) => setLine(i, { qty: +e.target.value })} />
                <input className="v-input text-right font-mono" type="number" min="0" step="0.01" placeholder="PU HT" value={l.unitPrice} onChange={(e) => setLine(i, { unitPrice: +e.target.value })} />
                <input className="v-input text-right font-mono" type="number" min="0" step="0.1" value={l.vatRate} onChange={(e) => setLine(i, { vatRate: +e.target.value })} />
                <button type="button" className="v-btn-ghost !p-1.5" onClick={() => setLines((ls) => ls.filter((_, x) => x !== i))} disabled={lines.length === 1}>
                  <IconEl name="Close" size={14} />
                </button>
              </div>
            ))}
            <button type="button" className="v-btn-ghost !px-2 !py-1.5 text-xs" onClick={() => setLines((ls) => [...ls, blankLine()])}>
              <IconEl name="Plus" size={13} />Ajouter une ligne
            </button>
          </div>

          <div className="rounded-xl bg-wash p-3 text-sm">
            <div className="flex justify-between text-mauve"><span>Total HT</span><span className="font-mono">{eur2.format(totals.totalHT)}</span></div>
            <div className="flex justify-between text-mauve"><span>TVA</span><span className="font-mono">{eur2.format(totals.tva)}</span></div>
            <div className="mt-1 flex justify-between font-heading font-semibold text-prune"><span>Total TTC</span><span className="font-mono">{eur2.format(totals.totalTTC)}</span></div>
          </div>

          {create.error && <p className="text-xs text-powderdark">{create.error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setModal(false)}>Annuler</Button>
            <Button type="submit" icon="Receipt" loading={create.loading}>Générer la facture</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
