// Lightweight CSV loader used across pages (simple header-driven parser)
// Keeps behavior consistent with the user's preference for a minimal parser.
async function loadCSV(url) {
  const text = await fetch(url).then(r => r.text());
  const [headerLine, ...lines] = (text || '').trim().split("\n");
  const headers = (headerLine || '').split(",").map(h => h.trim());
  return (lines || []).map(line => {
    const cols = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h, (cols[i] || '').trim()]));
  });
}

// Expose as window.loadCSV for older pages that expect a global
window.loadCSV = loadCSV;
