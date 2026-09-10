import { Card, PageIntro, Table, Badge, Button, IconEl, IconBubble } from '../../components/ui';
import { dateShort } from '../../lib/format';

const docs = [
  { name: 'Modèle — Attestation employeur', cat: 'Modèle', updated: '2026-06-01', uses: 42 },
  { name: 'Modèle — Avenant temps partiel', cat: 'Modèle', updated: '2026-04-18', uses: 7 },
  { name: 'Note interne — Télétravail 2026', cat: 'Note', updated: '2026-01-12', uses: 142 },
  { name: 'Accord d’entreprise — Forfait jours', cat: 'Accord', updated: '2025-11-30', uses: 30 },
  { name: 'Règlement intérieur', cat: 'Obligatoire', updated: '2025-09-02', uses: 142 },
  { name: 'DUERP — Document unique', cat: 'Obligatoire', updated: '2025-08-20', uses: 1 },
];

const catTone: Record<string, 'sage' | 'peach' | 'powder' | 'neutral'> = {
  'Modèle': 'sage',
  Note: 'peach',
  Accord: 'powder',
  Obligatoire: 'neutral',
};

export default function Documents() {
  return (
    <div className="space-y-6">
      <PageIntro
        title="Documents RH"
        text="Coffre-fort, modèles personnalisables et archivage à valeur probante. Diffusion en un clic aux salariés concernés."
        action={<Button icon="Plus">Importer un document</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { i: 'DocText' as const, k: 'Documents', v: '318' },
          { i: 'Lock' as const, k: 'Coffre-fort salariés', v: '142' },
          { i: 'Sparkle' as const, k: 'Générés par l’IA ce mois', v: '27' },
        ].map((s) => (
          <Card key={s.k} className="flex items-center gap-4">
            <IconBubble name={s.i} />
            <div>
              <p className="font-heading text-xs uppercase tracking-wide text-mauve">{s.k}</p>
              <p className="v-stat">{s.v}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="mb-4 text-lg">Bibliothèque</h3>
        <Table head={['Document', 'Catégorie', 'Mis à jour', 'Diffusions', '']}>
          {docs.map((d) => (
            <tr key={d.name} className="text-prune hover:bg-wash">
              <td className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <IconEl name="DocText" size={18} className="text-mauve" />
                  <span className="font-heading text-sm">{d.name}</span>
                </div>
              </td>
              <td className="px-3 py-3"><Badge tone={catTone[d.cat]}>{d.cat}</Badge></td>
              <td className="px-3 py-3 font-mono text-xs text-mauve">{dateShort(d.updated)}</td>
              <td className="px-3 py-3 font-mono text-sm">{d.uses}</td>
              <td className="px-3 py-3 text-right">
                <button className="v-btn-ghost !px-2 !py-1.5"><IconEl name="Download" size={16} /></button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
