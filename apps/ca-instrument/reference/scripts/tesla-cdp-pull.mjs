// tesla-cdp-pull.mjs — drive a real headful Windows Chrome over the DevTools
// Protocol to pull Tesla pricing past Akamai's bot wall. See ../data-sourcing.md
// for the full runbook; this is the connect + extract skeleton to adapt.
//
// Why headful Chrome over CDP: curl / WebFetch / headless Chrome all get a 403
// "Access Denied" from Akamai. A real headful browser passes the fingerprint.
//
// Prereq — launch Chrome first (fresh throwaway profile, window onscreen):
//   chrome.exe --remote-debugging-port=9222 \
//     --user-data-dir="C:\Windows\Temp\tesla-cdp" \
//     --no-first-run --no-default-browser-check about:blank
//
// Run with a recent node.exe (Node 22+ for global WebSocket). Zero npm deps.

const PORT = 9222;
let _id = 0;

async function pickTarget() {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = list.find((t) => t.type === 'page');
  if (!page) throw new Error('no page target — is Chrome up with --remote-debugging-port=9222?');
  return page.webSocketDebuggerUrl;
}

// Minimal CDP client: open the socket, match responses to request ids.
function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  const pending = new Map();
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
  });
  const ready = new Promise((res) => ws.addEventListener('open', () => res()));
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++_id;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  return { ready, send };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const evaluate = (send, expression) =>
  send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    .then((r) => r.result.value);

async function main() {
  const { ready, send } = connect(await pickTarget());
  await ready;
  await send('Page.enable');
  await send('Runtime.enable');

  // 1. Load the design (trim configurator) page.
  await send('Page.navigate', { url: 'https://www.tesla.com/en_ca/model3/design' });
  await sleep(6000); // let it settle + Akamai run

  // 2. Akamai press-and-hold: if #sec-if-cpt-container is present and the title
  //    isn't real, inject Input.dispatchMouseEvent mouseMoved events in a loop
  //    until document.title resolves. (Bring the window onscreen first via
  //    Browser.setWindowBounds.) Also dismiss the cookie + region overlay — if
  //    document.body.innerText is full of country names, the overlay is open.
  //    See ../data-sourcing.md §3.

  // 3. Pull the embedded dataJson bootstrap. It's JS (trailing commas), not
  //    strict JSON, so the caller eval()s the brace-matched string.
  const raw = await evaluate(send, String.raw`(() => {
    const s = [...document.querySelectorAll('script')]
      .map((n) => n.textContent).find((t) => t && t.includes('dataJson'));
    if (!s) return null;
    let i = s.indexOf('{', s.indexOf('dataJson'));
    let depth = 0, inStr = false, q = '';
    for (let j = i; j < s.length; j++) {
      const c = s[j], prev = s[j - 1];
      if (inStr) { if (c === q && prev !== '\\') inStr = false; continue; }
      if (c === '"' || c === "'") { inStr = true; q = c; }
      else if (c === '{') depth++;
      else if (c === '}' && --depth === 0) return s.slice(i, j + 1);
    }
    return null;
  })()`);

  // eslint-disable-next-line no-eval
  const dataJson = raw ? eval('(' + raw + ')') : null;
  const ds = dataJson && dataJson.DSServices;
  // Trim prices: ds['Lexicon.m3'] (base $MDLx + trim-delta $MTxxx). Fees:
  // ds['Fees.m3.m3']. NOTE: ds['Lease.m3.m3'] / ['Loan.m3.m3'] are EMPTY here —
  // per-trim money factor / residual / APR live in the script's code tail and are
  // read off the rendered Finance/Lease tabs (click each trim). See the runbook.
  console.log(ds ? Object.keys(ds).sort().join('\n') : 'dataJson not found');
}

main().catch((e) => { console.error(e); process.exit(1); });
