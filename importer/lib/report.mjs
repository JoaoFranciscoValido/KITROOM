import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export function createReport(options) {
  return {
    startedAt: new Date().toISOString(),
    finishedAt: null,
    options,
    totals: {},
    imported: [],   // new products
    updated: [],    // existing products whose photos or data changed
    unchanged: [],  // existing products, nothing new
    skipped: [],    // { id, title, url, reason }
    unavailable: [],// products no longer found in the source
    errors: [],     // { scope, id?, url?, message }
  };
}

export async function writeReport(report, dir) {
  report.finishedAt = new Date().toISOString();
  report.totals = {
    imported: report.imported.length,
    updated: report.updated.length,
    unchanged: report.unchanged.length,
    skipped: report.skipped.length,
    unavailable: report.unavailable.length,
    errors: report.errors.length,
    imagesDownloaded: report.imported.concat(report.updated).reduce((a, p) => a + (p.downloaded || 0), 0),
    duplicateImagesSkipped: report.imported.concat(report.updated, report.unchanged).reduce((a, p) => a + (p.duplicates || 0), 0),
  };
  await mkdir(dir, { recursive: true });
  const stamp = report.startedAt.replace(/[:.]/g, '-').slice(0, 19);
  const jsonPath = path.join(dir, `import-${stamp}.json`);
  const mdPath = path.join(dir, `import-${stamp}.md`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2));
  await writeFile(mdPath, toMarkdown(report));
  return { jsonPath, mdPath };
}

const row = p => `| ${p.name || p.title || ''} | \`${p.id}\` | ${p.images ?? ''} | ${p.downloaded ?? ''} | ${p.duplicates ?? ''} |`;

function toMarkdown(r) {
  const t = r.totals;
  const lines = [
    `# Catalogue import report`,
    ``,
    `- Started: ${r.startedAt}`,
    `- Finished: ${r.finishedAt}`,
    `- Options: \`${JSON.stringify(r.options)}\``,
    ``,
    `| Imported | Updated | Unchanged | Skipped | No longer in source | Errors | Images downloaded | Duplicate images skipped |`,
    `|---|---|---|---|---|---|---|---|`,
    `| ${t.imported} | ${t.updated} | ${t.unchanged} | ${t.skipped} | ${t.unavailable} | ${t.errors} | ${t.imagesDownloaded} | ${t.duplicateImagesSkipped} |`,
    ``,
  ];
  const table = (title, list) => {
    if (!list.length) return;
    lines.push(`## ${title} (${list.length})`, ``, `| Product | ID | Photos | Downloaded | Duplicates |`, `|---|---|---|---|---|`, ...list.map(row), ``);
  };
  table('Imported', r.imported);
  table('Updated', r.updated);
  if (r.skipped.length) {
    lines.push(`## Skipped (${r.skipped.length})`, ``, `| Album | Reason | URL |`, `|---|---|---|`, ...r.skipped.map(s => `| ${s.title || s.id} | ${s.reason} | ${s.url || ''} |`), ``);
  }
  if (r.unavailable.length) {
    lines.push(`## No longer in source, marked unavailable (${r.unavailable.length})`, ``, ...r.unavailable.map(u => `- ${u.name} (\`${u.id}\`)`), ``);
  }
  if (r.errors.length) {
    lines.push(`## Errors (${r.errors.length})`, ``, ...r.errors.map(e => `- **${e.scope}** ${e.id ? '`' + e.id + '` ' : ''}${e.message}${e.url ? ' — ' + e.url : ''}`), ``);
  }
  if (r.unchanged.length) lines.push(`## Unchanged (${r.unchanged.length})`, ``, `${r.unchanged.map(u => u.name).join(', ')}`, ``);
  return lines.join('\n');
}
