function createSeededRandom(seedInput = "yellowbird") {
  let seed = 0;
  const str = String(seedInput);

  for (let i = 0; i < str.length; i++) {
    seed = (seed * 31 + str.charCodeAt(i)) >>> 0;
  }

  return function seededRandom() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

module.exports = {
  createSeededRandom
};
