function generateArraySvg({ rows = 3, cols = 4, cellSize = 30 }) {
  const width = cols * cellSize;
  const height = rows * cellSize;

  let rects = "";

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rects += `
        <rect
          x="${c * cellSize}"
          y="${r * cellSize}"
          width="${cellSize}"
          height="${cellSize}"
          fill="white"
          stroke="black"
        />
      `;
    }
  }

  return `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="${width}"
    height="${height}"
    viewBox="0 0 ${width} ${height}"
  >
    ${rects}
  </svg>
  `;
}

module.exports = generateArraySvg;