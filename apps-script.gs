/**
 * Compteur d'inscrits automatique (Google Apps Script)
 * 1. Crée une feuille Google Sheets vide, puis Extensions > Apps Script.
 * 2. Colle ce code, enregistre.
 * 3. Déployer > Nouveau déploiement > Application Web :
 *      Exécuter en tant que : Moi / Accès : Tout le monde.
 * 4. Copie l'URL (…/exec) dans CFG.api de index.html.
 * Le nombre d'inscrits = nombre de lignes de l'onglet « Inscrits » (hors en-tête).
 */
const ONGLET = 'Inscrits';

function feuille_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(ONGLET);
  if (!s) { s = ss.insertSheet(ONGLET); s.appendRow(['Date', 'Prénom', 'Nom', 'Niveau', 'Vélo', 'Message']); }
  return s;
}
function propre_(v) {
  v = String(v || '').slice(0, 300);
  return /^[=+\-@]/.test(v) ? "'" + v : v;   // évite l'injection de formules
}
function doGet() {
  const n = Math.max(0, feuille_().getLastRow() - 1);
  return ContentService.createTextOutput(JSON.stringify({ count: n })).setMimeType(ContentService.MimeType.JSON);
}
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    feuille_().appendRow([new Date(), propre_(d.prenom), propre_(d.nom), propre_(d.niveau), propre_(d.velo), propre_(d.note)]);
  } finally { lock.releaseLock(); }
  return ContentService.createTextOutput('ok');
}
