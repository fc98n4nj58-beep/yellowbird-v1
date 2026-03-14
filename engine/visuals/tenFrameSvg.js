function generateTenFrameSvg({ filled = 5, cellSize = 28 }) {

  const cols = 5;
  const rows = 2;

  const width = cols * cellSize;
  const height = rows * cellSize;

  let cells = "";

  for (let i = 0; i < 10; i++) {

    const r = Math.floor(i / cols);
    const c = i % cols;

    const cx = c * cellSize + cellSize / 2;
    const cy = r * cellSize + cellSize / 2;

    const filledCircle = i < filled;

    cells += `
      <circle
        cx="${cx}"
        cy="${cy}"
        r="${cellSize / 3}"
        fill="${filledCircle ? "black" : "white"}"
        stroke="black"
        stroke-width="2"
      />
    `;
  }

  return `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="${width}"
    height="${height}"
    viewBox="0 0 ${width} ${height}"
  >
    ${cells}
  </svg>
  `;
}

module.exports = generateTenFrameSvg;