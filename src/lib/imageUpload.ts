// Client-side image preprocessing for CMS uploads.
// Converts HEIC (iPhone) to JPEG and resizes large photos so we never hit
// the Server Action body limit and the bucket only stores web-friendly files.

const HEIC_MIMES = new Set(["image/heic", "image/heif", "image/heic-sequence"]);

function isHeic(file: File) {
  if (HEIC_MIMES.has(file.type.toLowerCase())) return true;
  const name = file.name.toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

async function heicToJpegBlob(file: File, quality: number): Promise<Blob> {
  const mod = await import("heic2any");
  const heic2any = (mod.default ?? mod) as (opts: {
    blob: Blob;
    toType?: string;
    quality?: number;
  }) => Promise<Blob | Blob[]>;
  const out = await heic2any({ blob: file, toType: "image/jpeg", quality });
  return Array.isArray(out) ? out[0] : out;
}

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
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

export interface PrepareUploadOptions {
  /** Largo máximo del lado más grande, en píxeles. Default 1600. */
  maxSize?: number;
  /** Calidad JPEG 0–1. Default 0.85. */
  quality?: number;
  /** Nombre base para el archivo resultante. Default "upload". */
  baseName?: string;
}

/**
 * Prepares a user-supplied image for upload:
 *  - Converts HEIC to JPEG when needed
 *  - Resizes so the largest side fits maxSize (only if larger)
 *  - Re-encodes to JPEG at the given quality
 * Returns a new File ready to drop into FormData.
 */
export async function prepareImageForUpload(
  input: File,
  opts: PrepareUploadOptions = {},
): Promise<File> {
  const { maxSize = 1600, quality = 0.85, baseName = "upload" } = opts;

  let workingBlob: Blob = input;
  if (isHeic(input)) {
    workingBlob = await heicToJpegBlob(input, quality);
  }

  const img = await loadImage(workingBlob);
  const longest = Math.max(img.naturalWidth, img.naturalHeight);
  const scale = longest > maxSize ? maxSize / longest : 1;
  const targetW = Math.round(img.naturalWidth * scale);
  const targetH = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no soporta canvas");
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const jpegBlob = await canvasToJpegBlob(canvas, quality);
  return new File([jpegBlob], `${baseName}.jpg`, { type: "image/jpeg" });
}
