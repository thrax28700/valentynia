import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';
import { seedDatabase } from '../src/seed/seed';

let app: Express;
let adminToken: string;
let employeeToken: string;

beforeAll(async () => {
  await seedDatabase({ quiet: true });
  app = createApp();

  const admin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'camille.ferrand@atelier-lumen.fr', password: 'demo1234' });
  adminToken = admin.body.token;

  const emp = await request(app)
    .post('/api/auth/login')
    .send({ email: 'yanis.moreau@atelier-lumen.fr', password: 'demo1234' });
  employeeToken = emp.body.token;
}, 90_000);

afterAll(async () => {
  await prisma.$disconnect();
});

const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

describe('Santé & authentification', () => {
  it('GET /api/health répond ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('valentynia-api');
  });

  it('refuse un mot de passe incorrect (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'camille.ferrand@atelier-lumen.fr', password: 'mauvais-mot-de-passe' });
    expect(res.status).toBe(401);
  });

  it('valide les identifiants de démonstration et renvoie un JWT + le rôle', async () => {
    expect(typeof adminToken).toBe('string');
    const me = await request(app).get('/api/auth/me').set(auth(adminToken));
    expect(me.status).toBe(200);
    expect(me.body.user.role).toBe('ADMIN');
    expect(me.body.company.name).toBe('Atelier Lumen');
  });
});

describe('Contrôle d’accès', () => {
  it('rejette une route protégée sans jeton (401)', async () => {
    const res = await request(app).get('/api/hr/employees');
    expect(res.status).toBe(401);
  });

  it('interdit à un salarié de créer un salarié (403)', async () => {
    const res = await request(app)
      .post('/api/hr/employees')
      .set(auth(employeeToken))
      .send({
        firstName: 'X',
        lastName: 'Y',
        email: 'x.y@atelier-lumen.fr',
        jobTitle: 'Test',
        department: 'Test',
        contractType: 'CDI',
        startDate: '2026-01-01',
      });
    expect(res.status).toBe(403);
  });

  it('cloisonne les absences d’un salarié à lui-même', async () => {
    const res = await request(app).get('/api/hr/absences').set(auth(employeeToken));
    expect(res.status).toBe(200);
    const names = new Set(res.body.map((a: { employeeName: string }) => a.employeeName));
    expect([...names]).toEqual(['Yanis Moreau']);
  });
});

describe('Module RH', () => {
  it('liste les 8 salariés de l’entreprise', async () => {
    const res = await request(app).get('/api/hr/employees').set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(8);
    expect(res.body[0]).toHaveProperty('leave.paidLeave');
    expect(res.body[0].ibanLast4).toMatch(/^\d{4}$/); // IBAN déchiffré puis masqué
  });

  it('décompte le solde de congés à la validation d’une absence', async () => {
    const list = await request(app).get('/api/hr/employees').set(auth(adminToken));
    const target = list.body.find((e: { fullName: string }) => e.fullName === 'Hugo Faure');
    const before = target.leave.paidLeave;

    const created = await request(app)
      .post('/api/hr/absences')
      .set(auth(adminToken))
      .send({
        employeeId: target.id,
        type: 'PAID_LEAVE',
        startDate: '2026-11-02', // lundi
        endDate: '2026-11-04', // mercredi -> 3 jours ouvrés
      });
    expect(created.status).toBe(201);
    expect(created.body.days).toBe(3);

    const decided = await request(app)
      .patch(`/api/hr/absences/${created.body.id}`)
      .set(auth(adminToken))
      .send({ status: 'APPROVED' });
    expect(decided.status).toBe(200);

    const after = await request(app).get(`/api/hr/employees/${target.id}`).set(auth(adminToken));
    expect(after.body.leave.paidLeave).toBeCloseTo(before - 3, 5);
  });
});

describe('Facturation — Factur-X & journal anti-fraude TVA', () => {
  it('vérifie l’intégrité de la chaîne du journal TVA', async () => {
    const res = await request(app).get('/api/billing/vat-journal/verify').set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('crée une facture Factur-X, renvoie le XML et étend le journal TVA', async () => {
    const before = await request(app).get('/api/billing/vat-journal').set(auth(adminToken));

    const res = await request(app)
      .post('/api/billing/invoices')
      .set(auth(adminToken))
      .send({
        clientName: 'Client Test Vitest',
        issueDate: '2026-05-10',
        dueDate: '2026-06-10',
        lines: [{ label: 'Audit', quantity: 1, unitPrice: 1000, vatRate: 20 }],
      });
    expect(res.status).toBe(201);
    expect(res.body.facturxXml).toContain('<rsm:CrossIndustryInvoice');
    expect(res.body.invoice.totalInclVat).toBe(1200);
    expect(res.body.invoice.ppfStatus).toBe('DRAFT');

    const after = await request(app).get('/api/billing/vat-journal').set(auth(adminToken));
    expect(after.body.length).toBe(before.body.length + 1);

    const verify = await request(app).get('/api/billing/vat-journal/verify').set(auth(adminToken));
    expect(verify.body.ok).toBe(true);
  });

  it('fait avancer le cycle de vie PPF d’un cran', async () => {
    const list = await request(app).get('/api/billing/invoices').set(auth(adminToken));
    const draft = list.body.find((i: { ppfStatus: string }) => i.ppfStatus === 'DRAFT');
    const res = await request(app)
      .post(`/api/billing/invoices/${draft.id}/send-ppf`)
      .set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.invoice.ppfStatus).not.toBe('DRAFT');
    expect(res.body.simulated).toBe(true);
  });
});

describe('Tableau de bord', () => {
  it('agrège les indicateurs de l’entreprise', async () => {
    const res = await request(app).get('/api/dashboard').set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.headcount).toBe(8);
    expect(res.body.complianceScore).toBeGreaterThanOrEqual(0);
    expect(res.body.complianceScore).toBeLessThanOrEqual(100);
    expect(Array.isArray(res.body.recentInvoices)).toBe(true);
  });
});
