import fs from 'node:fs';
import * as cheerio from 'cheerio';

const terms = ['S25', 'F24', 'S24', 'F23', 'S23', 'F22', 'S22', 'F21', 'S21', 'F20', 'S20'];

for (const t of terms) {
  const file = `${t}/index.html`;
  if (!fs.existsSync(file)) {
    console.log(t, 'missing index.html');
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(html);
  
  const tables = $('table');
  console.log(`=== ${t} ===`);
  console.log(`Tables count: ${tables.length}`);
  tables.each((idx, table) => {
    const parentId = $(table).closest('[id]').attr('id') || $(table).attr('id') || 'no-id';
    const firstRow = $(table).find('tr:first').text().replace(/\s+/g, ' ').trim().slice(0, 60);
    const rows = $(table).find('tr').length;
    console.log(`  Table ${idx}: id/parent=${parentId}, rows=${rows}, header="${firstRow}"`);
  });
}
