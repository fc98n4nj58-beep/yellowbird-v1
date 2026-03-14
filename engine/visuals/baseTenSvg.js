function generateBaseTenSvg({ hundreds = 0, tens = 0, ones = 0, unit = 20 }) {
  const gap = 6;
  const flatSize = unit * 5;
  const rodWidth = unit;
  const rodHeight = unit * 5;
  const oneSize = unit;

  let x = 0;
  let svgParts = [];

  for (let i = 0; i < hundreds; i++) {
    svgParts.push(`
      <rect
        x="${x}"
        y="0"
        width="${flatSize}"
        height="${flatSize}"
        fill="white"
        stroke="black"
      />
    `);

    for (let r = 1; r < 5; r++) {
      svgParts.push(`<line x1="${x}" y1="${r * unit}" x2="${x + flatSize}" y2="${r * unit}" stroke="black" />`);
      svgParts.push(`<line x1="${x + r * unit}" y1="0" x2="${x + r * unit}" y2="${flatSize}" stroke="black" />`);
    }

    x += flatSize + gap;
  }

  for (let i = 0; i < tens; i++) {
    svgParts.push(`
      <rect
        x="${x}"
        y="0"
        width="${rodWidth}"
        height="${rodHeight}"
        fill="white"
        stroke="black"
      />
    `);

    for (let r = 1; r < 5; r++) {
      svgParts.push(`<line x1="${x}" y1="${r * unit}" x2="${x + rodWidth}" y2="${r * unit}" stroke="black" />`);
    }

    x += rodWidth + gap;
  }

  for (let i = 0; i < ones; i++) {
    svgParts.push(`
      <rect
        x="${x}"
        y="0"
        width="${oneSize}"
        height="${oneSize}"
        fill="white"
        stroke="black"
      />
    `);
    x += oneSize + gap;
  }

  const width = Math.max(x, 60);
  const height = flatSize;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${svgParts.join("")}
    </svg>
  `;
}

module.exports = generateBaseTenSvg;