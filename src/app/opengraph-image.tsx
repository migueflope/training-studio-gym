import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "Training Studio Gym | Cartagena";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const logoBuffer = await readFile(
    path.join(process.cwd(), "public/assets/logo-transparent.png"),
  );
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "60px 80px",
          gap: "60px",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #1a1410 50%, #0a0a0a 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(ellipse at top right, rgba(212, 175, 55, 0.18) 0%, transparent 60%)",
            display: "flex",
          }}
        />
        <img
          src={logoSrc}
          width={420}
          height={500}
          style={{ objectFit: "contain", flexShrink: 0 }}
          alt=""
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "20px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            TRAINING STUDIO
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1,
              color: "#d4af37",
              letterSpacing: "-0.02em",
            }}
          >
            GYM
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 20,
            }}
          >
            <div
              style={{
                width: 60,
                height: 4,
                background: "#d4af37",
                display: "flex",
              }}
            />
            <div
              style={{
                fontSize: 32,
                color: "#e5e5e5",
                fontWeight: 500,
              }}
            >
              Cartagena · Mamonal
            </div>
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#a3a3a3",
              fontWeight: 400,
              marginTop: 8,
              maxWidth: 580,
              lineHeight: 1.3,
            }}
          >
            Entrena la mente. Transforma el cuerpo.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
