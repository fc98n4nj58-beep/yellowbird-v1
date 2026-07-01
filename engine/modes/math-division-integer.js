function parseList(str) {
  if (!str) return null;
  const nums = String(str)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n));
  return nums.length ? nums : null;
}

function range(min, max) {
  const out = [];
  for (let n = min; n <= max; n++) out.push(n);
  return out;
}

function clampRange(minVal, maxVal, fallbackMin, fallbackMax) {
  let mn = Number(minVal);
  let mx = Number(maxVal);
  if (!Number.isFinite(mn)) mn = fallbackMin;
  if (!Number.isFinite(mx)) mx = fallbackMax;
  if (mn > mx) [mn, mx] = [mx, mn];
  return { mn, mx };
}
function shuffle(arr, random = Math.random) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildPools(params) {
  const only = parseList(params.only);
  const exclude = new Set(parseList(params.exclude) || []);

  const A = clampRange(params.aMin, params.aMax, 1, 144); // used as dividend/quotient pool
  const B = clampRange(params.bMin, params.bMax, 1, 12);  // used as divisor pool

  let aPool = only ? [...only] : range(A.mn, A.mx);
  let bPool = only ? [...only] : range(B.mn, B.mx);

  aPool = aPool.filter((n) => !exclude.has(n));
  bPool = bPool.filter((n) => !exclude.has(n));

  if (!aPool.length || !bPool.length) {
    const err = new Error("No valid numbers available after applying Only/Exclude and ranges.");
    err.status = 400;
    throw err;
  }

  return { aPool, bPool };
}

function buildUniqueDivisionPool(aPool, bPool, integerOnly) {
  const combosStrict = [];
  const combosLoose = [];

  // Prefer strict: dividend a must also be in aPool
  const aSet = new Set(aPool);

  for (const b of bPool) {
    for (const q of aPool) {
      const a = b * q;
      const pair = { a, b, q };

      if (integerOnly) {
        if (aSet.has(a)) combosStrict.push(pair);
        else combosLoose.push(pair);
      } else {
        // remainder mode not implemented yet; keep integer behavior
        if (aSet.has(a)) combosStrict.push(pair);
        else combosLoose.push(pair);
      }
    }
  }

  // If strict yields nothing (common when A range is tiny), fall back to loose
  return combosStrict.length ? combosStrict : combosLoose;
}

function generate(params = {}) {
  const random = params.random || Math.random;
  const { aPool, bPool } = buildPools(params);
  const count = Math.min(200, Math.max(5, parseInt(params.count ?? "30", 10)));
  const integerOnly = (params.intdiv ?? "1").toString() !== "0";

  const pool = buildUniqueDivisionPool(aPool, bPool, integerOnly);
  if (!pool.length) {
    const err = new Error("No valid division questions can be generated with these constraints.");
    err.status = 400;
    throw err;
  }

  const items = [];
  let id = 1;

  while (items.length < count) {
    const batch = shuffle([...pool], random);
    for (const p of batch) {
      items.push({
        id,
        type: "equation",
        a: p.a,
        b: p.b,
        op: "÷",
        prompt: `${p.a} ÷ ${p.b} =`,
        answer: p.q,
      });
      id++;
      if (items.length >= count) break;
    }
  }

  return {
    meta: {
      modeId: "math.division.integer",
      subject: "math",
      title: "Division Practice",
      subtitle: "Name: ____________________    Date: ____________________",
    },
    content: { instructions: null, items },
  };
}

module.exports = { generate };