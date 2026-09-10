// Génération Factur-X côté client — XML Cross-Industry Invoice (UN/CEFACT),
// profil EN 16931. Version navigateur des fonctions pures du backend.
export type FxLine = { label: string; qty: number; unitPrice: number; vatRate: number };
export type FxInput = {
  number: string;
  issueDate: string;
  dueDate: string;
  seller: { name: string; siren: string };
  buyer: { name: string; siren?: string };
  currency?: string;
  lines: FxLine[];
};

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ymd = (iso: string) => iso.slice(0, 10).replace(/-/g, '');

export function computeTotals(lines: FxLine[]) {
  let ht = 0;
  let tva = 0;
  for (const l of lines) {
    const base = l.qty * l.unitPrice;
    ht += base;
    tva += base * (l.vatRate / 100);
  }
  ht = r2(ht);
  tva = r2(tva);
  return { totalHT: ht, tva, totalTTC: r2(ht + tva) };
}

export function buildCiiXml(input: FxInput, profile = 'EN16931'): string {
  const cur = input.currency ?? 'EUR';
  const t = computeTotals(input.lines);
  const udt = 'urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100';
  const lineXml = input.lines
    .map(
      (l, i) => `
    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument><ram:LineID>${i + 1}</ram:LineID></ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct><ram:Name>${esc(l.label)}</ram:Name></ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement><ram:NetPriceProductTradePrice><ram:ChargeAmount>${r2(l.unitPrice)}</ram:ChargeAmount></ram:NetPriceProductTradePrice></ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery><ram:BilledQuantity unitCode="C62">${l.qty}</ram:BilledQuantity></ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax><ram:TypeCode>VAT</ram:TypeCode><ram:CategoryCode>S</ram:CategoryCode><ram:RateApplicablePercent>${l.vatRate}</ram:RateApplicablePercent></ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementLineMonetarySummation><ram:LineTotalAmount>${r2(l.qty * l.unitPrice)}</ram:LineTotalAmount></ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100">
  <rsm:ExchangedDocumentContext><ram:GuidelineSpecifiedDocumentContextParameter><ram:ID>${profile}</ram:ID></ram:GuidelineSpecifiedDocumentContextParameter></rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${esc(input.number)}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime><udt:DateTimeString format="102" xmlns:udt="${udt}">${ymd(input.issueDate)}</udt:DateTimeString></ram:IssueDateTime>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>${lineXml}
    <ram:ApplicableHeaderTradeAgreement>
      <ram:SellerTradeParty><ram:Name>${esc(input.seller.name)}</ram:Name><ram:SpecifiedLegalOrganization><ram:ID schemeID="0002">${input.seller.siren}</ram:ID></ram:SpecifiedLegalOrganization></ram:SellerTradeParty>
      <ram:BuyerTradeParty><ram:Name>${esc(input.buyer.name)}</ram:Name>${input.buyer.siren ? `<ram:SpecifiedLegalOrganization><ram:ID schemeID="0002">${input.buyer.siren}</ram:ID></ram:SpecifiedLegalOrganization>` : ''}</ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>${cur}</ram:InvoiceCurrencyCode>
      <ram:SpecifiedTradePaymentTerms><ram:DueDateDateTime><udt:DateTimeString format="102" xmlns:udt="${udt}">${ymd(input.dueDate)}</udt:DateTimeString></ram:DueDateDateTime></ram:SpecifiedTradePaymentTerms>
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:TaxBasisTotalAmount>${t.totalHT}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="${cur}">${t.tva}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${t.totalTTC}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${t.totalTTC}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;
}
