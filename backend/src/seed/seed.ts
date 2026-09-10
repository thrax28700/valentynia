import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { encrypt } from '../lib/crypto';
import { appendVatJournal } from '../lib/vatJournal';
import { generateFacturx } from '../lib/facturx';

/**
 * Amorçage complet de la base de démonstration Valentynia.
 * Le script est ré-exécutable : il purge les données puis les recrée.
 */

const DEMO_IBAN = 'FR7630006000011234567890189';
const d = (iso: string) => new Date(iso);

async function purge() {
  // Ordre respectant les clés étrangères (les cascades couvrent le reste).
  await prisma.activityLog.deleteMany();
  await prisma.vatJournalEntry.deleteMany();
  await prisma.ppfEvent.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.aiInsight.deleteMany();
  await prisma.legalAlert.deleteMany();
  await prisma.documentTemplate.deleteMany();
  await prisma.reviewCampaign.deleteMany();
  await prisma.developmentPlan.deleteMany();
  await prisma.onboardingTask.deleteMany();
  await prisma.onboardingJourney.deleteMany();
  await prisma.employeeRequest.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.payslip.deleteMany();
  await prisma.employeeSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.review.deleteMany();
  await prisma.hrDocument.deleteMany();
  await prisma.absence.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.company.deleteMany();
}

export async function seedDatabase({ quiet = false } = {}) {
  const log = quiet ? () => {} : console.log;
  log('🌱 Amorçage des données de démonstration Valentynia…');
  await purge();

  const company = await prisma.company.create({
    data: {
      name: 'Atelier Lumen',
      siren: '812456789',
      address: '24 quai Saint-Vincent, 69001 Lyon',
      collectiveAgreement: 'Bureaux d’études techniques (Syntec)',
      weeklyHours: 35,
      plan: 'BUSINESS',
    },
  });

  // ---------------------------------------------------------------- Salariés
  const people = [
    { firstName: 'Camille', lastName: 'Ferrand', jobTitle: 'Directrice RH', department: 'Direction', contractType: 'CDI' as const, startDate: '2019-03-11', status: 'ACTIVE' as const, phone: '06 11 22 33 44', address: '5 rue Burdeau, 69001 Lyon', paidLeaveBalance: 18, rttBalance: 6, recoveryBalance: 0 },
    { firstName: 'Yanis', lastName: 'Moreau', jobTitle: 'Développeur produit', department: 'Tech', contractType: 'CDI' as const, startDate: '2022-09-05', status: 'ACTIVE' as const, phone: '06 12 34 56 78', address: '14 rue des Tilleuls, 69003 Lyon', paidLeaveBalance: 14.5, rttBalance: 3, recoveryBalance: 1 },
    { firstName: 'Sofia', lastName: 'Renault', jobTitle: 'Chargée ADV', department: 'Finance', contractType: 'CDI' as const, startDate: '2021-01-18', status: 'ACTIVE' as const, phone: '06 22 33 44 55', address: '2 place Sathonay, 69001 Lyon', paidLeaveBalance: 21, rttBalance: 4, recoveryBalance: 0 },
    { firstName: 'Thomas', lastName: 'Lefèvre', jobTitle: 'Designer', department: 'Produit', contractType: 'CDD' as const, startDate: '2026-02-03', status: 'PROBATION' as const, phone: '06 33 44 55 66', address: '8 rue de la Charité, 69002 Lyon', paidLeaveBalance: 4, rttBalance: 1, recoveryBalance: 0 },
    { firstName: 'Aïcha', lastName: 'Diallo', jobTitle: 'Comptable', department: 'Finance', contractType: 'CDI' as const, startDate: '2020-06-22', status: 'ACTIVE' as const, phone: '06 44 55 66 77', address: '19 rue Paul Bert, 69003 Lyon', paidLeaveBalance: 12, rttBalance: 2, recoveryBalance: 2 },
    { firstName: 'Marc', lastName: 'Bonnet', jobTitle: 'Responsable atelier', department: 'Production', contractType: 'CDI' as const, startDate: '2018-11-30', status: 'ON_LEAVE' as const, phone: '06 55 66 77 88', address: '3 montée de la Grande Côte, 69001 Lyon', paidLeaveBalance: 9, rttBalance: 5, recoveryBalance: 3 },
    { firstName: 'Léa', lastName: 'Nguyen', jobTitle: 'Alternante RH', department: 'Direction', contractType: 'ALTERNANCE' as const, startDate: '2026-09-15', status: 'ONBOARDING' as const, phone: '06 66 77 88 99', address: '11 rue d’Austerlitz, 69004 Lyon', paidLeaveBalance: 2, rttBalance: 0, recoveryBalance: 0 },
    { firstName: 'Hugo', lastName: 'Faure', jobTitle: 'Technicien', department: 'Production', contractType: 'CDI' as const, startDate: '2023-04-11', status: 'ACTIVE' as const, phone: '06 77 88 99 00', address: '27 rue Duviard, 69004 Lyon', paidLeaveBalance: 16, rttBalance: 3, recoveryBalance: 1 },
  ];

  const employees: Record<string, { id: string }> = {};
  for (const p of people) {
    const e = await prisma.employee.create({
      data: {
        companyId: company.id,
        firstName: p.firstName,
        lastName: p.lastName,
        email: `${p.firstName.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')}.${p.lastName.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')}@atelier-lumen.fr`,
        jobTitle: p.jobTitle,
        department: p.department,
        contractType: p.contractType,
        startDate: d(p.startDate),
        status: p.status,
        phone: p.phone,
        address: p.address,
        paidLeaveBalance: p.paidLeaveBalance,
        rttBalance: p.rttBalance,
        recoveryBalance: p.recoveryBalance,
        ibanEncrypted: encrypt(DEMO_IBAN),
        socialNumberEncrypted: encrypt('1 89 06 69 123 456 78'),
      },
    });
    employees[`${p.firstName} ${p.lastName}`] = e;
  }

  // Rattachement hiérarchique : tout le monde reporte à Camille sauf elle-même.
  const camille = employees['Camille Ferrand'];
  for (const [name, e] of Object.entries(employees)) {
    if (name !== 'Camille Ferrand') {
      await prisma.employee.update({ where: { id: e.id }, data: { managerId: camille.id } });
    }
  }

  // ---------------------------------------------------------------- Comptes
  const passwordHash = await bcrypt.hash('demo1234', 12);
  await prisma.user.create({
    data: {
      email: 'camille.ferrand@atelier-lumen.fr',
      passwordHash,
      firstName: 'Camille',
      lastName: 'Ferrand',
      role: 'ADMIN',
      companyId: company.id,
      employeeId: camille.id,
    },
  });
  await prisma.user.create({
    data: {
      email: 'sofia.renault@atelier-lumen.fr',
      passwordHash,
      firstName: 'Sofia',
      lastName: 'Renault',
      role: 'HR',
      companyId: company.id,
      employeeId: employees['Sofia Renault'].id,
    },
  });
  await prisma.user.create({
    data: {
      email: 'yanis.moreau@atelier-lumen.fr',
      passwordHash,
      firstName: 'Yanis',
      lastName: 'Moreau',
      role: 'EMPLOYEE',
      companyId: company.id,
      employeeId: employees['Yanis Moreau'].id,
    },
  });

  // ---------------------------------------------------------------- Absences
  await prisma.absence.createMany({
    data: [
      { employeeId: employees['Yanis Moreau'].id, type: 'PAID_LEAVE', startDate: d('2026-09-22'), endDate: d('2026-09-26'), days: 5, status: 'PENDING' },
      { employeeId: employees['Sofia Renault'].id, type: 'RTT', startDate: d('2026-09-12'), endDate: d('2026-09-12'), days: 1, status: 'PENDING' },
      { employeeId: employees['Aïcha Diallo'].id, type: 'UNPAID', startDate: d('2026-10-01'), endDate: d('2026-10-03'), days: 3, status: 'APPROVED', decidedById: camille.id, decidedAt: d('2026-09-04') },
      { employeeId: employees['Thomas Lefèvre'].id, type: 'SICK', startDate: d('2026-09-04'), endDate: d('2026-09-05'), days: 2, status: 'RECORDED' },
      { employeeId: employees['Marc Bonnet'].id, type: 'PAID_LEAVE', startDate: d('2026-09-01'), endDate: d('2026-09-15'), days: 11, status: 'APPROVED', decidedById: camille.id, decidedAt: d('2026-08-20') },
      { employeeId: employees['Hugo Faure'].id, type: 'FAMILY', startDate: d('2026-08-18'), endDate: d('2026-08-18'), days: 1, status: 'REFUSED', decidedById: camille.id, decidedAt: d('2026-08-10') },
    ],
  });

  // ---------------------------------------------------------------- Plannings (semaine du 8 sept.)
  const week = ['2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12'];
  const locations = ['Bureau', 'Télétravail', 'Atelier', 'Bureau', 'Télétravail'];
  const planningPeople = ['Camille Ferrand', 'Yanis Moreau', 'Sofia Renault', 'Aïcha Diallo', 'Hugo Faure'];
  for (let ri = 0; ri < planningPeople.length; ri++) {
    for (let ci = 0; ci < week.length; ci++) {
      const loc = locations[(ri + ci) % locations.length];
      await prisma.shift.create({
        data: {
          employeeId: employees[planningPeople[ri]].id,
          date: d(week[ci]),
          startTime: '09:00',
          endTime: loc === 'Télétravail' && ci === 4 ? '16:00' : '17:30',
          location: loc,
        },
      });
    }
  }

  // ---------------------------------------------------------------- Bulletins de paie
  const payPeriods = [
    { period: 'Août 2026', net: 2685.4, releasedAt: '2026-08-28' },
    { period: 'Juillet 2026', net: 2685.4, releasedAt: '2026-07-29' },
    { period: 'Juin 2026', net: 2712.9, releasedAt: '2026-06-27' },
    { period: 'Mai 2026', net: 2685.4, releasedAt: '2026-05-28' },
  ];
  for (const empName of ['Yanis Moreau', 'Sofia Renault', 'Aïcha Diallo']) {
    for (const p of payPeriods) {
      await prisma.payslip.create({
        data: {
          employeeId: employees[empName].id,
          period: p.period,
          netAmount: p.net,
          storageKey: `payslips/${employees[empName].id}/${p.period}`,
          sha256: 'demo',
          releasedAt: d(p.releasedAt),
        },
      });
    }
  }

  // ---------------------------------------------------------------- Documents salarié + bibliothèque
  const empDocs = [
    { emp: 'Yanis Moreau', title: 'Contrat de travail', category: 'Contrat', createdAt: '2022-09-05' },
    { emp: 'Yanis Moreau', title: 'Avenant télétravail', category: 'Avenant', createdAt: '2023-04-01' },
    { emp: 'Yanis Moreau', title: 'Attestation employeur', category: 'Attestation', createdAt: '2026-06-12' },
    { emp: 'Sofia Renault', title: 'Contrat de travail', category: 'Contrat', createdAt: '2021-01-18' },
    { emp: 'Thomas Lefèvre', title: 'Contrat CDD', category: 'Contrat', createdAt: '2026-02-03' },
  ];
  for (const doc of empDocs) {
    await prisma.hrDocument.create({
      data: {
        employeeId: employees[doc.emp].id,
        title: doc.title,
        category: doc.category,
        storageKey: `docs/${doc.title}`,
        sha256: 'demo',
        createdAt: d(doc.createdAt),
      },
    });
  }

  await prisma.documentTemplate.createMany({
    data: [
      { companyId: company.id, name: 'Modèle — Attestation employeur', category: 'Modèle', uses: 42, updatedAt: d('2026-06-01') },
      { companyId: company.id, name: 'Modèle — Avenant temps partiel', category: 'Modèle', uses: 7, updatedAt: d('2026-04-18') },
      { companyId: company.id, name: 'Note interne — Télétravail 2026', category: 'Note', uses: 142, updatedAt: d('2026-01-12') },
      { companyId: company.id, name: 'Accord d’entreprise — Forfait jours', category: 'Accord', uses: 30, updatedAt: d('2025-11-30') },
      { companyId: company.id, name: 'Règlement intérieur', category: 'Obligatoire', uses: 142, updatedAt: d('2025-09-02') },
      { companyId: company.id, name: 'DUERP — Document unique', category: 'Obligatoire', uses: 1, updatedAt: d('2025-08-20') },
    ],
  });

  // ---------------------------------------------------------------- Entretiens
  await prisma.reviewCampaign.createMany({
    data: [
      { companyId: company.id, name: 'Entretiens annuels 2026', type: 'annuel', deadline: d('2026-11-30'), total: 142, done: 98, status: 'En cours' },
      { companyId: company.id, name: 'Entretiens professionnels (2 ans)', type: 'professionnel', deadline: d('2026-10-15'), total: 18, done: 12, status: 'En cours' },
      { companyId: company.id, name: 'Point mi-année — managers', type: 'mi-année', deadline: d('2026-06-30'), total: 24, done: 24, status: 'Clôturée' },
    ],
  });
  await prisma.review.createMany({
    data: [
      { employeeId: employees['Yanis Moreau'].id, campaign: 'Entretiens annuels 2026', type: 'annuel', scheduledAt: d('2026-09-12') },
      { employeeId: employees['Sofia Renault'].id, campaign: 'Entretiens professionnels (2 ans)', type: 'professionnel', scheduledAt: d('2026-09-15') },
      { employeeId: employees['Aïcha Diallo'].id, campaign: 'Entretiens annuels 2026', type: 'annuel', scheduledAt: d('2026-09-18') },
    ],
  });

  // ---------------------------------------------------------------- Compétences
  const skillNames = ['Gestion de projet', 'Design produit', 'Développement', 'Relation client', 'Comptabilité', 'Management'];
  const skills: Record<string, { id: string }> = {};
  for (const name of skillNames) skills[name] = await prisma.skill.create({ data: { name } });

  const matrix: Record<string, number[]> = {
    'Camille Ferrand': [4, 2, 1, 3, 2, 5],
    'Yanis Moreau': [3, 3, 5, 2, 1, 2],
    'Sofia Renault': [2, 1, 1, 5, 3, 1],
    'Aïcha Diallo': [2, 1, 1, 2, 5, 2],
  };
  for (const [empName, levels] of Object.entries(matrix)) {
    for (let i = 0; i < skillNames.length; i++) {
      await prisma.employeeSkill.create({
        data: { employeeId: employees[empName].id, skillId: skills[skillNames[i]].id, level: levels[i] },
      });
    }
  }
  await prisma.developmentPlan.createMany({
    data: [
      { employeeId: employees['Yanis Moreau'].id, goal: 'Accessibilité web (RGAA)', progress: 40 },
      { employeeId: employees['Sofia Renault'].id, goal: 'Négociation commerciale', progress: 70 },
      { employeeId: employees['Aïcha Diallo'].id, goal: 'Facturation électronique 2026', progress: 90 },
    ],
  });

  // ---------------------------------------------------------------- Onboarding / offboarding
  const onboThomas = await prisma.onboardingJourney.create({
    data: { employeeId: employees['Thomas Lefèvre'].id, kind: 'ONBOARDING', startDate: d('2026-02-03') },
  });
  await prisma.onboardingTask.createMany({
    data: [
      { journeyId: onboThomas.id, label: 'Contrat signé électroniquement', done: true, position: 0 },
      { journeyId: onboThomas.id, label: 'Compte e-mail & accès créés', done: true, position: 1 },
      { journeyId: onboThomas.id, label: 'Matériel attribué (ordinateur, badge)', done: true, position: 2 },
      { journeyId: onboThomas.id, label: 'Parcours de formation sécurité', done: false, position: 3 },
      { journeyId: onboThomas.id, label: 'Rendez-vous manager J+7', done: false, position: 4 },
    ],
  });
  const onboLea = await prisma.onboardingJourney.create({
    data: { employeeId: employees['Léa Nguyen'].id, kind: 'ONBOARDING', startDate: d('2026-09-15') },
  });
  await prisma.onboardingTask.createMany({
    data: [
      { journeyId: onboLea.id, label: 'Promesse d’embauche envoyée', done: true, position: 0 },
      { journeyId: onboLea.id, label: 'Convention de stage / alternance', done: false, position: 1 },
      { journeyId: onboLea.id, label: 'DPAE effectuée', done: false, position: 2 },
      { journeyId: onboLea.id, label: 'Kit de bienvenue préparé', done: false, position: 3 },
    ],
  });
  const offMarc = await prisma.onboardingJourney.create({
    data: { employeeId: employees['Marc Bonnet'].id, kind: 'OFFBOARDING', startDate: d('2026-12-31') },
  });
  await prisma.onboardingTask.createMany({
    data: [
      { journeyId: offMarc.id, label: 'Entretien de départ planifié', done: true, position: 0 },
      { journeyId: offMarc.id, label: 'Restitution du matériel', done: false, position: 1 },
      { journeyId: offMarc.id, label: 'Clôture des accès', done: false, position: 2 },
      { journeyId: offMarc.id, label: 'Solde de tout compte préparé', done: false, position: 3 },
    ],
  });

  // ---------------------------------------------------------------- Demandes salarié
  await prisma.employeeRequest.createMany({
    data: [
      { employeeId: employees['Yanis Moreau'].id, kind: 'Attestation de travail', status: 'DONE', createdAt: d('2026-06-10'), resolvedAt: d('2026-06-12') },
      { employeeId: employees['Yanis Moreau'].id, kind: 'Note de frais', message: 'Déplacement Lyon → Paris (train + hôtel)', status: 'REIMBURSED', createdAt: d('2026-05-18'), resolvedAt: d('2026-05-25') },
    ],
  });

  // ---------------------------------------------------------------- Conformité
  await prisma.legalAlert.createMany({
    data: [
      { companyId: company.id, level: 'HIGH', title: 'DUERP à mettre à jour', detail: 'Dernière mise à jour il y a 13 mois — obligation annuelle.', dueDate: d('2026-09-30') },
      { companyId: company.id, level: 'MEDIUM', title: 'Entretiens professionnels', detail: '6 salariés arrivent à l’échéance des 2 ans.', dueDate: d('2026-10-15') },
      { companyId: company.id, level: 'MEDIUM', title: 'Registre RGPD', detail: '2 traitements sans durée de conservation renseignée.', dueDate: d('2026-09-20') },
      { companyId: company.id, level: 'LOW', title: 'Affichage obligatoire', detail: 'Nouvelle mention égalité professionnelle à afficher.', dueDate: d('2026-11-01') },
    ],
  });

  // ---------------------------------------------------------------- IA
  await prisma.aiInsight.createMany({
    data: [
      { companyId: company.id, kind: 'signal_faible', title: 'Signal faible — équipe Production', body: 'Baisse de 12 % des validations de planning et hausse des heures supplémentaires sur 3 semaines. Un point d’équipe est suggéré.', severity: 'MEDIUM' },
      { companyId: company.id, kind: 'prevision_absences', title: 'Prévision d’absences — Octobre', body: 'Pic attendu semaine 42 (vacances scolaires). Anticipez 1 renfort sur l’atelier et le service ADV.', severity: 'LOW' },
      { companyId: company.id, kind: 'climat', title: 'Climat social', body: 'Moral global stable (indice 7,4/10). L’item « reconnaissance » progresse de 0,3 pt ce trimestre.', severity: 'LOW' },
    ],
  });

  // ---------------------------------------------------------------- Facturation + journal TVA
  await appendVatJournal(company.id, 'SEED', { note: 'Initialisation du journal anti-fraude TVA' });

  const invoiceSeed = [
    { number: 'F-2026-0144', clientName: 'Bureau Vell', issueDate: '2026-08-02', dueDate: '2026-09-01', ppfStatus: 'PAID' as const, amount: 5400, paid: true },
    { number: 'F-2026-0145', clientName: 'Studio Halcyon', issueDate: '2026-08-14', dueDate: '2026-09-13', ppfStatus: 'RECEIVED_BY_PPF' as const, amount: 2100, paid: false },
    { number: 'F-2026-0146', clientName: 'Coopérative Sauge', issueDate: '2026-08-20', dueDate: '2026-09-19', ppfStatus: 'REJECTED' as const, amount: 7600, paid: false },
    { number: 'F-2026-0147', clientName: 'Maison Aubertin', issueDate: '2026-08-28', dueDate: '2026-09-27', ppfStatus: 'PAID' as const, amount: 3820, paid: true },
    { number: 'F-2026-0148', clientName: 'Groupe Sévane', issueDate: '2026-09-01', dueDate: '2026-10-01', ppfStatus: 'ACCEPTED' as const, amount: 12450, paid: false },
  ];
  for (const v of invoiceSeed) {
    const ht = Math.round((v.amount / 1.2) * 100) / 100;
    const line = { label: 'Prestations de services', quantity: 1, unitPrice: ht, vatRate: 20 };
    const fx = generateFacturx({
      number: v.number,
      issueDate: d(v.issueDate),
      dueDate: d(v.dueDate),
      seller: { name: company.name, siren: company.siren },
      buyer: { name: v.clientName },
      currency: 'EUR',
      lines: [line],
    });
    const archivedUntil = d(v.issueDate);
    archivedUntil.setFullYear(archivedUntil.getFullYear() + 10);

    await prisma.invoice.create({
      data: {
        companyId: company.id,
        number: v.number,
        clientName: v.clientName,
        issueDate: d(v.issueDate),
        dueDate: d(v.dueDate),
        currency: 'EUR',
        totalExclVat: fx.totals.totalExclVat,
        vatAmount: fx.totals.vatAmount,
        totalInclVat: fx.totals.totalInclVat,
        facturxProfile: fx.profile,
        facturxSha256: fx.sha256,
        archivedUntil,
        ppfStatus: v.ppfStatus,
        ppfMessageId: `SIM-${v.number}`,
        paidAt: v.paid ? d(v.dueDate) : null,
        lines: { create: [line] },
        ppfHistory: {
          create: [
            { status: 'DEPOSITED', detail: 'Déposée sur le PPF (simulation).', occurredAt: d(v.issueDate) },
            { status: v.ppfStatus, detail: 'Statut courant (simulation).', occurredAt: d(v.dueDate) },
          ],
        },
      },
    });
    await appendVatJournal(company.id, `INVOICE_ISSUED:${v.number}`, { total: fx.totals.totalInclVat, sha256: fx.sha256 });
  }

  // ---------------------------------------------------------------- Journal d'activité
  await prisma.activityLog.createMany({
    data: [
      { companyId: company.id, text: 'Espace de démonstration initialisé.', createdAt: d('2026-09-10T08:00:00Z') },
      { companyId: company.id, text: 'Facture Factur-X F-2026-0148 générée (12 450,00 € TTC).', createdAt: d('2026-09-10T08:05:00Z') },
      { companyId: company.id, text: 'Demande d’absence de Yanis Moreau : Congés payés, 5 j.', createdAt: d('2026-09-10T08:10:00Z') },
      { companyId: company.id, text: 'Alerte de conformité ouverte : DUERP à mettre à jour.', createdAt: d('2026-09-10T08:15:00Z') },
    ],
  });

  log('✅ Terminé.');
  log('   Entreprise : camille.ferrand@atelier-lumen.fr / demo1234 (ADMIN)');
  log('   RH         : sofia.renault@atelier-lumen.fr / demo1234 (HR)');
  log('   Salarié    : yanis.moreau@atelier-lumen.fr / demo1234 (EMPLOYEE)');

  return { companyId: company.id };
}

// Exécution directe : `npm run seed`.
if (process.argv[1] && /seed(\.ts|\.js)?$/.test(process.argv[1])) {
  seedDatabase()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
