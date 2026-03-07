const { buildWorksheet } = require("../engine/worksheetBuilder/buildWorksheet");

try {
  const worksheet = buildWorksheet("B2.4");

  console.log("Worksheet generated successfully.\n");
  console.log(JSON.stringify(worksheet, null, 2));
} catch (error) {
  console.error("Worksheet generation failed:");
  console.error(error.message);
  process.exit(1);
}