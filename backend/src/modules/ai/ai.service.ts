/**
 * Moteur IA RH — couche d'abstraction.
 *
 * Le ton est imposé : calme, professionnel, féminin, rassurant.
 * Tant qu'aucun fournisseur LLM n'est branché, les réponses sont générées
 * localement à partir de règles. `askLlm` est le point d'extension.
 */

const TONE_SYSTEM_PROMPT =
  "Tu es l'assistante RH de Valentynia. Tu réponds avec calme, professionnalisme et bienveillance. " +
  'Tu es rassurante, jamais alarmiste. Tu prépares et proposes, tu ne décides pas à la place des équipes RH. ' +
  'Tu ne révèles jamais de données individuelles issues des analyses anonymes.';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export async function askLlm(_messages: ChatMessage[], _system = TONE_SYSTEM_PROMPT): Promise<string> {
  // À implémenter : appel au fournisseur LLM (clé serveur, jamais exposée au client).
  throw new Error('askLlm: aucun fournisseur LLM configuré');
}

export function localAssistantReply(question: string): string {
  const q = question.toLowerCase();
  if (/(absence|congé|absentéisme)/.test(q)) {
    return (
      "D'après les tendances des trois dernières années, une hausse des absences est probable " +
      'pendant les vacances scolaires. Je vous suggère d’anticiper un renfort sur les équipes les ' +
      'plus exposées et de figer les congés des managers sur cette période. Souhaitez-vous que je ' +
      'prépare une note d’information pour les équipes ?'
    );
  }
  if (/(attestation|avenant|courrier|document)/.test(q)) {
    return (
      "Je peux rédiger ce document à partir de vos modèles et de votre convention collective. " +
      'Indiquez-moi le salarié concerné et l’objet ; je vous proposerai une version prête à relire, ' +
      'puis à déposer dans le coffre-fort du salarié.'
    );
  }
  if (/(moral|climat|ambiance|rps|risques psycho)/.test(q)) {
    return (
      "Le climat social global est stable. Les résultats sont strictement anonymes et agrégés : " +
      'aucune réponse individuelle n’est accessible. Si vous le souhaitez, je peux détailler les ' +
      'items en progression et ceux qui appellent une action de prévention.'
    );
  }
  return (
    "Je reste à votre disposition, en toute sérénité. Je peux rédiger un document RH, analyser un " +
    'risque humain, préparer une campagne d’entretiens ou vous éclairer sur une obligation légale.'
  );
}

const TEMPLATES: Record<string, (v: Record<string, string>) => string> = {
  attestation_travail: (v) =>
    `ATTESTATION DE TRAVAIL\n\nJe soussigné·e, représentant·e de ${v.company}, atteste que ` +
    `${v.employee} est employé·e au sein de notre entreprise depuis le ${v.since}, ` +
    `en qualité de ${v.jobTitle}, dans le cadre d’un contrat ${v.contractType}.\n\n` +
    `Cette attestation est délivrée à la demande de l’intéressé·e pour faire valoir ce que de droit.\n\n` +
    `Fait le ${new Date().toLocaleDateString('fr-FR')}.`,
};

export function generateHrDocument(template: string, values: Record<string, string>): string {
  const fn = TEMPLATES[template];
  if (!fn) throw new Error(`Modèle inconnu : ${template}`);
  return fn(values);
}
