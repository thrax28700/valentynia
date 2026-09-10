import { Card, PageIntro, Table, Badge, IconEl, EmptyState } from '../../components/ui';
import { useDocuments } from '../../lib/api';
import { download } from '../../lib/download';
import { dateShort } from '../../lib/format';

export default function EmpDocuments() {
  const { data: docs = [], isLoading } = useDocuments({ mine: true });

  const grab = (title: string, category: string, date: string) =>
    download(
      `${title.toLowerCase().replace(/\s+/g, '-')}.txt`,
      `VALENTYNIA — Coffre-fort salarié\n\n${category} : ${title}\nDate : ${dateShort(date)}\n\n(Document de démonstration — archivage à valeur probante.)`,
    );

  return (
    <div className="space-y-6">
      <PageIntro
        title="Mes documents"
        text="Coffre-fort personnel : contrats, avenants et attestations, disponibles à tout moment."
      />
      <Card>
        {isLoading ? (
          <p className="py-8 text-center text-sm text-mauve">Chargement…</p>
        ) : docs.length === 0 ? (
          <EmptyState icon="DocText" title="Aucun document" />
        ) : (
          <Table head={['Document', 'Type', 'Date', '']}>
            {docs.map((d) => (
              <tr key={d.id} className="text-prune hover:bg-wash">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <IconEl name="DocText" size={18} className="text-mauve" />
                    <span className="font-heading text-sm">{d.title}</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <Badge tone="neutral">{d.category}</Badge>
                </td>
                <td className="px-3 py-3 font-mono text-xs text-mauve">{dateShort(d.createdAt)}</td>
                <td className="px-3 py-3 text-right">
                  <button
                    className="v-btn-ghost !px-2 !py-1.5"
                    onClick={() => grab(d.title, d.category, d.createdAt)}
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
        <IconEl name="Lock" size={13} /> Documents chiffrés · accès réservé à vous et au service RH.
      </p>
    </div>
  );
}
