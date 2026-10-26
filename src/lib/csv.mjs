// Minimal parser for the catalog CSVs: semicolon separated, UTF-8 (with or without BOM),
// fields quoted with " when they contain ; " or line breaks. Shared by the site and scripts.

/**
 * @param {string} text
 * @returns {{ header: string[], rows: { line: number, values: Record<string, string> }[] }}
 */
export function parseCsv(text) {
  const records = [];
  let record = [];
  let field = '';
  let quoted = false;
  let line = 1;
  let recordLine = 1;

  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else {
        if (c === '\n') line++;
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ';') {
      record.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      record.push(field);
      records.push({ line: recordLine, fields: record });
      record = [];
      field = '';
      line++;
      recordLine = line;
    } else {
      field += c;
    }
  }
  if (field || record.length) {
    record.push(field);
    records.push({ line: recordLine, fields: record });
  }

  const nonEmpty = records.filter((r) => r.fields.some((f) => f.trim()));
  const [head, ...body] = nonEmpty;
  const header = (head?.fields ?? []).map((h) => h.trim());
  const rows = body.map((r) => ({
    line: r.line,
    values: Object.fromEntries(header.map((h, idx) => [h, (r.fields[idx] ?? '').trim()])),
  }));
  return { header, rows };
}
