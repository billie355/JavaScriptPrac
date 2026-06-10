import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import moment from 'moment';

const DATA_PATH = './data.json';

// Run a git command synchronously - no race conditions, no lock issues
function git(args) {
  execSync(`git ${args}`, { stdio: 'pipe' });
}

function makeCommits(count, date) {
  const dateStr = date.format();
  for (let i = 0; i < count; i++) {
    writeFileSync(DATA_PATH, JSON.stringify({ date: dateStr }));
    git(`add ${DATA_PATH}`);
    git(`commit --allow-empty -m "${dateStr}" --date="${dateStr}"`);
  }
}

// === SCATTERED DISTRIBUTION ===
// High empty % = lots of grey gaps = natural/random look
function getWeightsForYear(year) {
  if (year <= 2012) {
    return [
      { commits: 0, weight: 85 },
      { commits: 1, weight: 10 },
      { commits: 2, weight: 4 },
      { commits: 3, weight: 1 },
    ];
  } else if (year <= 2015) {
    return [
      { commits: 0, weight: 78 },
      { commits: 1, weight: 13 },
      { commits: 2, weight: 6 },
      { commits: 3, weight: 2 },
      { commits: 4, weight: 1 },
    ];
  } else if (year <= 2018) {
    return [
      { commits: 0, weight: 72 },
      { commits: 1, weight: 16 },
      { commits: 2, weight: 8 },
      { commits: 3, weight: 3 },
      { commits: 5, weight: 1 },
    ];
  } else if (year <= 2020) {
    return [
      { commits: 0, weight: 68 },
      { commits: 1, weight: 18 },
      { commits: 2, weight: 9 },
      { commits: 3, weight: 4 },
      { commits: 5, weight: 1 },
    ];
  } else if (year <= 2024) {
    // 2021-2024: active pero maraming lagtaw pa rin
    return [
      { commits: 0, weight: 62 },  // 62% empty = lots of grey
      { commits: 1, weight: 20 },  // light green - most common green
      { commits: 2, weight: 11 },  // light green
      { commits: 3, weight: 5 },   // solid green
      { commits: 5, weight: 2 },   // dark green (bihira)
    ];
  } else {
    // 2025: scattered din, may konting mas active moments
    return [
      { commits: 0, weight: 60 },
      { commits: 1, weight: 21 },
      { commits: 2, weight: 12 },
      { commits: 3, weight: 5 },
      { commits: 5, weight: 2 },
    ];
  }
}

function pickCommitCount(year) {
  const weights = getWeightsForYear(year);
  const total = weights.reduce((s, l) => s + l.weight, 0);
  let rand = Math.floor(Math.random() * total);
  for (const level of weights) {
    rand -= level.weight;
    if (rand < 0) return level.commits;
  }
  return 0;
}

// === MAIN ===
const START = moment('2010-01-01');
const END   = moment('2025-06-09'); // hanggang kahapon

const current = START.clone();
let total = 0;
let lastYear = 0;

console.log('🌱 Generating scattered contributions (2010–2025)...\n');

while (current.isSameOrBefore(END, 'day')) {
  const year = current.year();
  if (year !== lastYear) {
    lastYear = year;
    console.log(`\n📆 === ${year} ===`);
  }

  const count = pickCommitCount(year);
  if (count > 0) {
    console.log(`📅 ${current.format('YYYY-MM-DD')} → ${count} commit(s)`);
    makeCommits(count, current.clone());
    total += count;
  }

  current.add(1, 'days');
}

console.log(`\n✅ Done! Total commits: ${total}`);
console.log('👉 Now run: git push origin main --force');
