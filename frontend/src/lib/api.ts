import { store, type Role, type InvoiceLine, type PpfStatus } from './store';
import { buildCiiXml, computeTotals } from './facturx';
import { sha256, uid } from './download';
import { company } from '../data/mock';

const wait = (ms = 260) => new Promise((r) => setTimeout(r, ms));
const todayISO = () => new Date().toISOString().slice(0, 10);

/* ---------- Auth ---------- */
export const auth = {
  async login(email: string, password: string) {
    await wait();
    const user = store.get().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || (password !== user.password && password.length < 4)) {
      throw new Error('Identifiants incorrects. (démo : mot de passe « demo1234 »)');
    }
    return { token: `demo.${user.id}`, user };
  },
  me(token: string | null) {
    if (!token) return null;
    const id = token.replace('demo.', '');
    return store.get().users.find((u) => u.id === id) ?? null;
  },
};

/* ---------- RH ---------- */
export const hr = {
  async addEmployee(input: { name: string; role: string; dept: string; contract: string; email: string; since: string }) {
    await wait();
    const id = uid('e');
    store.set((d) => {
      d.employees.push({
        ...input, id, status: 'Onboarding', manager: 'Camille Ferrand',
        iban: 'FR7630006000011234567890189', leave: { cp: 25, rtt: 10, recup: 0 },
      });
    });
    store.log(`Nouveau salarié ajouté : ${input.name} (${input.dept}).`);
    return id;
  },

  async requestAbsence(input: { employeeId: string; who: string; type: string; from: string; to: string; reason?: string }) {
    await wait();
    const days = businessDays(input.from, input.to);
    const id = uid('a');
    store.set((d) => {
      d.absences.unshift({ ...input, id, days, status: 'À valider', createdAt: todayISO() });
    });
    store.log(`Demande d'absence de ${input.who} : ${input.type}, ${days} j.`);
    return id;
  },

  async decideAbsence(id: string, decision: 'Validé' | 'Refusé') {
    await wait(180);
    store.set((d) => {
      const a = d.absences.find((x) => x.id === id);
      if (!a) return;
      a.status = decision;
      if (decision === 'Validé' && a.type.startsWith('Congés')) {
        const emp = d.employees.find((e) => e.id === a.employeeId);
        if (emp) emp.leave.cp = Math.max(0, Math.round((emp.leave.cp - a.days) * 10) / 10);
      }
    });
    store.log(`Absence ${decision === 'Validé' ? 'validée' : 'refusée'} (#${id.slice(-4)}).`);
  },
};

/* ---------- Facturation 2026 ---------- */
const PPF_FLOW: PpfStatus[] = ['Brouillon', 'Déposée', 'Reçue par le PPF', 'Acceptée', 'Encaissée'];

export const billing = {
  async createInvoice(input: { client: string; clientSiren?: string; issued: string; due: string; lines: InvoiceLine[] }) {
    await wait(320);
    const totals = computeTotals(input.lines);
    const year = new Date(input.issued).getFullYear();
    const seq = store.get().invoices.filter((v) => v.id.includes(`${year}`)).length + 145;
    const number = `F-${year}-${String(seq).padStart(4, '0')}`;
    const xml = buildCiiXml({
      number, issueDate: input.issued, dueDate: input.due,
      seller: { name: company.name, siren: company.siren.replace(/\s/g, '') },
      buyer: { name: input.client, siren: input.clientSiren },
      lines: input.lines,
    });
    const hash = await sha256(xml);
    store.set((d) => {
      d.invoices.unshift({
        id: number, client: input.client, clientSiren: input.clientSiren,
        issued: input.issued, due: input.due, lines: input.lines,
        totalHT: totals.totalHT, tva: totals.tva, amount: totals.totalTTC,
        ppf: 'Brouillon', paid: false, xml, sha256: hash,
        ppfHistory: [{ status: 'Brouillon', at: todayISO() }],
      });
    });
    store.log(`Facture Factur-X ${number} générée (${totals.totalTTC.toFixed(2)} € TTC).`);
    return number;
  },

  async sendToPpf(id: string) {
    await wait(300);
    store.set((d) => {
      const v = d.invoices.find((x) => x.id === id);
      if (!v) return;
      const idx = PPF_FLOW.indexOf(v.ppf);
      const next = v.ppf === 'Rejetée' ? 'Déposée' : (PPF_FLOW[idx + 1] ?? v.ppf);
      v.ppf = next;
      v.paid = next === 'Encaissée';
      v.ppfHistory.unshift({ status: next, at: todayISO() });
    });
    store.log(`Transmission PPF — facture ${id}.`);
  },
};

/* ---------- Conformité ---------- */
export const compliance = {
  async resolveAlert(id: string) {
    await wait(160);
    store.set((d) => {
      const a = d.alerts.find((x) => x.id === id);
      if (a) a.resolved = true;
    });
    store.log(`Alerte de conformité traitée (#${id}).`);
  },
  checkContract(type: 'CDI' | 'CDD', text: string) {
    const required = type === 'CDI'
      ? ['identité', 'fonction', 'rémunération', 'durée', 'convention']
      : ['identité', 'motif', 'terme', 'poste', 'rémunération', 'convention'];
    const t = text.toLowerCase();
    const missing = required.filter((c) => !t.includes(c));
    return { compliant: missing.length === 0, missing };
  },
};

/* ---------- IA RH (règles locales, ton calme et rassurant) ---------- */
const ANSWERS: { rx: RegExp; a: string }[] = [
  { rx: /(absence|congé|absentéisme)/i, a: "D'après les trois dernières années, une hausse des absences est probable pendant les vacances scolaires (semaine 42). Je vous suggère d'anticiper un renfort sur l'atelier et le service ADV, et de figer les congés des managers sur cette période. Souhaitez-vous que je prépare une note d'information ?" },
  { rx: /(attestation|avenant|courrier|document|contrat)/i, a: "Je peux rédiger ce document à partir de vos modèles et de votre convention collective. Indiquez-moi le salarié et l'objet ; je vous proposerai une version prête à relire, puis à déposer dans le coffre-fort." },
  { rx: /(moral|climat|ambiance|rps)/i, a: "Le climat social global est stable (indice 7,4/10, +0,1 pt ce trimestre). Les résultats sont strictement anonymes et agrégés : aucune réponse individuelle n'est accessible. L'item « reconnaissance » progresse ; « charge de travail » recule légèrement en Production." },
  { rx: /(bulletin|paie|salaire|net)/i, a: "Votre dernier bulletin est disponible dans « Bulletins », conservé à valeur probante. Le détail des cotisations y figure ligne à ligne." },
  { rx: /(télétravail|teletravail)/i, a: "Votre accord prévoit 2 jours de télétravail par semaine. Pour une demande exceptionnelle, passez par « Demandes » en choisissant « Autre »." },
  { rx: /(rgpd|données|donnee)/i, a: "Le registre des traitements est à jour à 82 %. Deux traitements n'ont pas de durée de conservation renseignée : je peux préparer les fiches manquantes." },
];

export const ai = {
  async chat(message: string) {
    await wait(420);
    const hit = ANSWERS.find((x) => x.rx.test(message));
    return hit?.a
      ?? "Je reste à votre disposition, en toute sérénité. Je peux rédiger un document RH, analyser un risque humain, préparer une campagne d'entretiens ou vous éclairer sur une obligation légale.";
  },

  async generateDocument(kind: string, values: Record<string, string>) {
    await wait(360);
    const date = new Date().toLocaleDateString('fr-FR');
    const body = kind === 'attestation'
      ? `ATTESTATION DE TRAVAIL\n\nJe soussigné·e, représentant·e de ${values.company ?? company.name}, atteste que ${values.employee} `
        + `est employé·e dans notre entreprise depuis le ${values.since}, en qualité de ${values.role}, `
        + `dans le cadre d'un contrat ${values.contract}.\n\nAttestation délivrée pour faire valoir ce que de droit.\n\nFait le ${date}.`
      : `COURRIER RH — ${kind}\n\nObjet : ${values.subject ?? kind}\nSalarié concerné : ${values.employee}\n\n${values.subject ?? ''}\n\nFait le ${date}.`;
    store.log(`Document généré par l'IA : ${kind} — ${values.employee ?? ''}.`);
    return body;
  },
};

/* ---------- utilitaires ---------- */
export function businessDays(fromISO: string, toISO: string): number {
  const from = new Date(fromISO);
  const to = new Date(toISO);
  if (Number.isNaN(+from) || Number.isNaN(+to) || to < from) return 1;
  let n = 0;
  for (const d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) n++;
  }
  return n || 1;
}

export const roleHome = (role: Role) => (role === 'EMPLOYEE' ? '/espace' : '/app');
