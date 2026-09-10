import { describe, it, expect } from 'vitest';
import { computeTotals, buildCiiXml, generateFacturx } from './facturx';

const lines = [
  { label: 'Prestation A', quantity: 2, unitPrice: 100, vatRate: 20 },
  { label: 'Prestation B', quantity: 1, unitPrice: 49.99, vatRate: 10 },
];

describe('computeTotals', () => {
  it('calcule HT, TVA et TTC avec arrondi au centime', () => {
    const t = computeTotals(lines);
    expect(t.totalExclVat).toBe(249.99);
    expect(t.vatAmount).toBe(45); // 40 + 5.00 (arrondi)
    expect(t.totalInclVat).toBe(294.99);
  });

  it('renvoie zéro pour une facture sans ligne', () => {
    expect(computeTotals([])).toEqual({ totalExclVat: 0, vatAmount: 0, totalInclVat: 0 });
  });
});

describe('buildCiiXml', () => {
  const xml = buildCiiXml({
    number: 'F-2026-0001',
    issueDate: new Date('2026-03-15'),
    dueDate: new Date('2026-04-15'),
    seller: { name: 'Atelier Lumen', siren: '812456789' },
    buyer: { name: 'Client & Co' },
    currency: 'EUR',
    lines,
  });

  it('cible le profil EN 16931 et le type de document 380 (facture)', () => {
    expect(xml).toContain('<ram:ID>EN16931</ram:ID>');
    expect(xml).toContain('<ram:TypeCode>380</ram:TypeCode>');
  });

  it('porte le numéro et les totaux calculés', () => {
    expect(xml).toContain('<ram:ID>F-2026-0001</ram:ID>');
    expect(xml).toContain('<ram:GrandTotalAmount>294.99</ram:GrandTotalAmount>');
  });

  it('échappe les caractères XML dans les noms', () => {
    expect(xml).toContain('Client &amp; Co');
    expect(xml).not.toContain('Client & Co<');
  });
});

describe('generateFacturx', () => {
  it('produit une empreinte SHA-256 qui dépend du contenu', () => {
    const a = generateFacturx({
      number: 'F-1',
      issueDate: new Date('2026-01-01'),
      dueDate: new Date('2026-02-01'),
      seller: { name: 'S', siren: '000000000' },
      buyer: { name: 'B' },
      currency: 'EUR',
      lines: [{ label: 'x', quantity: 1, unitPrice: 10, vatRate: 20 }],
    });
    const b = generateFacturx({
      number: 'F-2',
      issueDate: new Date('2026-01-01'),
      dueDate: new Date('2026-02-01'),
      seller: { name: 'S', siren: '000000000' },
      buyer: { name: 'B' },
      currency: 'EUR',
      lines: [{ label: 'x', quantity: 1, unitPrice: 10, vatRate: 20 }],
    });
    expect(a.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(a.sha256).not.toBe(b.sha256);
  });
});
