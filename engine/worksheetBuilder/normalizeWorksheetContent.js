// engine/worksheetBuilder/normalizeWorksheetContent.js

function normalizeVisual(visual = {}) {
  if (!visual || !visual.kind) return null;

  let kind = visual.kind;
  const data = { ...(visual.data || {}) };

  if (kind === "arrays") kind = "array";
  if (kind === "tenframe") kind = "ten_frame";
  if (kind === "base_ten") kind = "base_ten_blocks";

  if (kind === "number_line") {
    return {
      kind,
      data: {
        min: Number(data.min ?? data.start ?? 0),
        max: Number(data.max ?? data.end ?? 10),
        value: Number(data.value ?? data.highlight ?? data.min ?? data.start ?? 0)
      }
    };
  }

  if (kind === "ten_frame") {
    return {
      kind,
      data: {
        filled: Number(data.filled ?? 0),
        frames: Number(data.frames ?? 1)
      }
    };
  }

  if (kind === "array") {
    return {
      kind,
      data: {
        rows: Number(data.rows ?? 1),
        cols: Number(data.cols ?? 1)
      }
    };
  }

  if (kind === "base_ten_blocks") {
    return {
      kind,
      data: {
        hundreds: Number(data.hundreds ?? 0),
        tens: Number(data.tens ?? 0),
        ones: Number(data.ones ?? 0)
      }
    };
  }

  return { kind, data };
}

function normalizeItem(item = {}, index = 0, meta = {}) {
  return {
    id: item.id ?? index + 1,
    type: item.type ?? "question",
    prompt: item.prompt ?? item.text ?? item.question ?? "",
    answer: item.answer ?? "",
    a: item.a,
    b: item.b,
    op: item.op,
    visual: normalizeVisual(item.visual),
    meta: {
      grade: meta.grade ?? item.grade ?? null,
      strand: meta.strand ?? item.strand ?? null,
      expectation: meta.expectation ?? item.expectation ?? null,
      skill: meta.skill ?? item.skill ?? null
    }
  };
}

function normalizeWorksheetContent(contentObject = {}) {
  const meta = contentObject.meta || {};
  const rawItems =
    contentObject?.content?.items?.length
      ? contentObject.content.items
      : contentObject?.problems || [];

  const normalizedItems = rawItems.map((item, index) =>
    normalizeItem(item, index, meta)
  );

  return {
    ...contentObject,
    content: {
      ...(contentObject.content || {}),
      items: normalizedItems
    }
  };
}

module.exports = {
  normalizeWorksheetContent
};