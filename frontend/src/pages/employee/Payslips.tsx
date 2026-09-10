import { Card, PageIntro, Table, IconEl, EmptyState } from '../../components/ui';
import { usePayslips } from '../../lib/api';
import { download } from '../../lib/download';
import { eur2, dateShort } from '../../lib/format';

export default function EmpPayslips() {
  const { data: payslips = [], isLoading } = usePayslips({ mine: true });

  const grab = (period: string, net: number) =>
    download(
      `bulletin-${period.toLowerCase().replace(/\s+/g, '-')}.txt`,
      `VALENTYNIA — Bulletin de paie\n\nPériode : ${period}\nNet à payer : ${eur2.format(net)}\n\n(Bulletin de démonstration — conservé à valeur probante.)`,
    );

  return (
    <div className="space-y-6">
      <PageIntro
        title="Mes bulletins de paie"
        text="Tous vos bulletins, archivés à valeur probante pendant toute votre carrière."
      />
      <Card>
        {isLoading ? (
          <p className="py-8 text-center text-sm text-mauve">Chargement…</p>
        ) : payslips.length === 0 ? (
          <EmptyState icon="Receipt" title="Aucun bulletin" />
        ) : (
          <Table head={['Période', 'Net à payer', 'Disponible le', '']}>
            {payslips.map((p) => (
              <tr key={p.id} className="text-prune hover:bg-wash">
                <td className="px-3 py-3 font-heading text-sm font-medium">{p.period}</td>
                <td className="px-3 py-3 font-mono text-sm">{eur2.format(p.netAmount)}</td>
                <td className="px-3 py-3 font-mono text-xs text-mauve">{dateShort(p.releasedAt)}</td>
                <td className="px-3 py-3 text-right">
                  <button
                    className="v-btn-secondary !px-3 !py-1.5 text-xs"
                    onClick={() => grab(p.period, p.netAmount)}
                  >
                    <IconEl name="Download" size={14} />
                    PDF
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
