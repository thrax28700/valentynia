import { sha256 } from './crypto';
import { env } from '../config/env';

/**
 * Génération Factur-X (facture hybride : PDF/A-3 lisible + XML CII embarqué),
 * conforme à la norme EN 16931 et à la réforme française 2026.
 *
 * ⚠️ Implémentation de référence : produit le XML CII et une empreinte.
 * La fabrication du PDF/A-3 avec pièce jointe est déléguée à un service
 * dédié (non inclus dans ce dépôt) ; `buildPdfA3` est le point d'extension.
 */

export type FacturxInput = {
  number: string;
  issueDate: Date;
  dueDate: Date;
  seller: { name: string; siren: string };
  buyer: { name: string; siren?: string };
  currency: string;
  lines: { label: string; quantity: number; unitPrice: number; vatRate: number }[];
};

export type FacturxResult = {
  profile: string;
  xml: string;
  totals: { totalExclVat: number; vatAmount: number; totalInclVat: number };
  sha256: string;
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function computeTotals(lines: FacturxInput['lines']) {
  let totalExclVat = 0;
  let vatAmount = 0;
  for (const l of lines) {
    const base = l.quantity * l.unitPrice;
    totalExclVat += base;
    vatAmount += base * (l.vatRate / 100);
  }
  totalExclVat = round2(totalExclVat);
  vatAmount = round2(vatAmount);
  return { totalExclVat, vatAmount, totalInclVat: round2(totalExclVat + vatAmount) };
}

/** XML Cross-Industry Invoice (UN/CEFACT) — profil EN 16931. */
export function buildCiiXml(input: FacturxInput, profile = env.FACTURX_PROFILE): string {
  const t = computeTotals(input.lines);
  const d = (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, '');
  const lineXml = input.lines
    .map(
      (l, i) => `
    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument><ram:LineID>${i + 1}</ram:LineID></ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct><ram:Name>${esc(l.label)}</ram:Name></ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice><ram:ChargeAmount>${round2(l.unitPrice)}</ram:ChargeAmount></ram:NetPriceProductTradePrice>
      </ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery><ram:BilledQuantity unitCode="C62">${l.quantity}</ram:BilledQuantity></ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax><ram:TypeCode>VAT</ram:TypeCode><ram:CategoryCode>S</ram:CategoryCode><ram:RateApplicablePercent>${l.vatRate}</ram:RateApplicablePercent></ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementLineMonetarySummation><ram:LineTotalAmount>${round2(l.quantity * l.unitPrice)}</ram:LineTotalAmount></ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter><ram:ID>${profile}</ram:ID></ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${esc(input.number)}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime><udt:DateTimeString format="102" xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">${d(input.issueDate)}</udt:DateTimeString></ram:IssueDateTime>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>${lineXml}
    <ram:ApplicableHeaderTradeAgreement>
      <ram:SellerTradeParty><ram:Name>${esc(input.seller.name)}</ram:Name><ram:SpecifiedLegalOrganization><ram:ID schemeID="0002">${input.seller.siren}</ram:ID></ram:SpecifiedLegalOrganization></ram:SellerTradeParty>
      <ram:BuyerTradeParty><ram:Name>${esc(input.buyer.name)}</ram:Name>${
        input.buyer.siren
          ? `<ram:SpecifiedLegalOrganization><ram:ID schemeID="0002">${input.buyer.siren}</ram:ID></ram:SpecifiedLegalOrganization>`
          : ''
      }</ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>${input.currency}</ram:InvoiceCurrencyCode>
      <ram:SpecifiedTradePaymentTerms><ram:DueDateDateTime><udt:DateTimeString format="102" xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">${d(input.dueDate)}</udt:DateTimeString></ram:DueDateDateTime></ram:SpecifiedTradePaymentTerms>
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:TaxBasisTotalAmount>${t.totalExclVat}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="${input.currency}">${t.vatAmount}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${t.totalInclVat}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${t.totalInclVat}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;
}

/** Point d'extension : fabrication du PDF/A-3 avec le XML en pièce jointe. */
export async function buildPdfA3(_xml: string, _humanReadable?: Buffer): Promise<Buffer> {
  throw new Error('buildPdfA3: à brancher sur le service de composition PDF/A-3');
}

export function generateFacturx(input: FacturxInput): FacturxResult {
  const xml = buildCiiXml(input);
  return {
    profile: env.FACTURX_PROFILE,
    xml,
    totals: computeTotals(input.lines),
    sha256: sha256(xml),
  };
}
