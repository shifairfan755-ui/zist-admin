export function parseDocumentFilename(filename) {
  const original = filename;

  // Remove extension
  const noExt = filename.replace(/\.[^/.]+$/, "");

  // Split by common separators: _, -, space
  const parts = noExt.split(/[_\-\s]+/);

  // 1) Detect Beneficiary ID (first number found)
  const id = parts.find((p) => /^\d+$/.test(p)) || null;

  // 2) Detect Document Type (cheque, minutes, idcard, passport, aadhar, etc.)
  const knownTypes = [
    "cheque",
    "minutes",
    "form",
    "idcard",
    "passport",
    "aadhaar",
    "report",
    "application",
    "photo",
    "receipt",
  ];

  let docType =
    parts.find((p) =>
      knownTypes.includes(p.toLowerCase())
    ) || "document";

  // 3) Detect Date (YOLO — find yyyy-mm-dd)
  const dateRegex = /\d{4}-\d{2}-\d{2}/;
  const detectedDate = noExt.match(dateRegex);

  const parsed = {
    original,
    id: id ? id : null,
    docType: docType.toUpperCase(),
    documentDate: detectedDate ? detectedDate[0] : null,
  };

  return parsed;
}
