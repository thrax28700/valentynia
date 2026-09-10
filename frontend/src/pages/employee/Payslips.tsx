import { Card, PageIntro, Table, IconEl, EmptyState } from '../../components/ui';
import { useStore } from '../../lib/store';
import { useAuth } from '../../lib/auth';
import { download } from '../../lib/download';
import { eur2, dateShort } from '../../lib/format';

export default function EmpPayslips() {
  const { user } = useAuth();
  const payslips = useStore((d) => d.payslips);
  const employees = useStore((d) => d.employees);
  const emp = employees.find((e) => e.id === user?.employeeId);
  const mine = payslips.filter((p) => p.employeeId === emp?.id);

  const grab = (period: string, net: number) =>
    download(
      `bulletin-${period.toLowerCase().replace(/\s+/g, '-')}.txt`,
      `VALENTYNIA — Bulletin de paie\n\nSalarié : ${emp?.name}\nPériode : ${period}\nNet à payer : ${eur2.format(net)}\n\n(Bulletin de démonstration — conservé à valeur probante.)`,
    );

  return (
    <div className="space-y-6">
      <PageIntro title="Mes bulletins de paie" text="Tous vos bulletins, archivés à valeur probante pendant toute votre carrière." />
      <Card>
        {mine.length === 0 ? (
          <EmptyState icon="Receipt" title="Aucun bulletin" />
        ) : (
          <Table head={['Période', 'Net à payer', 'Disponible le', '']}>
            {mine.map((p) => (
              <tr key={p.id} className="text-prune hover:bg-wash">
                <td className="px-3 py-3 font-heading text-sm font-medium">{p.period}</td>
                <td className="px-3 py-3 font-mono text-sm">{eur2.format(p.net)}</td>
                <td className="px-3 py-3 font-mono text-xs text-mauve">{dateShort(p.date)}</td>
                <td className="px-3 py-3 text-right">
                  <button className="v-btn-secondary !px-3 !py-1.5 text-xs" onClick={() => grab(p.period, p.net)}>
                    <IconEl name="Download" size={14} />PDF
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
