import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { encrypt } from '../lib/crypto';
import { appendVatJournal } from '../lib/vatJournal';

async function main() {
  console.log('🌱 Amorçage des données de démonstration Valentynia…');

  const company = await prisma.company.upsert({
    where: { siren: '812456789' },
    update: {},
    create: {
      name: 'Atelier Lumen',
      siren: '812456789',
      collectiveAgreement: 'Bureaux d’études techniques (Syntec)',
      plan: 'BUSINESS',
    },
  });

  const passwordHash = await bcrypt.hash('demo1234', 12);
  await prisma.user.upsert({
    where: { email: 'camille.ferrand@atelier-lumen.fr' },
    update: {},
    create: {
      email: 'camille.ferrand@atelier-lumen.fr',
      passwordHash,
      firstName: 'Camille',
      lastName: 'Ferrand',
      role: 'ADMIN',
      companyId: company.id,
    },
  });

  const employees = [
    { firstName: 'Yanis', lastName: 'Moreau', jobTitle: 'Développeur produit', department: 'Tech', contractType: 'CDI' as const, startDate: new Date('2022-09-05') },
    { firstName: 'Sofia', lastName: 'Renault', jobTitle: 'Chargée ADV', department: 'Finance', contractType: 'CDI' as const, startDate: new Date('2021-01-18') },
    { firstName: 'Thomas', lastName: 'Lefèvre', jobTitle: 'Designer', department: 'Produit', contractType: 'CDD' as const, startDate: new Date('2025-02-03') },
  ];

  for (const e of employees) {
    await prisma.employee.create({
      data: {
        ...e,
        companyId: company.id,
        email: `${e.firstName.toLowerCase()}.${e.lastName.toLowerCase()}@atelier-lumen.fr`,
        status: 'ACTIVE',
        ibanEncrypted: encrypt('FR7630006000011234567890189'),
      },
    });
  }

  await prisma.legalAlert.createMany({
    data: [
      { companyId: company.id, level: 'HIGH', title: 'DUERP à mettre à jour', detail: 'Dernière mise à jour il y a 13 mois — obligation annuelle.', dueDate: new Date('2026-09-30') },
      { companyId: company.id, level: 'MEDIUM', title: 'Entretiens professionnels', detail: '6 salariés arrivent à l’échéance des 2 ans.', dueDate: new Date('2026-10-15') },
      { companyId: company.id, level: 'MEDIUM', title: 'Registre RGPD', detail: '2 traitements sans durée de conservation renseignée.', dueDate: new Date('2026-09-20') },
    ],
  });

  await prisma.aiInsight.createMany({
    data: [
      { companyId: company.id, kind: 'signal_faible', title: 'Signal faible — équipe Production', body: 'Baisse des validations de planning et hausse des heures supplémentaires sur 3 semaines.', severity: 'MEDIUM' },
      { companyId: company.id, kind: 'prevision_absences', title: 'Prévision d’absences — Octobre', body: 'Pic attendu semaine 42 (vacances scolaires).', severity: 'LOW' },
      { companyId: company.id, kind: 'climat', title: 'Climat social', body: 'Moral global stable (indice 7,4/10). L’item « reconnaissance » progresse.', severity: 'LOW' },
    ],
  });

  await appendVatJournal(company.id, 'SEED', { note: 'Initialisation du journal anti-fraude TVA' });

  console.log('✅ Terminé. Connexion : camille.ferrand@atelier-lumen.fr / demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
