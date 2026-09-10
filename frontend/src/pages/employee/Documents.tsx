import { Card, PageIntro, Table, Badge, IconEl, EmptyState } from '../../components/ui';
import { useStore } from '../../lib/store';
import { useAuth } from '../../lib/auth';
import { download } from '../../lib/download';
import { dateShort } from '../../lib/format';

export default function EmpDocuments() {
  const { user } = useAuth();
  const documents = useStore((d) => d.documents);
  const employees = useStore((d) => d.employees);
  const emp = employees.find((e) => e.id === user?.employeeId);
  const mine = documents.filter((d) => !d.employeeId || d.employeeId === emp?.id);

  const grab = (name: string, type: string, date: string) =>
    download(
      `${name.toLowerCase().replace(/\s+/g, '-')}.txt`,
      `VALENTYNIA — Coffre-fort salarié\n\n${type} : ${name}\nSalarié : ${emp?.name}\nDate : ${dateShort(date)}\n\n(Document de démonstration — archivage à valeur probante.)`,
    );

  return (
    <div className="space-y-6">
      <PageIntro title="Mes documents" text="Coffre-fort personnel : contrats, avenants et attestations, disponibles à tout moment." />
      <Card>
        {mine.length === 0 ? (
          <EmptyState icon="DocText" title="Aucun document" />
        ) : (
          <Table head={['Document', 'Type', 'Date', '']}>
            {mine.map((d) => (
              <tr key={d.id} className="text-prune hover:bg-wash">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <IconEl name="DocText" size={18} className="text-mauve" />
                    <span className="font-heading text-sm">{d.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3"><Badge tone="neutral">{d.type}</Badge></td>
                <td className="px-3 py-3 font-mono text-xs text-mauve">{dateShort(d.date)}</td>
                <td className="px-3 py-3 text-right">
                  <button className="v-btn-ghost !px-2 !py-1.5" onClick={() => grab(d.name, d.type, d.date)}>
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
