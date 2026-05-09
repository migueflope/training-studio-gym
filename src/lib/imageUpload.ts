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

async function decodeImage(
  blob: Blob,
): Promise<{ width: number; height: number; bitmap: ImageBitmap | HTMLImageElement }> {
  // createImageBitmap respects EXIF orientation when imageOrientation is set
  // to "from-image" — that fixes iPhone HEIC photos that arrive rotated.
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob, {
        imageOrientation: "from-image",
      });
      return { width: bitmap.width, height: bitmap.height, bitmap };
    } catch {
      // fall through to <img> path if the format isn't supported
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Formato de imagen no soportado"));
      el.src = url;
    });
    return { width: img.naturalWidth, height: img.naturalHeight, bitmap: img };
  } finally {
    URL.revokeObjectURL(url);
  }
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
  /** Rotación adicional en grados (múltiplos de 90). Default 0. */
  rotation?: number;
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
  const {
    maxSize = 1600,
    quality = 0.85,
    baseName = "upload",
    rotation = 0,
  } = opts;
  const rot = ((Math.round(rotation / 90) * 90) % 360 + 360) % 360;

  let workingBlob: Blob = input;
  if (isHeic(input)) {
    try {
      workingBlob = await heicToJpegBlob(input, quality);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      throw new Error(
        `No se pudo convertir HEIC a JPG (${detail}). Tip: en el iPhone, ve a Ajustes → Cámara → Formatos → "Más compatible" para que las fotos se guarden directo en JPG.`,
      );
    }
  }

  const decoded = await decodeImage(workingBlob);
  const longest = Math.max(decoded.width, decoded.height);
  const scale = longest > maxSize ? maxSize / longest : 1;
  const targetW = Math.max(1, Math.round(decoded.width * scale));
  const targetH = Math.max(1, Math.round(decoded.height * scale));
  const swapAxes = rot === 90 || rot === 270;

  const canvas = document.createElement("canvas");
  canvas.width = swapAxes ? targetH : targetW;
  canvas.height = swapAxes ? targetW : targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no soporta canvas");
  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (rot !== 0) ctx.rotate((rot * Math.PI) / 180);
  ctx.drawImage(
    decoded.bitmap as CanvasImageSource,
    -targetW / 2,
    -targetH / 2,
    targetW,
    targetH,
  );
  if ("close" in decoded.bitmap) {
    (decoded.bitmap as ImageBitmap).close();
  }

  const jpegBlob = await canvasToJpegBlob(canvas, quality);
  return new File([jpegBlob], `${baseName}.jpg`, { type: "image/jpeg" });
}
