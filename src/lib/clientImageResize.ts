// Client-side resize for images the browser can decode natively
// (JPEG/PNG/WebP/GIF). HEIC is left untouched — the server handles it via
// heic-convert because Chrome/Firefox can't decode HEIC.
//
// Why this exists: Vercel imposes a hard 4.5MB body limit on every
// request. A 3000x4000 photo from a clipboard manager can easily be
// 15-20MB as PNG. Re-encoding to JPEG ~1600px is enough for our admin
// previews and brings file size to ~200-500KB.

const HEIC_MIMES = new Set(["image/heic", "image/heif", "image/heic-sequence"]);

function isHeic(file: File) {
  if (HEIC_MIMES.has(file.type.toLowerCase())) return true;
  const name = file.name.toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

async function decodeBlob(blob: Blob): Promise<ImageBitmap> {
  // imageOrientation: from-image makes the bitmap respect EXIF orientation
  // when the source has one — clipboard-manager re-encodes typically don't,
  // and that's fine: server-side `sharp.rotate()` is a no-op in that case.
  return await createImageBitmap(blob, { imageOrientation: "from-image" });
}

function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("No se pudo codificar la imagen"));
        else resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

/**
 * If the browser can decode this file (i.e. not HEIC), re-encode it as a
 * JPEG with the longest side capped at maxSize. Returns the same File
 * unchanged when it can't be processed client-side (HEIC).
 */
export async function shrinkForUpload(
  file: File,
  opts: { maxSize?: number; quality?: number; baseName?: string } = {},
): Promise<File> {
  const { maxSize = 1600, quality = 0.85, baseName = "upload" } = opts;
  if (isHeic(file)) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await decodeBlob(file);
  } catch {
    // Browser couldn't decode (unusual format). Send original to server.
    return file;
  }

  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = longest > maxSize ? maxSize / longest : 1;
  const targetW = Math.max(1, Math.round(bitmap.width * scale));
  const targetH = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  const jpegBlob = await canvasToJpegBlob(canvas, quality);
  return new File([jpegBlob], `${baseName}.jpg`, { type: "image/jpeg" });
}
