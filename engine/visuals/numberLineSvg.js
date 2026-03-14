function generateNumberLineSvg({
  start = 0,
  end = 10,
  highlight = null,
  jumpFrom = null,
  jumpTo = null,
  width = 420,
  height = 90
}) {
  const padding = 30;
  const lineY = 40;
  const usableWidth = width - padding * 2;
  const range = end - start || 1;
  const step = usableWidth / range;

  function xFor(value) {
    return padding + (value - start) * step;
  }

  let ticks = "";
  let labels = "";

  for (let v = start; v <= end; v++) {
    const x = xFor(v);

    ticks += `
      <line
        x1="${x}"
        y1="${lineY - 8}"
        x2="${x}"
        y2="${lineY + 8}"
        stroke="black"
        stroke-width="2"
      />
    `;

    labels += `
      <text
        x="${x}"
        y="${lineY + 28}"
        font-size="14"
        text-anchor="middle"
        fill="black"
      >${v}</text>
    `;
  }

  let highlightCircle = "";
  if (highlight !== null && highlight >= start && highlight <= end) {
    const x = xFor(highlight);
    highlightCircle = `
      <circle
        cx="${x}"
        cy="${lineY}"
        r="10"
        fill="white"
        stroke="black"
        stroke-width="2"
      />
    `;
  }

  let jumpArc = "";
  if (
    jumpFrom !== null &&
    jumpTo !== null &&
    jumpFrom >= start &&
    jumpFrom <= end &&
    jumpTo >= start &&
    jumpTo <= end
  ) {
    const x1 = xFor(jumpFrom);
    const x2 = xFor(jumpTo);
    const midX = (x1 + x2) / 2;
    const arcHeight = Math.max(20, Math.abs(x2 - x1) / 2);

    jumpArc = `
      <path
        d="M ${x1} ${lineY} Q ${midX} ${lineY - arcHeight} ${x2} ${lineY}"
        fill="none"
        stroke="black"
        stroke-width="2"
      />
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <line
        x1="${padding}"
        y1="${lineY}"
        x2="${width - padding}"
        y2="${lineY}"
        stroke="black"
        stroke-width="2"
      />
      ${ticks}
      ${labels}
      ${highlightCircle}
      ${jumpArc}
    </svg>
  `;
}

module.exports = generateNumberLineSvg;