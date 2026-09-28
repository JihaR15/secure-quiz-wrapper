"use client";

/**
 * Renders the quiz link as a PNG and hands it to the browser as a download.
 *
 * The QR matrix is computed here rather than scraped from the on-screen SVG so
 * the exported file is a fixed high-contrast black-on-white image. A code that
 * inherits the dark theme is fine to look at but bad to scan off a projector
 * or a printed handout.
 */
export async function downloadQrPng(
  value: string,
  fileName: string
): Promise<void> {
  const size = 1024;
  const margin = 64;

  // Loaded on demand: the exam runner never needs this, and the PNG encoder
  // is only pulled in when a teacher actually asks for a download.
  const { create } = await import("qrcode");
  const qr = create(value, { errorCorrectionLevel: "H" });
  const count = qr.modules.size;
  const cell = (size - margin * 2) / count;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D is unavailable in this browser.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size, size);
  context.fillStyle = "#000000";

  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.modules.get(row, col)) continue;
      const x = margin + col * cell;
      const y = margin + row * cell;
      // Slight overlap avoids hairline seams between cells at high densities.
      context.fillRect(x, y, Math.ceil(cell), Math.ceil(cell));
    }
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  if (!blob) {
    throw new Error("Could not encode the QR code as PNG.");
  }

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
