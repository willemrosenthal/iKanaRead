export function seededHexColor(seed) {
  if (seed < 0 || seed > 100) throw new Error("Seed must be between 0 and 100");

  // A simple pseudo-random generator using sine
  function pseudoRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x); // returns a float between 0 and 1
  }

  // Generate RGB components using the seed
  const r = Math.floor(pseudoRandom(seed) * 256);
  const g = Math.floor(pseudoRandom(seed + 33) * 256); // offset seeds to diversify
  const b = Math.floor(pseudoRandom(seed + 66) * 256);

  // Convert to hex and pad with 0 if needed
  const toHex = (n) => n.toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
