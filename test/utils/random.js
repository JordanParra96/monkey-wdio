/**
 * Generador de números aleatorios con semilla (Seedable PRNG).
 * Algoritmo: Mulberry32.
 * @param {number} a - La semilla (Seed) inicial (ej: 12345)
 * @returns {function} - Una función que reemplaza a Math.random()
 */
export function createSeededRandom(a) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
