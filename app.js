'use strict';
(() => {
  const KEY = 'fallfinder-guided-2026-10-01-v1';
  const $ = (id) => document.getElementById(id);
  const defaults = { step: 0, workspaceNote: '', prediction: '', message: '  My card was not charged 42 euros.  ', observation: '', httpNote: '', decisionNote: '', related: '' };
  document.querySelectorAll('[data-save]').forEach(field => { if (!(field.dataset.save in defaults)) defaults[field.dataset.save] = ''; });
  const allowed = Object.keys(defaults);
  const stationCount = document.querySelectorAll('[data-panel]').length;
  const config = window.FALLFINDER_CONFIG || {};
  const apiBase = config.apiBase ? new URL(config.apiBase, location.href) : new URL('./', location.href);
  const answersUrl = new URL('api/answers', apiBase.href.endsWith('/') ? apiBase : new URL(apiBase.href + '/'));
  let learnerToken = '';
  let serverConnected = false, serverRevision = null, saveInFlight = false, saveQueued = false, saveTimer = null, pendingServer = null;
  const sessionKey = 'fallfinder-learner-token:' + apiBase.pathname;
  try {
    const fragment = new URLSearchParams(location.hash.slice(1));
    learnerToken = fragment.get('token') || fragment.get('learnerToken') || config.learnerToken || sessionStorage.getItem(sessionKey) || '';
    if (learnerToken) sessionStorage.setItem(sessionKey, learnerToken);
    if (fragment.has('token') || fragment.has('learnerToken')) { fragment.delete('token'); fragment.delete('learnerToken'); history.replaceState(null, '', location.pathname + location.search + (fragment.size ? '#' + fragment.toString() : '')); }
  } catch { $('server-status').textContent = 'Sitzungsspeicher nicht verfügbar. Zugangscode bei Bedarf erneut eingeben.'; }
  let state = { ...defaults };
  let requestController = null;
  let requestSerial = 0;
  const normal = (text) => text.trim().replace(/\s+/g, ' ');
  function validState(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Ungültige Datei.');
    const result = { ...defaults };
    for (const key of allowed) {
      if (key === 'step') { if (Number.isInteger(value.step) && value.step >= 0 && value.step < stationCount) result.step = value.step; }
      else if (typeof value[key] === 'string') result[key] = value[key].slice(0, key === 'message' ? 500 : 10000);
    }
    if (!['', 'delivery', 'duplicate', 'pin'].includes(result.related)) result.related = '';
    return result;
  }
  try { const stored = localStorage.getItem(KEY); if (stored) state = validState(JSON.parse(stored)); } catch { $('save-status').textContent = 'Speicher nicht verfügbar. Bitte exportiere deine Antworten.'; }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); $('save-status').textContent = 'Auf diesem Gerät gespeichert. Serverstatus steht darunter.'; }
    catch { $('save-status').textContent = 'Lokales Speichern nicht möglich. Nutze den JSON-Export.'; }
    queueServerSave();
  }
  function showStep(step, focus = false) {
    state.step = step;
    $('station-jump').value = String(step);
    document.querySelectorAll('[data-panel]').forEach((panel) => { panel.hidden = Number(panel.dataset.panel) !== step; });
    document.querySelectorAll('[data-step]').forEach((button) => {
      const active = Number(button.dataset.step) === step;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
    });
    document.querySelectorAll('video').forEach((video) => video.pause());
    updateRequest(); save();
    if (focus) { $('main').focus({ preventScroll: true }); $('main').scrollIntoView({ block: 'start', behavior: 'instant' }); }
  }
  function updateRequest() {
    $('character-count').textContent = `${state.message.length} / 500`;
    $('request-output').textContent = JSON.stringify({ text: state.message }, null, 2);
  }
  function updateMatch() {
    const feedback = {
      '': 'Deine Auswahl bleibt eine menschliche Vermutung. Es wird hier kein Modell ausgeführt.',
      delivery: 'Beispiel A betrifft die Lieferung einer Karte. Die Anfrage betrifft zwei Zahlungen. Prüfe, ob deine Auswahl auf dem beschriebenen Ereignis beruht oder nur auf dem gemeinsamen Thema Karte.',
      duplicate: 'Beide Formulierungen beschreiben eine möglicherweise doppelte Zahlung. Damit ist B ein begründeter Einstieg für die Prüfung. Ob tatsächlich zweimal gebucht wurde, ergibt sich erst aus den Buchungen.',
      pin: 'Beispiel C betrifft den Zugang über die PIN. Die Anfrage betrifft Zahlungen. Für die Fallauswahl zählt, welche Art von Problem untersucht werden soll.'
    };
    $('match-feedback').textContent = feedback[state.related];
    $('model-evidence').hidden = !state.related;
  }
  function hydrate() {
    document.querySelectorAll('[data-save]').forEach((field) => { field.value = state[field.dataset.save]; });
    document.querySelectorAll('input[name="related"]').forEach((input) => { input.checked = input.value === state.related; });
    $('comparison').hidden = true; $('response-box').hidden = true; updateMatch(); showStep(state.step);
  }
  document.querySelectorAll('[data-step],[data-go]').forEach((button) => button.addEventListener('click', () => showStep(Number(button.dataset.step ?? button.dataset.go), true)));
  $('station-jump').addEventListener('change', event => showStep(Number(event.target.value), true));
  document.querySelectorAll('[data-save]').forEach((field) => field.addEventListener('input', () => {
    state[field.dataset.save] = field.value; save();
    if (field.dataset.save === 'message') { $('comparison').hidden = true; $('response-box').hidden = true; $('normalize-status').textContent = 'Text verändert. Starte die Normalisierung erneut.'; updateRequest(); }
  }));
  $('example').addEventListener('click', () => {
    state.message = state.message.includes('42') ? '  My card\nwas charged   twice.  ' : defaults.message;
    $('message').value = state.message; $('message').dispatchEvent(new Event('input')); $('message').focus();
  });
  $('normalize').addEventListener('click', () => {
    if (!normal(state.message)) { $('normalize-status').textContent = 'Die Nachricht ist leer. Schreibe einen Satz, bevor du normalisierst.'; $('comparison').hidden = true; return; }
    $('original-output').textContent = JSON.stringify(state.message);
    $('normalized-output').textContent = JSON.stringify(normal(state.message));
    $('comparison').hidden = false;
    $('normalize-status').textContent = normal(state.message) === state.message ? 'Keine Änderung: Dieser Text ist bereits normalisiert. Das ist ein gültiges Ergebnis.' : 'Leerraum verändert. Vergleiche Wörter, Zahlen und Satzzeichen in beiden Ausgaben.';
    save();
  });
  function showResponse(data, source, error = false) {
    $('response-box').hidden = false; $('response-output').textContent = JSON.stringify(data, null, 2);
    $('response-source').textContent = source; $('response-source').classList.toggle('error', error);
  }
  $('simulate').addEventListener('click', () => {
    requestSerial++; if (requestController) requestController.abort();
    const text = state.message;
    if (!normal(text)) { showResponse({ error: 'Die Nachricht darf nicht leer sein.' }, 'SIMULATION · kein HTTP-Aufruf', true); }
    else showResponse({ original: text, normalized: normal(text), changed: normal(text) !== text }, 'SIMULATION · lokal im Browser');
    $('request-status').textContent = 'Die Seite hat diese Beispielantwort selbst berechnet. Kein Server und kein Modell wurden aufgerufen.';
  });
  $('send').addEventListener('click', async () => {
    const id = ++requestSerial;
    if (requestController) requestController.abort();
    requestController = new AbortController();
    const controller = requestController;
    const timeout = setTimeout(() => controller.abort(), 8000);
    $('send').disabled = true; $('send').textContent = 'Anfrage läuft …'; $('response-box').hidden = true;
    $('request-status').textContent = 'Anfrage an localhost:3217 läuft. Abbruch nach 8 Sekunden.';
    try {
      const response = await fetch('http://localhost:3217/normalize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: state.message }), signal: controller.signal });
      const text = await response.text();
      let data; try { data = JSON.parse(text); } catch { data = { responseText: text.slice(0, 10000) }; }
      if (id !== requestSerial) return;
      showResponse(data, `ECHTES HTTP · Status ${response.status} · localhost:3217`, !response.ok);
      $('request-status').textContent = response.ok ? 'Der lokale Server hat geantwortet. Lies die Felder und vergleiche sie mit deinem Request. Diese Route normalisiert Text; sie ruft kein Modell auf.' : 'Der Server hat die Anfrage abgelehnt. Lies den Status und die Fehlermeldung. Diese Antwort ist keine erfolgreiche Normalisierung.';
    } catch (error) {
      if (id !== requestSerial) return;
      $('request-status').textContent = error.name === 'AbortError' ? 'Nach 8 Sekunden abgebrochen. Prüfe das Server-Terminal und versuche denselben Text erneut.' : 'Keine lesbare Backend-Antwort. Prüfe, ob der Server auf localhost:3217 läuft und Anfragen dieser Seite erlaubt. Die Simulation bleibt verfügbar.';
      showResponse({ error: error.name === 'AbortError' ? 'Zeitlimit erreicht' : 'Verbindung oder Browserfreigabe fehlgeschlagen' }, 'KEINE BACKEND-ANTWORT', true);
    } finally { clearTimeout(timeout); $('send').disabled = false; $('send').textContent = 'An Backend senden'; }
  });
  document.querySelectorAll('input[name="related"]').forEach((input) => input.addEventListener('change', () => { state.related = input.value; updateMatch(); save(); }));
  function exportAnswers() {
    const payload = { format: 'fallfinder-guided-answers-v2', exportedAt: new Date().toISOString(), answers: state };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'fallfinder-meine-antworten.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); $('save-status').textContent = 'JSON-Export erstellt. Bewahre die Datei für später auf.';
  }
  $('export').addEventListener('click', exportAnswers); $('export-final').addEventListener('click', exportAnswers);
  $('import-button').addEventListener('click', () => $('import').click());
  $('import').addEventListener('change', async (event) => {
    const file = event.target.files[0]; if (!file) return;
    try {
      if (file.size > 100000) throw new Error('Die Datei ist zu groß.');
      const value = JSON.parse(await file.text());
      if (!['fallfinder-guided-answers-v1', 'fallfinder-guided-answers-v2'].includes(value.format) || !value.answers) throw new Error('Keine Fallfinder-Antwortdatei.');
      const restored = validState(value.answers);
      if (!window.confirm('Gespeicherte Antworten durch diese Datei ersetzen?')) return;
      state = restored; hydrate(); $('save-status').textContent = 'Antworten aus deiner Datei wiederhergestellt.';
    } catch (error) { $('save-status').textContent = `Import fehlgeschlagen: ${error.message}`; }
    finally { event.target.value = ''; }
  });
  $('clear').addEventListener('click', () => {
    if (!window.confirm('Alle Antworten dieser Lernwerkstatt auf diesem Gerät zurücksetzen? Exportierte Dateien bleiben erhalten.')) return;
    serverConnected = false; clearTimeout(saveTimer); $('save-answers').disabled = true;
    state = { ...defaults }; hydrate(); $('save-status').textContent = 'Antworten zurückgesetzt. Du kannst neu beginnen.';
    $('server-status').textContent = 'Nur lokale Antworten zurückgesetzt. Serverstand bleibt erhalten. Zum Abgleichen erneut verbinden.';
  });
  function answerMap() {
    return Object.fromEntries(allowed.filter(key => key !== 'step').map(key => [key, String(state[key])]));
  }
  function queueServerSave() {
    if (!serverConnected) return;
    clearTimeout(saveTimer);
    $('server-status').textContent = 'Lokale Änderung. Noch nicht für die Lehrkraft bestätigt.';
    saveTimer = setTimeout(() => persistAnswers(), 1200);
  }
  function serverSnapshot(value) {
    if (!value || !Number.isInteger(value.revision) || value.revision < 0 || !value.answers || typeof value.answers !== 'object' || Array.isArray(value.answers)) throw new Error('Unvollständige Antwort des Speichers.');
    return value;
  }
  function describeConfirmed(snapshot) {
    if (snapshot.updatedAt) {
      const date = new Date(snapshot.updatedAt);
      const formatted = Number.isNaN(date.valueOf()) ? snapshot.updatedAt : date.toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
      $('server-status').textContent = `Für die Lehrkraft gespeichert: ${formatted} (Revision ${snapshot.revision}).`;
    } else $('server-status').textContent = 'Verbunden. Bisher keine bestätigte Serverspeicherung.';
  }
  function showServerChoice(snapshot, reason) {
    pendingServer = serverSnapshot(snapshot); serverConnected = false; clearTimeout(saveTimer);
    $('save-answers').disabled = true; $('server-choice').hidden = false;
    $('sync-settings').open = true;
    $('server-choice-text').textContent = reason + ' „Serverstand laden“ ersetzt deine lokalen Antworten. „Meine Antworten verbinden“ ergänzt den Serverstand mit deinen nicht leeren lokalen Antworten; bei gleichem Feld gewinnt deine lokale Fassung.';
    $('server-preview').textContent = JSON.stringify(pendingServer.answers, null, 2);
    $('server-status').textContent = 'Abgleich erforderlich. Lokale Antworten wurden nicht überschrieben.';
  }
  async function storageRequest(method, body) {
    if (!learnerToken) throw new Error('Persönlichen Zugangscode eingeben oder den bereitgestellten Zugangslink öffnen.');
    if (!['http:', 'https:'].includes(answersUrl.protocol)) throw new Error('Antwortspeicher über die bereitgestellte Unterrichtsadresse öffnen. Die lokale Datei speichert weiter auf diesem Gerät.');
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(answersUrl, { method, headers: { Authorization: 'Bearer ' + learnerToken, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}), signal: controller.signal, cache: 'no-store' });
      let data; try { data = await response.json(); } catch { throw new Error('Antwortspeicher liefert keine lesbare JSON-Antwort.'); }
      if (response.status === 409) return { conflict: serverSnapshot(data.current) };
      if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'Zugangscode nicht akzeptiert. Prüfe deinen persönlichen Code.' : `Speichern nicht bestätigt (HTTP ${response.status}). Lokale Antworten bleiben erhalten.`);
      return { data: serverSnapshot(data) };
    } finally { clearTimeout(timeout); }
  }
  async function connectAnswers() {
    if (saveInFlight) { $('server-status').textContent = 'Eine Speicherung läuft noch. Warte auf ihre Antwort.'; return; }
    const entered = $('learner-token').value.trim();
    if (entered) { learnerToken = entered; try { sessionStorage.setItem(sessionKey, learnerToken); } catch {} $('learner-token').value = ''; }
    $('connect-answers').disabled = true; serverConnected = false; clearTimeout(saveTimer);
    $('server-status').textContent = 'Antwortspeicher wird gelesen …';
    try {
      const { data } = await storageRequest('GET');
      const hasLocal = allowed.some(key => key !== 'step' && state[key] !== defaults[key] && String(state[key]).trim());
      if (hasLocal) showServerChoice(data, 'Es gibt bereits lokale Antworten. Wähle bewusst, welchen Stand du verwenden möchtest.');
      else { serverRevision = data.revision; state = validState({ ...data.answers, step: state.step }); hydrate(); serverConnected = true; $('save-answers').disabled = false; describeConfirmed(data); }
    } catch (error) { $('server-status').textContent = error.name === 'AbortError' ? 'Verbindung nach 12 Sekunden abgebrochen. Lokale Antworten bleiben erhalten.' : error.message; }
    finally { $('connect-answers').disabled = false; }
  }
  async function persistAnswers() {
    clearTimeout(saveTimer);
    if (!serverConnected) return;
    if (saveInFlight) { saveQueued = true; return; }
    saveInFlight = true; saveQueued = false; $('save-answers').disabled = true;
    const submitted = answerMap();
    $('server-status').textContent = 'Wird für die Lehrkraft gespeichert … noch nicht bestätigt.';
    try {
      const result = await storageRequest('PUT', { revision: serverRevision, answers: submitted });
      if (result.conflict) { showServerChoice(result.conflict, 'Der Serverstand wurde inzwischen geändert. Prüfe ihn vor dem Zusammenführen.'); return; }
      serverRevision = result.data.revision;
      if (JSON.stringify(submitted) !== JSON.stringify(answerMap())) { saveQueued = true; $('server-status').textContent = 'Zwischenstand gespeichert. Neuere lokale Änderungen folgen.'; }
      else describeConfirmed(result.data);
    } catch (error) { saveQueued = false; $('server-status').textContent = error.name === 'AbortError' ? 'Keine Bestätigung nach 12 Sekunden. Antworten bleiben lokal; erneutes Speichern ist möglich.' : error.message; }
    finally {
      saveInFlight = false; $('save-answers').disabled = !serverConnected;
      if (serverConnected && saveQueued) { saveQueued = false; saveTimer = setTimeout(() => persistAnswers(), 100); }
    }
  }
  $('connect-answers').addEventListener('click', connectAnswers);
  $('save-answers').addEventListener('click', persistAnswers);
  $('load-server').addEventListener('click', () => {
    if (!pendingServer) return;
    const snapshot = pendingServer; pendingServer = null; serverRevision = snapshot.revision;
    state = validState({ ...snapshot.answers, step: state.step }); $('server-choice').hidden = true; hydrate();
    serverConnected = true; $('save-answers').disabled = false; describeConfirmed(snapshot);
  });
  $('merge-server').addEventListener('click', () => {
    if (!pendingServer) return;
    const merged = { ...pendingServer.answers };
    for (const [key, value] of Object.entries(answerMap())) if (value.trim()) merged[key] = value;
    serverRevision = pendingServer.revision; pendingServer = null; state = validState({ ...merged, step: state.step });
    $('server-choice').hidden = true; hydrate(); serverConnected = true; $('save-answers').disabled = false;
    $('server-status').textContent = 'Zusammengeführt, noch nicht bestätigt. Klicke „Für Lehrkraft speichern“, um diesen Stand zu senden.';
  });
  $('reorder-records').addEventListener('click', () => { Array.from($('record-list').children).reverse().forEach(row => $('record-list').append(row)); });
  for (const [button, field, result, status] of [['reveal-search', 'searchPrediction', 'search-evidence', 'search-gate'], ['reveal-negation', 'negationPrediction', 'negation-evidence', 'negation-gate']]) {
    $(button).addEventListener('click', () => {
      if (!state[field].trim()) { $(status).textContent = 'Notiere zuerst eine eigene Vermutung im Feld darüber.'; $(field).focus(); return; }
      $(result).hidden = false; $(status).textContent = 'Gespeicherte echte Ausgabe sichtbar. Beim Aufdecken wurde kein Modell ausgeführt.';
    });
  }
  hydrate();
  if (learnerToken) connectAnswers();
})();
