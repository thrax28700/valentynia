import { Card, PageIntro, Table, Badge, IconEl, IconBubble } from '../../components/ui';
import { useDocumentTemplates } from '../../lib/api';
import { download } from '../../lib/download';
import { dateShort } from '../../lib/format';

const catTone: Record<string, 'sage' | 'peach' | 'powder' | 'neutral'> = {
  Modèle: 'sage',
  Note: 'peach',
  Accord: 'powder',
  Obligatoire: 'neutral',
};

export default function Documents() {
  const { data: templates = [], isLoading } = useDocumentTemplates();
  const totalUses = templates.reduce((s, t) => s + t.uses, 0);

  const grab = (name: string, category: string, updatedAt: string) =>
    download(
      `${name.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.txt`,
      `VALENTYNIA — Bibliothèque documentaire\n\n${category} : ${name}\nDernière mise à jour : ${dateShort(updatedAt)}\n\n(Modèle de démonstration — le contenu réel serait un document DOCX/PDF versionné.)`,
    );

  return (
    <div className="space-y-6">
      <PageIntro
        title="Documents RH"
        text="Bibliothèque de modèles, notes internes et accords d’entreprise, avec suivi des diffusions."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { i: 'DocText' as const, k: 'Modèles & documents', v: String(templates.length) },
          { i: 'Lock' as const, k: 'Diffusions cumulées', v: String(totalUses) },
          {
            i: 'Sparkle' as const,
            k: 'Documents obligatoires',
            v: String(templates.filter((t) => t.category === 'Obligatoire').length),
          },
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
        {isLoading ? (
          <p className="py-8 text-center text-sm text-mauve">Chargement…</p>
        ) : (
          <Table head={['Document', 'Catégorie', 'Mis à jour', 'Diffusions', '']}>
            {templates.map((d) => (
              <tr key={d.id} className="text-prune hover:bg-wash">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <IconEl name="DocText" size={18} className="text-mauve" />
                    <span className="font-heading text-sm">{d.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <Badge tone={catTone[d.category] ?? 'neutral'}>{d.category}</Badge>
                </td>
                <td className="px-3 py-3 font-mono text-xs text-mauve">{dateShort(d.updatedAt)}</td>
                <td className="px-3 py-3 font-mono text-sm">{d.uses}</td>
                <td className="px-3 py-3 text-right">
                  <button
                    className="v-btn-ghost !px-2 !py-1.5"
                    title="Télécharger"
                    onClick={() => grab(d.name, d.category, d.updatedAt)}
                  >
                    <IconEl name="Download" size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <p className="flex items-center gap-2 text-xs text-mauve">
        <IconEl name="Sparkle" size={13} className="text-powder" />
        Besoin d’un document nominatif (attestation, avenant) ? Générez-le depuis l’Assistant IA RH.
      </p>
    </div>
  );
}
