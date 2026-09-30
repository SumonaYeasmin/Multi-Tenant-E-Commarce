import { searchSynonyms } from '../data/content';
import type { Product } from '../types/commerce';

function levenshtein(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

function haystack(p: Product) {
  return `${p.title} ${p.brand} ${p.subcategory} ${p.category} ${p.tags.join(' ')} ${p.colors.map((c) => c.name).join(' ')}`.toLowerCase();
}

export function normaliseQuery(q: string) {
  return q
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((w) => searchSynonyms[w] ?? w)
    .join(' ');
}

export function searchProducts(products: Product[], q: string) {
  const query = normaliseQuery(q);
  if (!query) return { results: [] as Product[], suggestion: null as string | null };
  const words = query.split(' ');
  const results = products.filter((p) => {
    const h = haystack(p);
    return words.every((w) => h.includes(w));
  });
  if (results.length > 0) return { results, suggestion: null };

  // typo tolerance: find the closest vocabulary word for each query word
  const vocab = Array.from(new Set(products.flatMap((p) => haystack(p).split(/[^a-z0-9-]+/)).filter((w) => w.length > 2)));
  let corrected = false;
  const fixed = words.map((w) => {
    let best = w;
    let bestD = Infinity;
    vocab.forEach((v) => {
      const d = levenshtein(w, v);
      if (d < bestD) {
        bestD = d;
        best = v;
      }
    });
    if (bestD > 0 && bestD <= Math.max(1, Math.floor(w.length / 3))) {
      corrected = true;
      return best;
    }
    return w;
  });
  if (!corrected) return { results: [], suggestion: null };
  const suggestion = fixed.join(' ');
  const fixedResults = products.filter((p) => fixed.every((w) => haystack(p).includes(w)));
  return { results: fixedResults, suggestion };
}
