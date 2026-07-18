/**
 * A tiny seeded PRNG (mulberry32). Used anywhere an effect needs
 * "random-looking" per-item values (star positions, dust drift
 * offsets) but must render identically during SSR and on the client
 * — true Math.random() would produce a hydration mismatch since
 * server and client runs would disagree.
 */
export function seededRandom(seed: number): () => number {
  let t = seed;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}