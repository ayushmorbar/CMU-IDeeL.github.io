import fs from 'node:fs';
import * as cheerio from 'cheerio';

const terms = ['S25', 'F24', 'S24', 'F23', 'S23', 'F22', 'S22', 'F21', 'S21', 'F20', 'S20'];

for (const t of terms) {
  const file = `${t}/index.html`;
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(html);
  
  // Find Active Deadlines
  let activeDeadlines = [];
  $('h2').each((i, el) => {
    if ($(el).text().includes('Active Deadlines')) {
      const table = $(el).nextAll('.table-responsive').first().find('table');
      table.find('tbody tr').each((rIdx, tr) => {
        const text = $(tr).text().replace(/\s+/g, ' ').trim();
        const link = $(tr).find('a').attr('href');
        if (text && link) {
          activeDeadlines.push({ text, link });
        }
      });
    }
  });
  
  // Staff
  let instructors = [];
  let tas = [];
  $('li').each((i, el) => {
    const p = $(el).parent().prev();
    const pText = p.text().toLowerCase();
    const text = $(el).text().trim();
    if (pText.includes('instructor')) {
      instructors.push(text);
    } else if (pText.includes('ta') || pText.includes('teaching assistant')) {
      tas.push(text);
    }
  });
  
  // Calendars / Events
  const iframes = $('iframe').map((i, el) => $(el).attr('src')).get().filter(s => s && s.includes('calendar.google.com'));
  
  console.log(`=== ${t} ===`);
  console.log(`  Active Deadlines (${activeDeadlines.length}):`, activeDeadlines);
  console.log(`  Instructors (${instructors.length}):`, instructors.slice(0, 3));
  console.log(`  TAs count:`, tas.length);
  console.log(`  Calendars (${iframes.length})`);
}
