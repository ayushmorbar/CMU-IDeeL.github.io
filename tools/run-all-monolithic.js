import { migrateSingleMonolithicSemester } from './migrate-monolithic.js';

const terms = ['S25', 'F24', 'S24', 'F23', 'S23', 'F22', 'S22', 'F21', 'S21', 'F20', 'S20'];

console.log(`Starting migration for ${terms.length} historical monolithic semesters...`);

for (const term of terms) {
  try {
    migrateSingleMonolithicSemester(term);
  } catch (err) {
    console.error(`Error migrating ${term}:`, err);
  }
}

console.log('\nAll monolithic semesters processed!');
